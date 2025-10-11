'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  GraduationCap,
  Eye,
  EyeOff,
  Check,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type ViewMode = 'landing' | 'login' | 'register';

export default function StudentPage() {
  const [view, setView] = useState<ViewMode>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuth();
  const router = useRouter();

  const switchView = (next: ViewMode) => {
    setView(next);
    setIsLoading(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleContinueWithoutLogin = () => {
    router.push('/student/dashboard');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success && result.user) {
        if (result.user.role === 'student') {
          toast.success('Sikeres bejelentkezés!');
          router.push('/student/dashboard');
        } else if (result.user.role === 'admin') {
          toast.success('Admin bejelentkezés sikeres!');
          router.push('/admin/submissions');
        } else {
          toast.error('Ez a fiók nem diák fiók!');
        }
      } else {
        toast.error(result.error ?? 'Hibás email vagy jelszó!');
      }
    } catch (error) {
      toast.error('Hiba történt a bejelentkezés során!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error('A jelszavak nem egyeznek!');
      return;
    }

    if (password.length < 6) {
      toast.error('A jelszónak legalább 6 karakter hosszúnak kell lennie!');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({
        email,
        password,
        name,
        school,
        grade,
      });

      if (result.success && result.user) {
        toast.success('Sikeres regisztráció!');
        router.push('/student/dashboard');
      } else {
        toast.error(result.error ?? 'Hiba történt a regisztráció során!');
      }
    } catch (error) {
      toast.error('Hiba történt a regisztráció során!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(36,99,235,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(236,72,153,0.16),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-grid-white/[0.04] opacity-60" />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="grid w-full max-w-6xl items-center gap-12 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.95fr)]">
          <aside className="space-y-10 text-white">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xl font-semibold text-slate-200 transition hover:text-white"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
                <GraduationCap className="h-6 w-6" />
              </div>
              IKSZ Finder
            </Link>

            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
                Teljesítsd az 50 IKSZ órádat magabiztosan.
              </h1>
              <p className="max-w-xl text-sm text-slate-200/80">
                Fedezz fel hiteles önkéntes lehetőségeket, tartsd nyomon az előrehaladásodat,
                és kérj jóváhagyást a tanáraidtól egyetlen felületen.
              </p>
            </div>

            <div className="space-y-4">
              {FEATURES.map((feature) => (
                <FeatureItem key={feature.title} title={feature.title} description={feature.description} />
              ))}
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
              <Button
                size="lg"
                onClick={() => switchView('register')}
                className="h-12 rounded-xl bg-white px-8 text-slate-900 shadow-lg transition hover:bg-slate-100"
              >
                Regisztráció diákként
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleContinueWithoutLogin}
                className="h-12 rounded-xl border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
              >
                Böngészés vendégként
              </Button>
            </div>
          </aside>

          <section className="max-w-md justify-self-center md:justify-self-end">
            {view === 'landing' && (
              <LandingCard
                onLogin={() => switchView('login')}
                onRegister={() => switchView('register')}
                onContinue={handleContinueWithoutLogin}
              />
            )}

            {view === 'login' && (
              <div className="shadow-input relative w-full rounded-3xl border border-white/10 bg-white/[0.07] p-6 text-white backdrop-blur md:p-8">
                <button
                  type="button"
                  onClick={() => switchView('landing')}
                  className="absolute left-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-slate-200 transition hover:bg-white/20 md:left-6 md:top-6"
                  aria-label="Vissza az opciókhoz"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                <div className="mt-6 space-y-2 md:mt-8">
                  <h2 className="text-2xl font-semibold">Bejelentkezés</h2>
                  <p className="text-sm text-slate-200/75">
                    Lépj be a fiókodba, és kövesd nyomon az IKSZ óráid teljesítését.
                  </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                  <LabelInputContainer>
                    <Label htmlFor="login-email">Email cím</Label>
                    <Input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="pelda@email.hu"
                      required
                      className="h-11 rounded-xl border-white/20 bg-white/5 text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-400"
                    />
                  </LabelInputContainer>

                  <LabelInputContainer>
                    <Label htmlFor="login-password">Jelszó</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="••••••••"
                        required
                        className="h-11 rounded-xl border-white/20 bg-white/5 pr-12 text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((previous) => !previous)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-300 transition hover:text-white"
                        aria-label={showPassword ? 'Jelszó elrejtése' : 'Jelszó megjelenítése'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </LabelInputContainer>

                  <GradientButton type="submit" disabled={isLoading}>
                    {isLoading ? 'Bejelentkezés...' : 'Bejelentkezés'}
                    <ArrowRight className="h-4 w-4" />
                  </GradientButton>
                </form>

                <div className="mt-6 space-y-2 text-center text-sm text-slate-200/75">
                  <p>
                    Nincs még fiókod?{' '}
                    <button
                      type="button"
                      onClick={() => switchView('register')}
                      className="font-semibold text-white underline-offset-4 transition hover:underline"
                    >
                      Regisztrálj itt
                    </button>
                  </p>
                  <button
                    type="button"
                    onClick={() => switchView('landing')}
                    className="text-xs text-slate-300/80 underline-offset-4 transition hover:text-white hover:underline"
                  >
                    Vissza az opciókhoz
                  </button>
                </div>
              </div>
            )}

            {view === 'register' && (
              <div className="shadow-input relative w-full rounded-3xl border border-white/10 bg-white/[0.07] p-6 text-white backdrop-blur md:p-8">
                <button
                  type="button"
                  onClick={() => switchView('landing')}
                  className="absolute left-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-slate-200 transition hover:bg-white/20 md:left-6 md:top-6"
                  aria-label="Vissza az opciókhoz"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>

                <div className="mt-6 space-y-2 md:mt-8">
                  <h2 className="text-2xl font-semibold">Új diák fiók létrehozása</h2>
                  <p className="text-sm text-slate-200/75">
                    Foglalj le műszakokat, mentsd a kedvenceidet és tartsd kézben az IKSZ teljesítési
                    folyamataidat.
                  </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                  <LabelInputContainer>
                    <Label htmlFor="register-name">Teljes név</Label>
                    <Input
                      id="register-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Név vezeték és keresztnév"
                      required
                      className="h-11 rounded-xl border-white/20 bg-white/5 text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-400"
                    />
                  </LabelInputContainer>

                  <LabelInputContainer>
                    <Label htmlFor="register-email">Email cím</Label>
                    <Input
                      id="register-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="pelda@email.hu"
                      required
                      className="h-11 rounded-xl border-white/20 bg-white/5 text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-400"
                    />
                  </LabelInputContainer>

                  <div className="grid gap-4 md:grid-cols-2">
                    <LabelInputContainer>
                      <Label htmlFor="register-password">Jelszó</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          placeholder="••••••••"
                          required
                          className="h-11 rounded-xl border-white/20 bg-white/5 pr-12 text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((previous) => !previous)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-300 transition hover:text-white"
                          aria-label={showPassword ? 'Jelszó elrejtése' : 'Jelszó megjelenítése'}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </LabelInputContainer>

                    <LabelInputContainer>
                      <Label htmlFor="register-confirm">Jelszó megerősítése</Label>
                      <div className="relative">
                        <Input
                          id="register-confirm"
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          placeholder="••••••••"
                          required
                          className="h-11 rounded-xl border-white/20 bg-white/5 pr-12 text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((previous) => !previous)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-300 transition hover:text-white"
                          aria-label={showConfirmPassword ? 'Jelszó elrejtése' : 'Jelszó megjelenítése'}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </LabelInputContainer>
                  </div>

                  <LabelInputContainer>
                    <Label htmlFor="register-school">Iskola neve</Label>
                    <Input
                      id="register-school"
                      value={school}
                      onChange={(event) => setSchool(event.target.value)}
                      placeholder="Iskolád neve"
                      className="h-11 rounded-xl border-white/20 bg-white/5 text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-400"
                    />
                  </LabelInputContainer>

                  <LabelInputContainer>
                    <Label htmlFor="register-grade">Évfolyam</Label>
                    <Input
                      id="register-grade"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={14}
                      value={grade}
                      onChange={(event) => setGrade(event.target.value)}
                      placeholder="Pl. 11"
                      className="h-11 rounded-xl border-white/20 bg-white/5 text-white placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-400"
                    />
                  </LabelInputContainer>

                  <GradientButton type="submit" disabled={isLoading}>
                    {isLoading ? 'Regisztráció...' : 'Regisztráció'}
                    <ArrowRight className="h-4 w-4" />
                  </GradientButton>
                </form>

                <div className="mt-6 space-y-2 text-center text-sm text-slate-200/75">
                  <p>
                    Van már fiókod?{' '}
                    <button
                      type="button"
                      onClick={() => switchView('login')}
                      className="font-semibold text-white underline-offset-4 transition hover:underline"
                    >
                      Jelentkezz be
                    </button>
                  </p>
                  <button
                    type="button"
                    onClick={() => switchView('landing')}
                    className="text-xs text-slate-300/80 underline-offset-4 transition hover:text-white hover:underline"
                  >
                    Vissza az opciókhoz
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    title: 'Hitelesített szervezetek',
    description: 'Csak ellenőrzött, IKSZ-re alkalmas partnerekkel dolgozunk.',
  },
  {
    title: 'Okos óra-követés',
    description: 'Nyomon követheted a teljesített óráidat és a jóváhagyás státuszát.',
  },
  {
    title: 'Lépésről lépésre támogatás',
    description: 'Sablonok, emlékeztetők és útmutatók segítik a gyors ügyintézést.',
  },
] as const;

function LandingCard({
  onLogin,
  onRegister,
  onContinue,
}: {
  onLogin: () => void;
  onRegister: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="shadow-input w-full rounded-3xl border border-white/10 bg-white/[0.07] p-6 text-white backdrop-blur md:p-8">
      <h2 className="text-2xl font-semibold">Készen állsz a kezdésre?</h2>
      <p className="mt-2 text-sm text-slate-200/80">
        Hozz létre egy diák fiókot néhány perc alatt, vagy jelentkezz be, ha már regisztráltál.
      </p>

      <div className="mt-8 space-y-3">
        <GradientButton type="button" onClick={onRegister}>
          Regisztráció diákoknak
          <ArrowRight className="h-4 w-4" />
        </GradientButton>

        <button
          type="button"
          onClick={onLogin}
          className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        >
          Már van fiókom
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </button>

        <Button
          type="button"
          variant="ghost"
          onClick={onContinue}
          className="h-11 w-full rounded-xl text-slate-200 hover:bg-white/10 hover:text-white"
        >
          Böngészés vendégként
        </Button>
      </div>

      <div className="mt-6 border-t border-white/10 pt-4 text-center text-xs text-slate-300/70">
        <Link href="/" className="hover:text-white hover:underline">
          ← Vissza a főoldalra
        </Link>
      </div>
    </div>
  );
}

function GradientButton({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cn(
        'group/btn relative flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 font-semibold text-white shadow-[0px_1px_0px_0px_rgba(255,255,255,0.25)_inset,0px_-1px_0px_0px_rgba(255,255,255,0.15)_inset] transition duration-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-70',
        className,
      )}
    >
      {children}
      <BottomGradient />
    </button>
  );
}

const BottomGradient = () => (
  <>
    <span className="pointer-events-none absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500/70 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    <span className="pointer-events-none absolute inset-x-14 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-purple-500/70 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
  </>
);

function LabelInputContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn('flex w-full flex-col space-y-2', className)}>{children}</div>;
}

function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-blue-200">
        <Check className="h-4 w-4" />
      </div>
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-xs text-slate-200/70">{description}</p>
      </div>
    </div>
  );
}
