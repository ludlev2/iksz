import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Building2, UserCheck, Search, MapPin, Clock, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">IKSZ Finder</h1>
          </div>
          <Link href="/login">
            <Button variant="outline">Bejelentkezés</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Teljesítsd az <span className="text-blue-600">IKSZ</span> óráidat
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Találj közösségi szolgálat lehetőségeket a közeledben és kövesd nyomon 
            az 50 órás kötelezettséged teljesítését egyszerűen és hatékonyan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="text-lg px-8 py-6">
                Kezdés diákként
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Szervezőként csatlakozás
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Hogyan működik?
        </h3>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Students */}
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Diákoknak</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 text-left">
                <Search className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Keresés és szűrés</p>
                  <p className="text-sm text-gray-600">Találj lehetőségeket távolság, kategória és dátum szerint</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-left">
                <MapPin className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Jelentkezés</p>
                  <p className="text-sm text-gray-600">Egy kattintással jelentkezz a kiválasztott programokra</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-left">
                <Clock className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Órák nyomon követése</p>
                  <p className="text-sm text-gray-600">Kövesd a teljesített és függőben lévő óráidat</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Providers */}
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-xl">Szervezőknek</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 text-left">
                <Search className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Programok létrehozása</p>
                  <p className="text-sm text-gray-600">Hozz létre új önkéntes lehetőségeket egyszerűen</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-left">
                <MapPin className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Jelentkezők kezelése</p>
                  <p className="text-sm text-gray-600">Kövesd a jelentkezőket és a kapacitást</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-left">
                <Clock className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Jelenlét exportálása</p>
                  <p className="text-sm text-gray-600">Exportáld a résztvevők listáját és jelenlétét</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teachers */}
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Tanároknak</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 text-left">
                <Search className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Programok jóváhagyása</p>
                  <p className="text-sm text-gray-600">Hagyd jóvá a diákok által választott programokat</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-left">
                <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Órák ellenőrzése</p>
                  <p className="text-sm text-gray-600">Tömeges jóváhagyás és órák ellenőrzése</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-left">
                <Clock className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Hivatalos jelentés</p>
                  <p className="text-sm text-gray-600">PDF exportálás a hivatalos dokumentációhoz</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Kezdd el még ma!
          </h3>
          <p className="text-xl mb-8 text-blue-100">
            Csatlakozz több ezer diákhoz, akik már használják az IKSZ Finder-t
          </p>
          <Link href="/login">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Regisztráció
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="w-6 h-6" />
            <span className="text-lg font-semibold">IKSZ Finder</span>
          </div>
          <p className="text-gray-400">
            © 2024 IKSZ Finder. Minden jog fenntartva.
          </p>
        </div>
      </footer>
    </div>
  );
}