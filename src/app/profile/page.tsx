import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Category } from "@prisma/client";
import {
  Award,
  CalendarDays,
  CheckCircle2,
  Code2,
  Dumbbell,
  Edit3,
  Flame,
  GraduationCap,
  Languages,
  MessageCircle,
  Palette,
  Plus,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";

const CATEGORY_LABELS: Record<Category, string> = {
  ACADEMIC: "Academic",
  TECH: "Tech",
  CREATIVE: "Creative",
  SPORTS: "Sports",
  LANGUAGE: "Language",
  OTHER: "Other",
};

const CATEGORY_META: Record<
  Category,
  {
    icon: React.ComponentType<{ className?: string }>;
    iconBg: string;
    accent: string;
    gradient: string;
  }
> = {
  ACADEMIC: {
    icon: GraduationCap,
    iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    accent: "bg-blue-500",
    gradient: "from-blue-500/[0.06] to-transparent",
  },
  TECH: {
    icon: Code2,
    iconBg: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    accent: "bg-violet-500",
    gradient: "from-violet-500/[0.06] to-transparent",
  },
  CREATIVE: {
    icon: Palette,
    iconBg: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
    accent: "bg-pink-500",
    gradient: "from-pink-500/[0.06] to-transparent",
  },
  SPORTS: {
    icon: Dumbbell,
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    accent: "bg-emerald-500",
    gradient: "from-emerald-500/[0.06] to-transparent",
  },
  LANGUAGE: {
    icon: Languages,
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    accent: "bg-amber-500",
    gradient: "from-amber-500/[0.06] to-transparent",
  },
  OTHER: {
    icon: Sparkles,
    iconBg: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
    accent: "bg-slate-500",
    gradient: "from-slate-500/[0.06] to-transparent",
  },
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [user, completedCount, ratingsReceived, recentRatings] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { skills: { orderBy: { createdAt: "desc" } } },
    }),
    prisma.session.count({
      where: {
        OR: [{ requesterId: userId }, { providerId: userId }],
        status: "COMPLETED",
      },
    }),
    prisma.rating.count({ where: { rateeId: userId } }),
    prisma.rating.findMany({
      where: { rateeId: userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        rater: { select: { id: true, name: true, image: true } },
        session: { select: { skill: { select: { title: true } } } },
      },
    }),
  ]);

  if (!user) redirect("/login");

  const offers = user.skills.filter((s) => s.type === "OFFER");
  const requests = user.skills.filter((s) => s.type === "REQUEST");

  const memberMonths = Math.max(
    1,
    Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30))
  );

  // Achievements derived from activity — light gamification.
  const achievements = [
    {
      id: "first-skill",
      icon: Sparkles,
      label: "First Skill",
      description: "Posted your first skill",
      earned: user.skills.length >= 1,
    },
    {
      id: "first-swap",
      icon: CheckCircle2,
      label: "First Swap",
      description: "Completed a session",
      earned: completedCount >= 1,
    },
    {
      id: "well-rated",
      icon: Star,
      label: "Well Rated",
      description: "4.5+ reputation",
      earned: user.reputation >= 4.5,
    },
    {
      id: "on-fire",
      icon: Flame,
      label: "On Fire",
      description: "5+ completed sessions",
      earned: completedCount >= 5,
    },
  ];

  return (
    <div className="animate-in mx-auto max-w-5xl space-y-10 px-4 py-14 md:space-y-12 md:px-6 md:py-16">
      {/* ─────────── HERO BANNER ─────────── */}
      <section className="bg-hero-glow relative overflow-hidden rounded-3xl border border-border/60">
        <div className="bg-noise absolute inset-0 opacity-[0.07] mix-blend-overlay" />

        {/* Decorative cover band */}
        <div className="relative h-32 bg-gradient-to-br from-blue-500/15 via-violet-500/10 to-pink-500/10 md:h-40">
          <div className="bg-noise absolute inset-0 opacity-[0.08] mix-blend-overlay" />
        </div>

        <div className="relative px-6 pb-8 md:px-10 md:pb-10">
          <div className="-mt-12 flex flex-col gap-6 md:-mt-16 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col items-start gap-5 md:flex-row md:items-end">
              <Avatar className="h-24 w-24 border-4 border-background shadow-xl md:h-28 md:w-28">
                <AvatarImage src={user.image ?? undefined} />
                <AvatarFallback className="text-3xl">
                  {user.name?.[0]?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2 md:pb-2">
                <h1 className="h1-display">{user.name}</h1>
                <p className="body-sm">{user.email}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="rounded-full">
                    <CalendarDays className="mr-1 h-3 w-3" />
                    Member for {memberMonths} {memberMonths === 1 ? "month" : "months"}
                  </Badge>
                  {user.reputation > 0 && (
                    <Badge variant="secondary" className="rounded-full">
                      <Star className="mr-1 h-3 w-3 fill-yellow-500 text-yellow-500" />
                      {user.reputation.toFixed(1)} rep
                    </Badge>
                  )}
                  <Badge variant="secondary" className="rounded-full">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    {completedCount} {completedCount === 1 ? "swap" : "swaps"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-2 md:pb-2">
              <Button variant="outline" asChild>
                <Link href="/profile/edit">
                  <Edit3 className="mr-1.5 h-4 w-4" /> Edit Profile
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── STATS ─────────── */}
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-6">
        <StatBlock
          icon={Star}
          label="Reputation"
          value={user.reputation > 0 ? user.reputation.toFixed(1) : "—"}
          suffix={user.reputation > 0 ? "/ 5" : undefined}
          accent="from-amber-500/15 to-amber-500/0"
        />
        <StatBlock
          icon={CheckCircle2}
          label="Completed"
          value={completedCount.toString()}
          accent="from-emerald-500/15 to-emerald-500/0"
        />
        <StatBlock
          icon={Sparkles}
          label="Offered"
          value={offers.length.toString()}
          accent="from-blue-500/15 to-blue-500/0"
        />
        <StatBlock
          icon={MessageCircle}
          label="Requested"
          value={requests.length.toString()}
          accent="from-violet-500/15 to-violet-500/0"
        />
      </div>

      {/* ─────────── ABOUT + ACHIEVEMENTS ─────────── */}
      <div className="grid gap-6 md:grid-cols-3 md:gap-8">
        <Card className="md:col-span-2 py-7">
          <CardHeader className="px-6">
            <CardTitle className="h3-card flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> About
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            {user.bio ? (
              <p className="body whitespace-pre-wrap leading-relaxed">{user.bio}</p>
            ) : (
              <p className="body-sm italic">
                You haven&apos;t written a bio yet.{" "}
                <Link href="/profile/edit" className="underline hover:text-foreground">
                  Add one
                </Link>{" "}
                so peers know what you&apos;re about.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="py-7">
          <CardHeader className="px-6">
            <CardTitle className="h3-card flex items-center gap-2">
              <Award className="h-4 w-4" /> Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            <ul className="space-y-3">
              {achievements.map((a) => (
                <li key={a.id} className="flex items-start gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      a.earned
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground/50"
                    }`}
                  >
                    <a.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-sm font-medium ${
                        a.earned ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {a.label}
                    </div>
                    <div className="caption">{a.description}</div>
                  </div>
                  {a.earned && (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* ─────────── RECENT FEEDBACK ─────────── */}
      {recentRatings.length > 0 && (
        <div className="space-y-5">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="h2-section">Recent feedback</h2>
              <p className="caption mt-1">
                {ratingsReceived} {ratingsReceived === 1 ? "rating" : "ratings"} from past swaps
              </p>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-3 md:gap-6">
            {recentRatings.map((r) => (
              <Card key={r.id} className="py-6">
                <CardContent className="space-y-4 px-6">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < r.stars
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                  {r.comment && (
                    <p className="body-sm leading-relaxed">&ldquo;{r.comment}&rdquo;</p>
                  )}
                  <div className="flex items-center gap-3 border-t border-border/60 pt-4">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={r.rater.image ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {r.rater.name?.[0]?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{r.rater.name}</div>
                      <div className="caption truncate">{r.session.skill.title}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ─────────── MY SKILLS ─────────── */}
      <div className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="h2-section">My skills</h2>
            <p className="caption mt-1">
              {offers.length} offering · {requests.length} requesting
            </p>
          </div>
          <Button size="sm" asChild>
            <Link href="/skills/new">
              <Plus className="mr-1 h-4 w-4" /> Post a Skill
            </Link>
          </Button>
        </div>

        {user.skills.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/60 px-6 py-20 text-center">
            <Sparkles className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" />
            <p className="h3-card mb-2">No skills yet</p>
            <p className="body-sm mb-6">Post your first skill to start swapping with peers.</p>
            <Button asChild>
              <Link href="/skills/new">Post your first skill</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
            {user.skills.map((skill) => {
              const meta = CATEGORY_META[skill.category];
              const Icon = meta.icon;
              const isOffer = skill.type === "OFFER";
              return (
                <Link key={skill.id} href={`/skills/${skill.id}`} className="group block h-full">
                  <Card className="relative flex h-full flex-col overflow-hidden border-border/50 py-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-foreground/20 group-hover:shadow-md">
                    <div className="absolute left-6 top-0 h-[2px] w-10 overflow-hidden rounded-b-full">
                      <div className={`h-full w-full ${meta.accent}`} />
                    </div>
                    <div className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${meta.gradient}`} />
                    <div className="bg-noise absolute inset-0 opacity-[0.04] mix-blend-overlay" />

                    <div className="relative flex flex-1 flex-col gap-4 px-6 pb-6 pt-7">
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-2xl ${meta.iconBg}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <Badge
                          variant={isOffer ? "default" : "secondary"}
                          className="rounded-full"
                        >
                          {isOffer ? "Offering" : "Requesting"}
                        </Badge>
                      </div>

                      <div className="space-y-1.5">
                        <div className="caption uppercase tracking-wide">
                          {CATEGORY_LABELS[skill.category]}
                        </div>
                        <h3 className="h3-card line-clamp-1 text-lg leading-snug">{skill.title}</h3>
                      </div>

                      <p className="body-sm line-clamp-2 flex-1">{skill.description}</p>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatBlock({
  icon: Icon,
  label,
  value,
  suffix,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  suffix?: string;
  accent: string;
}) {
  return (
    <Card className="relative overflow-hidden py-6">
      <div className={`absolute inset-0 bg-gradient-to-br ${accent}`} />
      <div className="bg-noise absolute inset-0 opacity-[0.05] mix-blend-overlay" />
      <CardContent className="relative space-y-2 px-5">
        <div className="flex items-center justify-between">
          <p className="caption">{label}</p>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <p className="text-3xl font-semibold tracking-tight tabular-nums">
          {value}
          {suffix && <span className="ml-1 text-sm font-normal text-muted-foreground">{suffix}</span>}
        </p>
      </CardContent>
    </Card>
  );
}
