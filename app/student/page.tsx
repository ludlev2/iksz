'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Eye, EyeOff, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function StudentPage() {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
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

  const handleContinueWithoutLogin = () => {
    router.push('/student/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success && result.user) {
        switch (result.user.role) {
          case 'student':
            toast.success('Sikeres bejelentkezés!');
            router.push('/student/dashboard');
            break;
          case 'admin':
            toast.success('Admin bejelentkezés sikeres!');
            router.push('/admin/submissions');
            break;
          default:
            toast.error('Ez a fiók nem diák fiók!');
            break;
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
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
        grade
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
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            <GraduationCap className="w-8 h-8" />
            IKSZ Finder
          </Link>
          <p className="text-gray-600 mt-2">Diák portál</p>
        </div>

        {!isLoginMode && !isRegisterMode ? (
          /* Landing Options */
          <Card>
            <CardHeader>
              <CardTitle>Válassz egy opciót</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleContinueWithoutLogin}
                className="w-full h-12 text-left justify-start"
                variant="outline"
                type="button"
              >
                <Search className="w-5 h-5 mr-3" />
                <div>
                  <div className="font-medium">Folytatás regisztráció nélkül</div>
                  <div className="text-xs text-gray-500">Böngészd a lehetőségeket</div>
                </div>
              </Button>

              <Button 
                onClick={() => setIsLoginMode(true)}
                className="w-full h-12 text-left justify-start"
              >
                <GraduationCap className="w-5 h-5 mr-3" />
                <div>
                  <div className="font-medium">Bejelentkezés / Regisztráció</div>
                  <div className="text-xs text-white/80">Követsd az órák teljesítését</div>
                </div>
              </Button>

              <div className="text-center pt-4">
                <Link href="/" className="text-sm text-blue-600 hover:underline">
                  ← Vissza a főoldalra
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : isLoginMode && !isRegisterMode ? (
          /* Login Form */
          <Card>
            <CardHeader>
              <CardTitle>Diák bejelentkezés</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email cím
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pelda@email.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Jelszó
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Bejelentkezés...' : 'Bejelentkezés'}
                </Button>
              </form>

              <div className="mt-4 text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Nincs még fiókod?{' '}
                  <button
                    type="button"
                    onClick={() => setIsRegisterMode(true)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Regisztrálj itt
                  </button>
                </p>
                <Button 
                  variant="ghost" 
                  onClick={() => setIsLoginMode(false)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  ← Vissza az opciókhoz
                </Button>
              </div>

              {/* Demo Account */}
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-3">Demo fiók teszteléshez:</p>
                <div className="bg-blue-50 p-2 rounded text-xs">
                  <strong>Diák:</strong> student@test.com / password123
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Registration Form */
          <Card>
            <CardHeader>
              <CardTitle>Diák regisztráció</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Teljes név
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Példa Péter"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email cím
                  </label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pelda@email.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-1">
                    Iskola neve
                  </label>
                  <Input
                    id="school"
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                    placeholder="Példa Gimnázium"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                    Évfolyam
                  </label>
                  <Input
                    id="grade"
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="11"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Jelszó
                  </label>
                  <div className="relative">
                    <Input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Jelszó megerősítése
                  </label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Regisztráció...' : 'Regisztráció'}
                </Button>
              </form>

              <div className="mt-4 text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Van már fiókod?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(false);
                      // Clear form
                      setPassword('');
                      setConfirmPassword('');
                    }}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Jelentkezz be itt
                  </button>
                </p>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setIsLoginMode(false);
                    setIsRegisterMode(false);
                    // Clear form
                    setEmail('');
                    setPassword('');
                    setConfirmPassword('');
                    setName('');
                    setSchool('');
                    setGrade('');
                  }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  ← Vissza az opciókhoz
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
