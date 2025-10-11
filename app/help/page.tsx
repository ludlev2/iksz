'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  BookOpen, 
  HelpCircle, 
  CheckCircle, 
  AlertTriangle,
  ExternalLink,
  GraduationCap,
  Building2,
  Scale,
  Users,
  Clock,
  Shield
} from 'lucide-react';

const contractTemplates = [
  {
    id: 1,
    title: 'Általános együttműködési megállapodás',
    description: 'Univerzális szerződésminta iskolák és fogadó szervezetek között',
    type: 'Markdown',
    size: '8 KB',
    downloadUrl: '/templates/egyuttmukodesi-megallapodas-altalanos.md',
    features: ['Kötelező tartalmi elemek', 'Biztosítási feltételek', 'Felelősségi szabályok']
  },
  {
    id: 2,
    title: 'Egészségügyi intézmények számára',
    description: 'Kórházak, rendelők és egészségügyi szolgáltatók számára',
    type: 'Markdown',
    size: '12 KB',
    downloadUrl: '/templates/egyuttmukodesi-megallapodas-egeszsegugy.md',
    features: ['Egészségügyi szabályok', 'Higiéniai előírások', 'Szakmai felügyelet', 'Titoktartás']
  },
  {
    id: 3,
    title: 'Jelentkezési lap',
    description: 'Tanuló jelentkezési lapja közösségi szolgálatra',
    type: 'Markdown',
    size: '6 KB',
    downloadUrl: '/templates/jelentkezesi-lap.md',
    features: ['Személyes adatok', 'Preferenciák', 'Képességek', 'Időbeosztás']
  },
  {
    id: 4,
    title: 'Szülői hozzájáruló nyilatkozat',
    description: 'Szülői hozzájárulás és tudnivalók kiskorú diákok számára',
    type: 'Markdown',
    size: '5 KB',
    downloadUrl: '/templates/szuloi-hozzajarulas.md',
    features: ['Hozzájárulási nyilatkozat', 'Egészségügyi adatok', 'Adatkezelési tájékoztató']
  }
];

const legalRequirements = [
  {
    category: 'Kötelező tartalmi elemek',
    icon: FileText,
    items: [
      'Megállapodást aláíró felek adatai és kötelezettségei',
      'Foglalkoztatás időtartama (min. 40 kontakt óra)',
      'Végzett tevékenységek meghatározása',
      'Mentor neve és feladatköre'
    ]
  },
  {
    category: 'Jogszabályi alapok',
    icon: Scale,
    items: [
      '2011. évi CXC. törvény a nemzeti köznevelésről',
      '20/2012. (VIII. 31.) EMMI rendelet',
      'GDPR adatvédelmi követelmények',
      'Nemzeti Alaptanterv előírásai'
    ]
  },
  {
    category: 'Biztosítási szabályok',
    icon: Shield,
    items: [
      '3-18 éves tanulók állami balesetbiztosítása érvényes',
      'Magas kockázatú tevékenységeknél külön intézkedések',
      'Foglalkoztatói felelősségbiztosítás szükségessége',
      'Káresemények bejelentési kötelezettsége'
    ]
  }
];

const stepByStepGuide = [
  {
    step: 1,
    title: 'Szolgálathely kiválasztása',
    description: 'Válassz egy megfelelő szervezetet a 8 törvényi kategória közül',
    tips: ['Érdeklődési köreid alapján', 'Közlekedési lehetőségek figyelembevételével', 'Mentor minőségének ellenőrzésével']
  },
  {
    step: 2,
    title: 'Kapcsolatfelvétel',
    description: 'Vedd fel a kapcsolatot a kiválasztott szervezettel',
    tips: ['Telefonálj vagy írj emailt', 'Mutatkozz be diákként', 'Kérdezz rá az IKSZ lehetőségekről']
  },
  {
    step: 3,
    title: 'Iskola tájékoztatása',
    description: 'Értesítsd az iskolai IKSZ koordinátort',
    tips: ['Add át a szervezet adatait', 'Egyeztessetek a szerződés típusáról', 'Kérj segítséget a papírmunkához']
  },
  {
    step: 4,
    title: 'Szerződés előkészítése',
    description: 'Töltsd ki a szükséges dokumentumokat',
    tips: ['Használj megfelelő sablont', 'Ellenőrizd a kötelező elemeket', 'Kérj szülői aláírást']
  },
  {
    step: 5,
    title: 'Aláírás és kezdés',
    description: 'Írd alá a megállapodást és kezd el a szolgálatot',
    tips: ['Három fél aláírása szükséges', 'Őrizd meg a példányodat', 'Kezdj el naplót vezetni']
  }
];

const faqItems = [
  {
    question: 'Ki készíti el a szerződést?',
    answer: 'Általában az iskola IKSZ koordinátora készíti el a szerződést a megfelelő sablon alapján, de te is segíthetsz az adatok összegyűjtésében.'
  },
  {
    question: 'Mire figyelj a szerződésben?',
    answer: 'Ellenőrizd, hogy minden kötelező elem szerepel-e: felek adatai, időtartam, tevékenységek, mentor neve. Az órakeretet és a biztosítási feltételeket is nézd át.'
  },
  {
    question: 'Mit tegyél, ha a szervezet nem ismeri az IKSZ-t?',
    answer: 'Mutasd meg nekik a jogszabályi hátteret, add át az iskola koordinátorának elérhetőségeit, és ajánld fel segítségüket a szerződés elkészítéséhez.'
  },
  {
    question: 'Mennyibe kerül a szerződéskötés?',
    answer: 'A szerződéskötés ingyenes. Se az iskolának, se a diáknak, se a fogadó szervezetnek nem kell díjat fizetnie a közösségi szolgálat megállapodásért.'
  },
  {
    question: 'Lehet módosítani a szerződést?',
    answer: 'Igen, de csak mind a három fél (diák, iskola, fogadó szervezet) egyetértésével. A módosítást írásban kell rögzíteni.'
  }
];

const usefulLinks = [
  {
    category: 'Hivatalos források',
    links: [
      { title: 'Oktatási Hivatal IKSZ oldala', url: 'https://oktatas.hu/kozneveles/iskolai_kozossegi_szolgalat', description: 'Hivatalos útmutatók és dokumentumok' },
      { title: 'EMMI rendelet teljes szövege', url: 'https://net.jogtar.hu/jogszabaly?docid=A1200020.EMM', description: 'A közösségi szolgálat jogszabályi háttere' },
      { title: 'GYIK az Oktatási Hivatalnál', url: 'https://oktatas.hu/kozneveles/iskolai_kozossegi_szolgalat/gyik', description: 'Gyakran ismételt kérdések és válaszok' }
    ]
  },
  {
    category: 'Gyakorlati segédletek',
    links: [
      { title: 'Váci középiskolai dokumentumcsomag', url: 'https://vacimezo.hu/iksz', description: 'Letölthető szerződésminták és útmutatók' },
      { title: 'ELTE Radnóti gyakorlati példák', url: 'https://radnoti.elte.hu/iksz', description: 'Bevált gyakorlatok és tapasztalatok' },
      { title: 'Magyar Vöröskereszt partnerprogramja', url: 'https://voroskereszt.hu/iksz', description: 'Országos szintű együttműködési lehetőségek' }
    ]
  }
];

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState('templates');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                <GraduationCap className="w-8 h-8" />
                IKSZ Finder
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 mt-2">Szerződés Segítő Központ</h1>
              <p className="text-gray-600 mt-1">
                Minden, amit tudnod kell a közösségi szolgálati szerződésekről
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/student/dashboard">← Vissza a főoldalra</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Sablonok
            </TabsTrigger>
            <TabsTrigger value="legal" className="flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Jogszabályok
            </TabsTrigger>
            <TabsTrigger value="guide" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Útmutató
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              GYIK
            </TabsTrigger>
            <TabsTrigger value="links" className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Hasznos linkek
            </TabsTrigger>
          </TabsList>

          {/* Szerződés sablonok */}
          <TabsContent value="templates" className="mt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Szerződés sablonok</h2>
              <p className="text-gray-600">
                Letölthető szerződésminták különböző típusú fogadó szervezetek számára. 
                Minden sablon tartalmazza a jogszabály által előírt kötelező elemeket.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {contractTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{template.title}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      </div>
                      <Badge variant="secondary">{template.type}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FileText className="w-4 h-4" />
                        {template.size}
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2">Tartalmazza:</h4>
                        <ul className="space-y-1">
                          {template.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button className="w-full mt-4" asChild>
                        <a href={template.downloadUrl} download target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          Letöltés
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900">Fontos tudnivalók</h3>
                  <p className="text-blue-800 text-sm mt-1">
                    A sablonok csak kiindulási pontok. Minden szerződést az iskola IKSZ koordinátorával 
                    és a fogadó szervezettel együtt kell személyre szabni. Az aláírás előtt mindig 
                    ellenőrizd, hogy minden kötelező elem szerepel-e benne.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Jogszabályi követelmények */}
          <TabsContent value="legal" className="mt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Jogszabályi követelmények</h2>
              <p className="text-gray-600">
                A közösségi szolgálati szerződések jogi háttere és kötelező tartalmi elemei.
              </p>
            </div>

            <div className="grid gap-6">
              {legalRequirements.map((requirement, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <requirement.icon className="w-5 h-5 text-blue-600" />
                      {requirement.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {requirement.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-6 bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <Clock className="w-5 h-5" />
                  Időbeosztási szabályok
                </CardTitle>
              </CardHeader>
              <CardContent className="text-yellow-800">
                <ul className="space-y-2">
                  <li>• Minimum 40 &quot;kontakt óra&quot; + maximum 5 óra felkészítés + maximum 5 óra lezárás</li>
                  <li>• Tanítási napon maximum 3 óra, egyéb napon maximum 5 óra</li>
                  <li>• A szolgálat teljesítésére 3 tanév áll rendelkezésre</li>
                  <li>• Nyári szünetben intenzívebb ütemezés is lehetséges</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lépésről lépésre útmutató */}
          <TabsContent value="guide" className="mt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Lépésről lépésre útmutató</h2>
              <p className="text-gray-600">
                Hogyan szerezz be szerződést a közösségi szolgálathoz? Itt minden lépést megtalálsz.
              </p>
            </div>

            <div className="space-y-6">
              {stepByStepGuide.map((step) => (
                <Card key={step.step} className="relative">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        {step.step}
                      </div>
                      <div>
                        <CardTitle>{step.title}</CardTitle>
                        <p className="text-gray-600 text-sm mt-1">{step.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="ml-12">
                      <h4 className="font-medium mb-2 text-sm">Hasznos tippek:</h4>
                      <ul className="space-y-1">
                        {step.tips.map((tip, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-6 bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-medium text-green-900">Kérj segítséget!</h3>
                    <p className="text-green-800 text-sm">
                      Ha bármilyen kérdésed van, ne habozz megkeresni az iskolai IKSZ koordinátort. 
                      Ők segíteni fognak a szerződés elkészítésében és minden adminisztratív kérdésben.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GYIK */}
          <TabsContent value="faq" className="mt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Gyakran ismételt kérdések</h2>
              <p className="text-gray-600">
                A leggyakrabban feltett kérdések és válaszok a szerződésekkel kapcsolatban.
              </p>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-blue-600" />
                      {item.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{item.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-6 bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <h3 className="font-medium text-blue-900 mb-2">Nem találod a válaszod?</h3>
                <p className="text-blue-800 text-sm mb-4">
                  Ha kérdésed van, amit itt nem találsz meg, vedd fel a kapcsolatot velünk 
                  vagy az iskolai koordinátoroddal.
                </p>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Kapcsolat felvétele
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hasznos linkek */}
          <TabsContent value="links" className="mt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Hasznos linkek és források</h2>
              <p className="text-gray-600">
                Külső források, hivatalos oldalak és további információk a közösségi szolgálatról.
              </p>
            </div>

            <div className="space-y-8">
              {usefulLinks.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{category.category}</h3>
                  <div className="grid gap-4">
                    {category.links.map((link, linkIndex) => (
                      <Card key={linkIndex} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">{link.title}</h4>
                              <p className="text-sm text-gray-600">{link.description}</p>
                            </div>
                            <Button size="sm" variant="outline" className="ml-4" asChild>
                              <a href={link.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4 mr-1" />
                                Megnyitás
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
