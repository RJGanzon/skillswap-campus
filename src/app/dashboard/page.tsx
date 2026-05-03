import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  Compass,
  Lightbulb,
  MessageCircle,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  const now = new Date();

  const [
    skillCount,
    pendingIncoming,
    activeCount,
    completedCount,
    user,
    nextSession,
    recentSkills,
    unreadNotifications,
  ] = await Promise.all([
    prisma.skill.count({ where: { authorId: userId } }),
    prisma.session.count({ where: { providerId: userId, status: "PENDING" } }),
    prisma.session.count({
      where: {
        OR: [{ requesterId: userId }, { providerId: userId }],
        status: { in: ["ACCEPTED", "ONGOING"] },
      },
    }),
    prisma.session.count({
      where: {
        OR: [{ requesterId: userId }, { providerId: userId }],
        status: "COMPLETED",
      },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { reputation: true } }),
    prisma.session.findFirst({
      where: {
        OR: [{ requesterId: userId }, { providerId: userId }],
        status: { in: ["ACCEPTED", "ONGOING"] },
        scheduledAt: { gte: now },
      },
      orderBy: { scheduledAt: "asc" },
      include: {
        skill: { select: { title: true, category: true } },
        requester: { select: { id: true, name: true, image: true } },
        provider: { select: { id: true, name: true, image: true } },
      },
    }),
    prisma.skill.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, title: true, type: true, category: true, createdAt: true },
    }),
    prisma.notification.count({ where: { userId, read: false } }),
  ]);

  const firstName = session.user.name?.split(" ")[0] ?? "there";
  const reputation = user?.reputation.toFixed(1) ?? "—";
  const otherParty =
    nextSession?.requester.id === userId ? nextSession?.provider : nextSession?.requester;

  return (
    <div className="animate-in mx-auto max-w-6xl space-y-10 px-4 py-14 md:space-y-14 md:px-6 md:py-20">
      {/* ─────────── HERO BANNER ─────────── */}
      <section className="bg-hero-glow relative overflow-hidden rounded-3xl border border-border/60 px-8 py-12 md:px-14 md:py-16">
        <div className="bg-noise absolute inset-0 opacity-[0.07] mix-blend-overlay" />

        <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-muted-foreground">
                {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
              </span>
            </div>
            <h1 className="h1-display">
              Welcome back, <span className="text-muted-foreground">{firstName}</span>
            </h1>
            <p className="body-sm">Quick look at your SkillSwap Campus activity.</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/70 px-5 py-4 backdrop-blur">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              <div>
                <div className="caption">Reputation</div>
                <div className="text-lg font-semibold tabular-nums">
                  {reputation}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">/ 5</span>
                </div>
              </div>
            </div>
            {unreadNotifications > 0 && (
              <Button variant="outline" asChild>
                <Link href="/notifications">
                  <Bell className="mr-1.5 h-4 w-4" />
                  {unreadNotifications} new
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* ─────────── PENDING ALERT ─────────── */}
      {pendingIncoming > 0 && (
        <Card className="bg-hero-glow relative overflow-hidden border-primary/30 py-7">
          <div className="bg-noise absolute inset-0 opacity-[0.06] mix-blend-overlay" />
          <CardHeader className="relative">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-2">
                <CardTitle className="h3-card flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  {pendingIncoming} pending session {pendingIncoming === 1 ? "request" : "requests"}
                </CardTitle>
                <CardDescription>
                  Review and decide whether to accept or decline.
                </CardDescription>
              </div>
              <Button asChild size="sm">
                <Link href="/sessions">
                  Review <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* ─────────── STATS ─────────── */}
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-6">
        <StatCard
          icon={Lightbulb}
          label="Skills Posted"
          value={skillCount.toString()}
          accent="from-blue-500/15 to-blue-500/0"
        />
        <StatCard
          icon={Bell}
          label="Pending"
          value={pendingIncoming.toString()}
          accent="from-amber-500/15 to-amber-500/0"
          highlight={pendingIncoming > 0}
        />
        <StatCard
          icon={Zap}
          label="Active"
          value={activeCount.toString()}
          accent="from-emerald-500/15 to-emerald-500/0"
        />
        <StatCard
          icon={TrendingUp}
          label="Completed"
          value={completedCount.toString()}
          accent="from-violet-500/15 to-violet-500/0"
        />
      </div>

      {/* ─────────── NEXT SESSION + RECENT SKILLS ─────────── */}
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        {/* Next session */}
        <Card className="overflow-hidden py-7">
          <CardHeader className="px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="h3-card flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Next session
              </CardTitle>
              <Link href="/sessions" className="caption hover:text-foreground">
                View all <ArrowUpRight className="ml-0.5 inline h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-6">
            {nextSession ? (
              <div className="space-y-5">
                <div>
                  <div className="text-base font-medium">{nextSession.skill.title}</div>
                  <div className="caption mt-0.5">
                    with {otherParty?.name ?? "a peer"} · {nextSession.skill.category}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span className="tabular-nums">
                    {nextSession.scheduledAt?.toLocaleString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  <Badge variant="secondary" className="ml-auto">
                    {nextSession.status}
                  </Badge>
                </div>
                <Button size="sm" variant="outline" asChild className="w-full">
                  <Link href="/sessions">Open session</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3 py-6 text-center">
                <CalendarDays className="mx-auto h-9 w-9 text-muted-foreground/50" />
                <p className="body-sm">No upcoming sessions scheduled.</p>
                <Button size="sm" variant="link" asChild>
                  <Link href="/skills">Find a skill swap</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent skills */}
        <Card className="overflow-hidden py-7">
          <CardHeader className="px-6">
            <div className="flex items-center justify-between">
              <CardTitle className="h3-card flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Your recent skills
              </CardTitle>
              <Link href="/profile" className="caption hover:text-foreground">
                Manage <ArrowUpRight className="ml-0.5 inline h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="px-6">
            {recentSkills.length > 0 ? (
              <ul className="space-y-3">
                {recentSkills.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`/skills/${s.id}`}
                      className="group flex items-center justify-between gap-4 rounded-xl border border-border/60 px-4 py-3.5 transition-colors hover:bg-muted/50"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="truncate text-sm font-medium">{s.title}</div>
                        <div className="caption">{s.category}</div>
                      </div>
                      <Badge variant={s.type === "OFFER" ? "default" : "secondary"}>
                        {s.type}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="space-y-3 py-6 text-center">
                <Lightbulb className="mx-auto h-9 w-9 text-muted-foreground/50" />
                <p className="body-sm">No skills posted yet.</p>
                <Button size="sm" variant="link" asChild>
                  <Link href="/skills/new">Post your first skill</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─────────── QUICK ACTIONS ─────────── */}
      <div className="space-y-5">
        <h2 className="h2-section">Quick actions</h2>
        <div className="grid gap-5 md:grid-cols-3 md:gap-6">
          <ActionCard
            icon={Lightbulb}
            title="Post a Skill"
            description="Share what you can teach or what you'd like to learn."
            href="/skills/new"
            accent="from-blue-500/15 to-blue-500/0"
          />
          <ActionCard
            icon={Compass}
            title="Browse Skills"
            description="Find students offering skills or requesting help."
            href="/skills"
            accent="from-emerald-500/15 to-emerald-500/0"
          />
          <ActionCard
            icon={MessageCircle}
            title="Messages"
            description="Continue conversations with your swap partners."
            href="/messages"
            accent="from-violet-500/15 to-violet-500/0"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent: string;
  highlight?: boolean;
}) {
  return (
    <Card className={`relative overflow-hidden py-6 ${highlight ? "border-primary/40" : ""}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${accent}`} />
      <div className="bg-noise absolute inset-0 opacity-[0.05] mix-blend-overlay" />
      <CardHeader className="relative px-5 pb-3">
        <div className="flex items-center justify-between">
          <CardDescription className="caption">{label}</CardDescription>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent className="relative px-5">
        <p className="text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}

function ActionCard({
  icon: Icon,
  title,
  description,
  href,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
  accent: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="relative h-full overflow-hidden py-7 transition-all group-hover:border-primary/40 group-hover:shadow-lg">
        <div className={`absolute inset-0 bg-gradient-to-br ${accent}`} />
        <div className="bg-noise absolute inset-0 opacity-[0.05] mix-blend-overlay" />
        <CardHeader className="relative space-y-3 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-foreground text-background">
            <Icon className="h-5 w-5" />
          </div>
          <CardTitle className="h3-card flex items-center justify-between">
            {title}
            <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </CardTitle>
          <CardDescription className="leading-relaxed">{description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
