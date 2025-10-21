import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight, GraduationCap, LucideIcon, MapPin, ShieldCheck, Clock } from 'lucide-react';
import { HeroHighlight, Highlight } from '@/components/aceternity/hero-highlight';
import { BentoGrid, BentoGridItem } from '@/components/aceternity/bento-grid';
import { InfiniteMovingCards } from '@/components/aceternity/infinite-moving-cards';
import { HeroVisualizer } from '@/components/home/hero-visualizer';

const HERO_STATS = [
  { label: 'Aktív diák', value: '1 200+' },
  { label: 'Partner szervezet', value: '150+' },
  { label: 'Jóváhagyott óra', value: '25 000+' },
] as const;

const FEATURE_CARDS: Array<{
  icon: LucideIcon;
  title: string;
  description: string;
}> = [
  {
    icon: MapPin,
    title: 'Okos helykereső',
    description:
      'Térképes nézet, személyre szabott szűrők és értesítések, hogy mindig megtaláld az ideális lehetőséget.',
  },
  {
    icon: ShieldCheck,
    title: 'Megbízható partnerek',
    description:
      'Csak validált szervezetek és tanári jóváhagyási folyamatok, hogy az óráid biztosan elszámolhatóak legyenek.',
  },
  {
    icon: Clock,
    title: 'Automatikus nyomon követés',
    description:
      'Átlátható irányítópult, óra-összesítés, dokumentumminták és tanári értesítések egyetlen felületen.',
  },
];

const JOURNEY_STEPS: Array<{
  title: string;
  description: string;
}> = [
  {
    title: '1. Találj hiteles lehetőséget',
    description:
      'Böngéssz térképen, nézd meg a részletes leírásokat, kapacitásokat és regisztrálj néhány kattintással.',
  },
  {
    title: '2. Jelentkezz és gyűjtsd az órákat',
    description:
      'A szervező visszajelzését azonnal látod, műszakjaidat nyomon követheted és emlékeztetőt kapsz.',
  },
  {
    title: '3. Tanári jóváhagyás egyetlen gombbal',
    description:
      'A rendszer automatikusan elkészíti a jelentést, a tanár pedig mobilról is jóváhagyhatja az óráidat.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Fanni · 11.B',
    role: 'Fazekas Mihály Gimnázium',
    quote:
      'Az IKSZ Finderrel két hét alatt sikerült kimaxolnom a kötelező órákat. A térképes nézet életmentő, a kedvenceimet be tudtam ütemezni a saját naptáramba.',
  },
  {
    name: 'Péter · koordinátor',
    role: 'Máltai Szeretetszolgálat',
    quote:
      'Végre egy rendszer, ahol valós időben látjuk a jelentkezőket. A diákok komolyabb kommunikációval érkeznek, minden infót megkapnak előre.',
  },
  {
    name: 'Anna · IKSZ felelős',
    role: 'ELTE Radnóti',
    quote:
      'Évente 300+ diák óráit követjük, a jelentések generálása percekre rövidült. A tanári irányítópult nélkül már el sem tudnám képzelni.',
  },
] as const;

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#12346b] via-[#0f2752] to-[#0a2146] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(147,197,253,0.3),transparent_62%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(129,196,253,0.22),transparent_58%)]" />
      <div className="pointer-events-none absolute inset-0 bg-grid-white/[0.07] opacity-90" />

      <header className="sticky top-0 z-30 border-b border-white/15 bg-slate-900/75 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2 font-semibold text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
              <GraduationCap className="h-5 w-5" />
            </div>
            IKSZ Finder
            <span className="text-xs font-normal text-slate-200/70">beta</span>
          </Link>
          <div className="hidden items-center gap-3 text-sm text-slate-100/80 md:flex">
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">Diákoknak</span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">Szervezőknek</span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">Tanároknak</span>
          </div>
          <Link href="/student">
            <Button className="hidden rounded-xl bg-white text-slate-900 shadow-md hover:bg-slate-100 md:block">
              Belépés
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10">
        <HeroSection />
        <LogosSection />
        <FeaturesSection />
        <JourneySection />
        <TestimonialsSection />
        <CtaSection />
      </main>

      <footer className="relative z-10 border-t border-white/15 bg-slate-900/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-center text-sm text-slate-200/70 md:flex-row md:items-center md:justify-between md:text-left">
          <p>© {new Date().getFullYear()} IKSZ Finder. Minden jog fenntartva.</p>
          <div className="flex items-center justify-center gap-4 text-xs text-slate-200/70">
            <Link href="/help" className="hover:text-white">
              Segítség
            </Link>
            <span aria-hidden>•</span>
            <Link href="/login" className="hover:text-white">
              Szervezői belépés
            </Link>
            <span aria-hidden>•</span>
            <Link href="/teacher/admin" className="hover:text-white">
              Tanári admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pb-32 pt-28">
      <HeroHighlight>
        <Highlight>Magyar közösségi szolgálat újragondolva</Highlight>
        <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl">
          {`Az IKSZ teljesítése, pont úgy, ahogy egy 2025-ös diáknak szüksége van rá.`}
        </h1>
        <p className="max-w-2xl text-balance text-sm text-slate-100/85 sm:text-base md:text-lg">
          Válassz hiteles szervezetek közül, foglalj műszakokat, gyűjts digitális igazolásokat és igazoltasd
          az óráidat egy átlátható, modern felületen.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Link href="/student">
            <Button className="group rounded-2xl bg-white px-7 py-6 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
              Kezdés diákként
              <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/login">
            <Button
              variant="outline"
              className="rounded-2xl border-white/15 bg-white/15 text-white backdrop-blur transition hover:bg-white/20"
            >
              Szervezői belépés
            </Button>
          </Link>
        </div>
        <div className="grid w-full max-w-3xl grid-cols-1 gap-4 pt-10 sm:grid-cols-3">
          {HERO_STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/15 bg-white/[0.12] px-6 py-5 text-left shadow-lg shadow-slate-900/25 backdrop-blur"
            >
              <p className="text-2xl font-semibold text-white sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-200/80">{stat.label}</p>
            </div>
          ))}
        </div>
      </HeroHighlight>

      <div className="mx-auto mt-16 flex max-w-5xl justify-center">
        <HeroVisualizer />
      </div>
    </section>
  );
}

function LogosSection() {
  return (
    <section className="relative border-y border-white/12 bg-white/[0.05]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-6 px-6 py-10 text-xs uppercase tracking-[0.25em] text-slate-100/80 md:gap-10">
        <span>ELTE</span>
        <span>Fazekas</span>
        <span>Vöröskereszt</span>
        <span>Máltai</span>
        <span>JW Marriott</span>
        <span>Alternatív Közösségek</span>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <Highlight>Ami miatt szeretni fogod</Highlight>
          <h2 className="mt-6 text-3xl font-semibold text-slate-50 sm:text-4xl">
            Teljes eszköztár az 50 óra kézben tartásához
          </h2>
          <p className="mt-3 text-sm text-slate-100/85">
            Egy platform, ahol a diák, a fogadó szervezet és a tanár is ugyanazt a naprakész információt
            látja. Nem kell többé külön űrlapokat, Excel-táblákat és papír szerződéseket vadásznod.
          </p>
        </div>
        <BentoGrid className="mt-16">
          {FEATURE_CARDS.map((feature, index) => (
            <BentoGridItem
              key={feature.title}
              icon={<feature.icon className="h-10 w-10 text-sky-100" />}
              title={feature.title}
              description={feature.description}
              className={index === 0 ? 'md:col-span-2' : undefined}
            >
              {index === 0 ? (
                <p>
                  Intelligens javaslatokkal és térképes megjelenítéssel pillanatok alatt megtalálod a hozzád
                  legközelebb eső, releváns programokat.
                </p>
              ) : null}
            </BentoGridItem>
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}

function JourneySection() {
  return (
    <section className="relative border-y border-white/12 bg-white/[0.07] py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="space-y-6 text-center">
          <Highlight>Három egyszerű lépés</Highlight>
          <h2 className="text-3xl font-semibold text-slate-50 sm:text-4xl">
            Így jutnak el a diákok a nulláról a hitelesített órákig
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-slate-100/85">
            Minden folyamat digitalizálva, automatikus státuszokkal és értesítésekkel. A tanárok és a
            szervezők is ugyanazt látják, mint a diák.
          </p>
        </div>

        <div className="mt-16 space-y-8">
          {JOURNEY_STEPS.map((step, index) => (
            <div
              key={step.title}
              className={cn(
                'relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.1] p-6 text-left shadow-lg backdrop-blur transition hover:bg-white/[0.16]',
                index % 2 === 1 ? 'md:ml-20' : 'md:mr-20',
              )}
            >
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-sky-300/80 via-indigo-300/70 to-transparent" />
              <div className="pl-4 md:pl-6">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-200">{step.title}</p>
                <p className="mt-3 text-sm text-slate-100/85 sm:text-base">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="space-y-6 text-center">
          <Highlight>Visszajelzés</Highlight>
          <h2 className="text-3xl font-semibold text-slate-50 sm:text-4xl">
            Slow admin? Papírmunka? Ebben a valóságban nem.
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-slate-100/85">
            Diákok, szervezetek és koordinátorok meséltek arról, hogyan rövidült le az ügyintézési idő.
          </p>
        </div>

        <div className="mt-14">
          <InfiniteMovingCards items={TESTIMONIALS} speed="normal" />
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-300/35 via-indigo-400/35 to-cyan-300/35 blur-3xl" />
      <div className="relative mx-auto max-w-5xl px-6 py-20 text-center">
        <div className="inline-flex items-center rounded-full border border-white/15 bg-white/15 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-100">
          Ready to launch
        </div>
        <h2 className="mt-6 text-3xl font-semibold text-slate-50 sm:text-4xl">
          {`Lépj be a digitális IKSZ korszakba.`}
        </h2>
        <p className="mt-3 text-base text-slate-100/80 sm:text-lg">
          Ingyenes diák regisztráció, szervezői pilot programok és tanári oktatóanyagok már elérhetőek.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/student">
            <Button className="rounded-2xl bg-white px-8 py-6 text-base font-semibold text-slate-900 transition hover:bg-slate-100">
              Diák regisztráció
            </Button>
          </Link>
          <Link href="/submit">
            <Button
              variant="outline"
              className="rounded-2xl border-white/15 bg-white/15 text-white backdrop-blur transition hover:bg-white/20"
            >
              Szervezet beküldése
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
