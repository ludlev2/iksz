import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Building2, UserCheck, ArrowRight, CheckCircle, Users, Clock, MapPin } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">IKSZ Finder</h1>
          </div>
          {/* <Link href="/login">
            <Button variant="outline" className="border-gray-200 hover:bg-gray-50">
              Bejelentkezés
            </Button>
          </Link> */}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <CheckCircle className="w-4 h-4" />
              Több mint 1000+ diák használja már
            </div>
            
            <h2 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Teljesítsd az
              <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                IKSZ óráidat
              </span>
              egyszerűen
            </h2>
            
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Találj közösségi szolgálat lehetőségeket a közeledben és kövesd nyomon 
              az 50 órás kötelezettséged teljesítését modern, intuitív felületen.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/student">
                <Button size="lg" className="bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all">
                  Kezdés diákként
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-2 border-gray-200 hover:border-gray-300 px-8 py-4 text-lg rounded-xl">
                  Szervezőként csatlakozás
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">1,200+</div>
                <div className="text-gray-600">Aktív diák</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">150+</div>
                <div className="text-gray-600">Partner szervezet</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">25,000+</div>
                <div className="text-gray-600">Teljesített óra</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Minden, amire szükséged van
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Egy helyen minden eszköz az IKSZ órák sikeres teljesítéséhez
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Students */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">Diákoknak</h4>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Keress és jelentkezz programokra, kövesd órák állását valós időben.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">Helyszín alapú keresés</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">Órák nyomon követése</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">Automatikus jóváhagyás</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Providers */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-linear-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">Szervezőknek</h4>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Hozz létre programokat és kezelj jelentkezőket egyszerűen.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Jelentkezők kezelése</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Jelenlét nyilvántartás</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Egyszerű program létrehozás</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Teachers */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-linear-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <UserCheck className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">Tanároknak</h4>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Hagyd jóvá diákjaid óráit és exportálj hivatalos jelentéseket.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-purple-500" />
                    <span className="text-gray-700">Tömeges jóváhagyás</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-purple-500" />
                    <span className="text-gray-700">Diákok nyomon követése</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-purple-500" />
                    <span className="text-gray-700">PDF jelentések</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-linear-to-br from-blue-600 via-purple-600 to-blue-700">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Kezdd el még ma!
          </h3>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed">
            Csatlakozz több ezer diákhoz, akik már sikeresen teljesítették IKSZ óráikat
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-50 px-10 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all">
              Ingyenes regisztráció
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-8 bg-linear-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">IKSZ Finder</span>
          </div>
          <p className="text-gray-400 text-lg">
            © 2025 IKSZ Finder. Minden jog fenntartva.
          </p>
        </div>
      </footer>
    </div>
  );
}