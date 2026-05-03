import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  MessageCircle,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: GraduationCap,
    title: "Learn from peers",
    body: "Find classmates already strong in the topic you're stuck on. No tutors, no fees — just students helping students.",
  },
  {
    icon: Zap,
    title: "Teach to master it",
    body: "The fastest way to truly learn something is to explain it. Trade what you know for what you want to know.",
  },
  {
    icon: MessageCircle,
    title: "Built-in messaging",
    body: "Chat, schedule sessions, and confirm meetups without leaving the app. Real-time notifications keep you in sync.",
  },
];

const steps = [
  { n: "01", title: "List your skills", body: "Add subjects you can teach and topics you want to learn." },
  { n: "02", title: "Match with peers", body: "Browse students with complementary skills and send a swap request." },
  { n: "03", title: "Meet & rate", body: "Run the session, mark it complete, and rate each other to build trust." },
];

const testimonials = [
  {
    quote: "Traded calculus help for guitar lessons. Beats paying $40/hr for a tutor.",
    name: "Mara R.",
    role: "CS sophomore",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&auto=format",
  },
  {
    quote: "I've taught Python to four people this semester. My GPA went up too — explaining locks it in.",
    name: "Devon K.",
    role: "Data science junior",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&auto=format",
  },
  {
    quote: "Found a Spanish partner in two days. We swap weekly now.",
    name: "Aiya S.",
    role: "Linguistics freshman",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop&auto=format",
  },
];

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="animate-in">
      {/* ─────────── HERO ─────────── */}
      <section className="relative overflow-hidden">
        <div className="bg-hero-glow absolute inset-0 -z-10" />
        <div className="bg-noise absolute inset-0 -z-10 opacity-[0.07] mix-blend-overlay" />

        <div className="mx-auto max-w-6xl px-4 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div className="text-center md:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="text-muted-foreground">Free for verified students</span>
              </div>

              <h1 className="h1-display mb-6">
                Trade skills.<br />
                <span className="text-muted-foreground">Not money.</span>
              </h1>

              <p className="body-lg mb-8 max-w-xl mx-auto md:mx-0">
                SkillSwap Campus connects students who want to learn with those who love to teach.
                Peer-to-peer knowledge exchange, zero fees, zero tutors.
              </p>

              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Button size="lg" asChild>
                  <Link href="/register">
                    Get Started <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">I already have an account</Link>
                </Button>
              </div>

              <div className="mt-8 flex items-center justify-center gap-3 md:justify-start">
                <div className="flex -space-x-2">
                  {testimonials.map((t) => (
                    <Image
                      key={t.name}
                      src={t.avatar}
                      alt={t.name}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full border-2 border-background object-cover"
                    />
                  ))}
                </div>
                <div className="caption">
                  <span className="font-medium text-foreground">2,400+</span> students already swapping
                </div>
              </div>
            </div>

            {/* Hero image */}
            <div className="relative">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-border/60 shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&auto=format&fit=crop"
                  alt="Students collaborating on a laptop"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="bg-noise absolute inset-0 opacity-[0.08] mix-blend-overlay" />
              </div>

              {/* Floating accent card */}
              <div className="animate-float-slow absolute -bottom-6 -left-6 hidden md:block">
                <Card className="w-56 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground text-background">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="h3-card">Calculus → Guitar</div>
                      <div className="caption">Match · 2 min ago</div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="animate-float-slow absolute -right-4 top-8 hidden md:block" style={{ animationDelay: "1.5s" }}>
                <Card className="w-44 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  </div>
                  <div className="caption mt-1">4.9 avg session rating</div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── STATS STRIP ─────────── */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4">
          {[
            { n: "2,400+", l: "Active students" },
            { n: "180+", l: "Skills offered" },
            { n: "12k", l: "Sessions completed" },
            { n: "$0", l: "Cost to swap" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="text-3xl font-semibold tracking-tight md:text-4xl">{s.n}</div>
              <div className="caption mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────── FEATURES ─────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="h1-page mb-3">Everything a study partner should be</h2>
          <p className="body-lg">
            Designed for the way students actually learn — together, on their own schedule.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="px-6 py-6">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-foreground text-background">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="h2-section mb-2">{f.title}</h3>
              <p className="body-sm">{f.body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ─────────── HOW IT WORKS ─────────── */}
      <section className="border-t border-border/60 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-border/60">
              <Image
                src="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=900&auto=format&fit=crop"
                alt="Two students studying together"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="bg-noise absolute inset-0 opacity-[0.08] mix-blend-overlay" />
            </div>

            <div>
              <h2 className="h1-page mb-3">How a swap works</h2>
              <p className="body-lg mb-8">Three steps from sign-up to your first session.</p>

              <ol className="space-y-6">
                {steps.map((s) => (
                  <li key={s.n} className="flex gap-4">
                    <div className="h2-section text-muted-foreground tabular-nums">{s.n}</div>
                    <div>
                      <div className="h3-card mb-1">{s.title}</div>
                      <div className="body-sm">{s.body}</div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── TESTIMONIALS ─────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="h1-page mb-3">What students say</h2>
          <p className="body-lg">Real swaps from this semester.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="px-6 py-6">
              <p className="body mb-5">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <Image
                  src={t.avatar}
                  alt={t.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="caption">{t.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ─────────── FINAL CTA ─────────── */}
      <section className="px-4 pb-24">
        <div className="bg-hero-glow relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-border/60 px-6 py-16 text-center md:px-12 md:py-20">
          <div className="bg-noise absolute inset-0 opacity-[0.08] mix-blend-overlay" />
          <Users className="mx-auto mb-5 h-10 w-10" />
          <h2 className="h1-display mb-4">Your next skill is one swap away.</h2>
          <p className="body-lg mx-auto mb-8 max-w-xl">
            Sign up with your campus email and post your first skill in under a minute.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/register">
                Create free account <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
