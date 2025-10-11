import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  Check,
  GraduationCap,
  LucideIcon,
  MapPin,
  Users,
  Layers,
  Sparkles,
  ShieldCheck,
  Clock,
} from 'lucide-react';

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
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(129,140,248,0.2),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-grid-white/[0.05]" />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2 font-semibold text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
              <GraduationCap className="h-5 w-5" />
            </div>
            IKSZ Finder
            <span className="text-xs font-normal text-slate-300/70">beta</span>
          </Link>
          <div className="hidden items-center gap-3 text-sm text-slate-200/80 md:flex">
            <span className="rounded-full border border-white/10 px-3 py-1">Diákoknak</span>
            <span className="rounded-full border border-white/10 px-3 py-1">Szervezőknek</span>
            <span className="rounded-full border border-white/10 px-3 py-1">Tanároknak</span>
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

      <footer className="relative z-10 border-t border-white/10 bg-slate-950/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-center text-sm text-slate-400 md:flex-row md:items-center md:justify-between md:text-left">
          <p>© {new Date().getFullYear()} IKSZ Finder. Minden jog fenntartva.</p>
          <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
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
    <section className="relative overflow-hidden">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 pb-24 pt-28 md:flex-row md:items-start md:pb-32 md:pt-32">
        <div className="flex-1 space-y-8 text-center md:text-left">
          <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-300">
            Magyar közösségi szolgálat újragondolva
          </div>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl md:text-6xl">
            {`Az IKSZ teljesítése, pont úgy, ahogy egy 2025-ös diáknak szüksége van rá.`}
          </h1>
          <p className="max-w-xl text-base text-slate-200/80 sm:text-lg md:text-xl">
            Válassz hiteles szervezetek közül, foglalj műszakokat, gyűjts digitális igazolásokat, és
            igazoltasd az óráidat egy átlátható, modern felületen.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-start">
            <Link href="/student" className="w-full sm:w-auto">
              <Button className="group w-full rounded-2xl bg-white px-8 py-6 text-base font-semibold text-slate-900 transition hover:bg-slate-100 sm:w-auto">
                Kezdés diákként
                <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full rounded-2xl border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/20 sm:w-auto"
              >
                Szervezői belépés
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-3 sm:pt-10">
            {HERO_STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/[0.06] px-6 py-5 text-left shadow-lg shadow-slate-900/30 backdrop-blur"
              >
                <p className="text-2xl font-semibold text-white sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-slate-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex flex-1 justify-center">
          <div className="relative aspect-[4/5] w-full max-w-md">
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-blue-500/30 via-indigo-400/20 to-teal-400/30 blur-3xl" />
            <div className="relative z-10 flex h-full flex-col justify-between rounded-[2.5rem] border border-white/10 bg-white/[0.07] p-8 shadow-[0_25px_50px_-12px_rgba(15,23,42,0.8)] backdrop-blur">
              <header className="flex items-center justify-between">
                <div className="rounded-full border border-white/15 px-4 py-1 text-xs uppercase text-slate-200/80">
                  Live
                </div>
                <div className="text-xs text-slate-300">IKSZ Dashboard</div>
              </header>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">Következő műszakod</h3>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4 text-sm text-slate-200">
                    <p className="flex items-center gap-2 text-white">
                      <Sparkles className="h-4 w-4 text-blue-300" />
                      Napfény Idősek Otthona
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-wide text-slate-300">
                      Október 18. · 17:30–21:00 · Óradíj: 4h
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-200/70">
                    Éves előrehaladás
                  </h4>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-5 text-sm">
                    <div className="flex items-center justify-between text-xs uppercase text-slate-300">
                      <span>Teljesített órák</span>
                      <span>32 / 50</span>
                    </div>
                    <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                      <div className="h-full w-[64%] rounded-full bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300" />
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-300">
                      <Check className="h-3.5 w-3.5 text-emerald-300" />
                      14 óra jóváhagyás alatt
                    </div>
                  </div>
                </div>
              </div>
              <footer className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-xs text-slate-200">
                <span>IKSZ napló automatikusan frissítve</span>
                <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-emerald-200">szinkronban</span>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LogosSection() {
  return (
    <section className="relative border-y border-white/5 bg-white/[0.04]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-6 px-6 py-10 text-xs uppercase tracking-[0.25em] text-slate-400 md:gap-10">
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
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 md:flex-row">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-300">
            Ami miatt szeretni fogod
          </div>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Teljes eszköztár az 50 óra kézben tartásához
          </h2>
          <p className="max-w-lg text-sm text-slate-200/80">
            Egy platform, ahol a diák, a fogadó szervezet és a tanár is ugyanazt a naprakész információt
            látja. Nem kell többé külön űrlapokat, Excel-táblákat és papír szerződéseket vadásznod.
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-300/80">
            <span className="rounded-full border border-white/15 px-3 py-1">Beépített sablonok</span>
            <span className="rounded-full border border-white/15 px-3 py-1">Automatikus emlékeztetők</span>
            <span className="rounded-full border border-white/15 px-3 py-1">100% GDPR ready</span>
          </div>
        </div>

        <div className="grid flex-1 gap-6">
          {FEATURE_CARDS.map((feature) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.07] p-6 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.6)] backdrop-blur transition hover:translate-y-[-4px] hover:bg-white/[0.1]"
            >
              <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-indigo-300/60 to-transparent opacity-0 transition group-hover:opacity-100" />
              <feature.icon className="h-10 w-10 text-indigo-200" />
              <h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-200/80">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function JourneySection() {
  return (
    <section className="relative border-y border-white/10 bg-white/[0.06] py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="space-y-6 text-center">
          <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-300">
            Három egyszerű lépés
          </div>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Így jutnak el a diákok a nulláról a hitelesített órákig
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-slate-200/80">
            Minden folyamat digitalizálva, automatikus státuszokkal és értesítésekkel. A tanárok és a
            szervezők is ugyanazt látják, mint a diák.
          </p>
        </div>

        <div className="mt-16 space-y-8">
          {JOURNEY_STEPS.map((step, index) => (
            <div
              key={step.title}
              className={cn(
                'relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.07] p-6 text-left shadow-lg backdrop-blur transition hover:bg-white/[0.1]',
                index % 2 === 1 ? 'md:ml-20' : 'md:mr-20',
              )}
            >
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-400/70 via-purple-400/60 to-transparent" />
              <div className="pl-4 md:pl-6">
                <p className="text-xs uppercase tracking-[0.4em] text-slate-300">{step.title}</p>
                <p className="mt-3 text-sm text-slate-200/85 sm:text-base">{step.description}</p>
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
          <div className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-300">
            Visszajelzés
          </div>
          <h2 className="text-3xl font-semibold text-white sm:text-4xl">
            Slow admin? Papírmunka? Ebben a valóságban nem.
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-slate-200/80">
            Diákok, szervezetek és koordinátorok meséltek arról, hogyan rövidült le az ügyintézési idő.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <figure
              key={testimonial.name}
              className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-[0_18px_40px_-15px_rgba(15,23,42,0.7)] backdrop-blur"
            >
              <blockquote className="text-sm leading-relaxed text-slate-200/80">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-6 text-sm text-slate-200/70">
                <div className="text-white">{testimonial.name}</div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  {testimonial.role}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-sky-500/20 blur-3xl" />
      <div className="relative mx-auto max-w-5xl px-6 py-20 text-center">
        <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-200">
          Ready to launch
        </div>
        <h2 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">
          {`Lépj be a digitális IKSZ korszakba.`}
        </h2>
        <p className="mt-3 text-base text-slate-200/75 sm:text-lg">
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
              className="rounded-2xl border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
            >
              Szervezet beküldése
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
