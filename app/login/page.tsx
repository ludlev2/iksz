'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success && result.user) {
        toast.success('Sikeres bejelentkezés!');
        
        // Redirect based on user role
        switch (result.user.role) {
          case 'student':
            router.push('/student/dashboard');
            break;
          case 'provider':
            router.push('/provider/dashboard');
            break;
          case 'teacher':
            router.push('/teacher/admin');
            break;
          default:
            router.push('/');
        }
      } else {
        toast.error('Hibás email vagy jelszó!');
      }
    } catch (error) {
      toast.error('Hiba történt a bejelentkezés során!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
            <GraduationCap className="w-8 h-8" />
            IKSZ Finder
          </Link>
          <p className="text-gray-600 mt-2">Jelentkezz be a fiókodba</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>Bejelentkezés</CardTitle>
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

            {/* Demo Accounts */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 mb-3">Demo fiókok teszteléshez:</p>
              <div className="space-y-2 text-xs">
                <div className="bg-blue-50 p-2 rounded">
                  <strong>Diák:</strong> student@test.com / password123
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <strong>Szervező:</strong> provider@test.com / password123
                </div>
                <div className="bg-purple-50 p-2 rounded">
                  <strong>Tanár:</strong> teacher@test.com / password123
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            ← Vissza a főoldalra
          </Link>
        </div>
      </div>
    </div>
  );
}