'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

import { createClient } from '@/utils/supabase/client';

const DEFAULT_TARGET_HOURS = 50;

type UserRole = 'student' | 'provider' | 'teacher' | 'admin';

interface AuthUser {
  id: string;
  email: string | null;
  role: UserRole;
  name: string;
  school: string | null;
  grade: number | null;
  targetHours: number;
  completedHours: number;
  pendingHours: number;
}

interface LoginResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  school: string;
  grade: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (data: RegisterData) => Promise<LoginResult>;
  logout: () => Promise<void>;
  session: Session | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapProfileRole = (role: string | null | undefined): UserRole => {
  switch (role) {
    case 'teacher':
      return 'teacher';
    case 'organization_admin':
      return 'provider';
    case 'admin':
      return 'admin';
    default:
      return 'student';
  }
};

const toHours = (value: number | string | null): number => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  return 0;
};

const getSchoolFromPreferences = (preferences: unknown): string | null => {
  if (!preferences || typeof preferences !== 'object') {
    return null;
  }

  const record = preferences as Record<string, unknown>;
  if (typeof record.schoolName === 'string') {
    return record.schoolName;
  }

  if (typeof record.school === 'string') {
    return record.school;
  }

  return null;
};

export function AuthProvider({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession: Session | null;
}) {
  const [supabase] = useState(() => createClient());
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(initialSession);
  const [isSessionLoading, setIsSessionLoading] = useState(!initialSession);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const fetchHourAggregates = useCallback(
    async (profileId: string) => {
      const { data, error } = await supabase
        .from('hour_logs')
        .select('status, duration_hours')
        .eq('student_id', profileId);

      if (error) {
        console.error('Error loading hour logs:', error);
        return { completedHours: 0, pendingHours: 0 };
      }

      const logs =
        (data as Array<{
          status: string | null;
          duration_hours: number | string | null;
        }>) ?? [];

      return logs.reduce(
        (accumulator, entry) => {
          const duration = toHours(entry.duration_hours);
          if (entry.status === 'approved') {
            accumulator.completedHours += duration;
          } else if (entry.status === 'submitted') {
            accumulator.pendingHours += duration;
          }
          return accumulator;
        },
        { completedHours: 0, pendingHours: 0 },
      );
    },
    [supabase],
  );

  const hydrateUser = useCallback(
    async (supabaseUser: SupabaseUser): Promise<AuthUser | null> => {
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, full_name')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        return null;
      }

      let profileRecord = existingProfile;

      if (!profileRecord) {
        const { data: createdProfile, error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: supabaseUser.id,
            role: 'student',
            full_name: supabaseUser.email ?? 'IKSZ diák',
          })
          .select('id, role, full_name')
          .maybeSingle();

        if (createProfileError) {
          console.error('Error creating profile:', createProfileError);
          return null;
        }

        profileRecord = createdProfile ?? null;
      }

      if (!profileRecord) {
        return null;
      }

      const mappedRole = mapProfileRole(profileRecord.role);

      if (mappedRole !== 'student') {
        return {
          id: profileRecord.id,
          email: supabaseUser.email ?? null,
          role: mappedRole,
          name: profileRecord.full_name ?? supabaseUser.email ?? 'Felhasználó',
          school: null,
          grade: null,
          targetHours: DEFAULT_TARGET_HOURS,
          completedHours: 0,
          pendingHours: 0,
        };
      }

      const {
        data: studentProfile,
        error: studentProfileError,
      } = await supabase
        .from('student_profiles')
        .select('grade, target_hours, preferences')
        .eq('profile_id', profileRecord.id)
        .maybeSingle();

      if (studentProfileError) {
        console.error('Error loading student profile:', studentProfileError);
      }

      let resolvedStudentProfile = studentProfile ?? null;

      if (!resolvedStudentProfile) {
        const {
          data: createdStudentProfile,
          error: createStudentProfileError,
        } = await supabase
          .from('student_profiles')
          .insert({
            profile_id: profileRecord.id,
            target_hours: DEFAULT_TARGET_HOURS,
          })
          .select('grade, target_hours, preferences')
          .maybeSingle();

        if (createStudentProfileError) {
          console.error('Error creating student profile:', createStudentProfileError);
        } else {
          resolvedStudentProfile = createdStudentProfile ?? null;
        }
      }

      const hourTotals = await fetchHourAggregates(profileRecord.id);

      return {
        id: profileRecord.id,
        email: supabaseUser.email ?? null,
        role: mappedRole,
        name: profileRecord.full_name ?? supabaseUser.email ?? 'Felhasználó',
        school: getSchoolFromPreferences(resolvedStudentProfile?.preferences ?? null),
        grade: resolvedStudentProfile?.grade ?? null,
        targetHours: resolvedStudentProfile?.target_hours ?? DEFAULT_TARGET_HOURS,
        completedHours: hourTotals.completedHours,
        pendingHours: hourTotals.pendingHours,
      };
    },
    [fetchHourAggregates, supabase],
  );

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      setIsSessionLoading(true);

      try {
        const { data, error } = await supabase.auth.getSession();

        if (!isMounted) {
          return;
        }

        if (error) {
          console.error('Error fetching session:', error);
          setSession(null);
          return;
        }

        setSession(data.session ?? null);
        if (data.session?.access_token && data.session?.refresh_token) {
          try {
            await fetch('/auth/session', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                event: 'INITIAL_SESSION',
                session: {
                  access_token: data.session.access_token,
                  refresh_token: data.session.refresh_token,
                },
              }),
            });
          } catch (error) {
            console.error('Error syncing initial session:', error);
          }
        }
      } catch (error) {
        console.error('Unexpected error during session fetch:', error);
        if (isMounted) {
          setSession(null);
        }
      } finally {
        if (isMounted) {
          setIsSessionLoading(false);
        }
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);
      setIsSessionLoading(false);

       try {
        await fetch('/auth/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event,
            session: nextSession
              ? {
                  access_token: nextSession.access_token,
                  refresh_token: nextSession.refresh_token,
                }
              : null,
          }),
        });
      } catch (error) {
        console.error('Error syncing auth change:', error);
      }

      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        router.refresh();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  useEffect(() => {
    let isCancelled = false;

    const hydrate = async () => {
      if (!session?.user) {
        setUser(null);
        return;
      }

      setIsProfileLoading(true);
      try {
        const hydrated = await hydrateUser(session.user);
        if (!isCancelled) {
          setUser(hydrated);
        }
      } catch (error) {
        console.error('Error hydrating user profile:', error);
        if (!isCancelled) {
          setUser(null);
        }
      } finally {
        if (!isCancelled) {
          setIsProfileLoading(false);
        }
      }
    };

    hydrate();

    return () => {
      isCancelled = true;
    };
  }, [hydrateUser, session]);

  const isLoading = isSessionLoading || isProfileLoading;

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
      }

      const authUser = data.user;

      if (!authUser) {
        return {
          success: false,
          error: 'A felhasználói adatok nem elérhetők a bejelentkezéshez.',
        };
      }

      const hydrated = await hydrateUser(authUser);

      if (!hydrated) {
        return {
          success: false,
          error: 'Nem sikerült betölteni a felhasználói profilt.',
        };
      }

      setUser(hydrated);
      return { success: true, user: hydrated };
    },
    [hydrateUser, supabase],
  );

  const register = useCallback(
    async (data: RegisterData): Promise<LoginResult> => {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
          },
        },
      });

      if (signUpError) {
        console.error('Registration error:', signUpError);
        return { success: false, error: signUpError.message };
      }

      const authUser = signUpData.user;

      if (!authUser) {
        return {
          success: false,
          error:
            'A regisztráció sikeres volt, de nem kaptunk vissza felhasználói adatokat. Kérlek ellenőrizd az emailed.',
        };
      }

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: authUser.id,
        role: 'student',
        full_name: data.name,
      });

      if (profileError) {
        console.error('Profile upsert error:', profileError);
        return { success: false, error: profileError.message };
      }

      const parsedGrade = Number.parseInt(data.grade, 10);
      const preferences = data.school ? { schoolName: data.school } : null;

      const { error: studentProfileError } = await supabase
        .from('student_profiles')
        .upsert({
          profile_id: authUser.id,
          grade: Number.isNaN(parsedGrade) ? null : parsedGrade,
          target_hours: DEFAULT_TARGET_HOURS,
          preferences,
        });

      if (studentProfileError) {
        console.error('Student profile upsert error:', studentProfileError);
        return { success: false, error: studentProfileError.message };
      }

      const hydrated = await hydrateUser(authUser);

      if (!hydrated) {
        return {
          success: true,
        };
      }

      setUser(hydrated);
      return { success: true, user: hydrated };
    },
    [hydrateUser, supabase],
  );

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    setSession(null);
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        session,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
