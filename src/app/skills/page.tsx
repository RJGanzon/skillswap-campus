import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FilterPopover } from "@/components/filter-popover";
import { Prisma, Category, SkillType } from "@prisma/client";
import {
  ArrowUpRight,
  Code2,
  Dumbbell,
  GraduationCap,
  Languages,
  Palette,
  Plus,
  Sparkles,
  Star,
} from "lucide-react";

const FILTER_FORM_ID = "browse-skills-filters";

function buildHref(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  const qs = sp.toString();
  return qs ? `/skills?${qs}` : "/skills";
}

type SearchParams = Promise<{
  q?: string;
  type?: string;
  category?: string;
  availability?: string;
}>;

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
    gradient: string;
    iconBg: string;
    accent: string;
  }
> = {
  ACADEMIC: {
    icon: GraduationCap,
    gradient: "from-blue-500/[0.06] to-transparent",
    iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    accent: "bg-blue-500",
  },
  TECH: {
    icon: Code2,
    gradient: "from-violet-500/[0.06] to-transparent",
    iconBg: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    accent: "bg-violet-500",
  },
  CREATIVE: {
    icon: Palette,
    gradient: "from-pink-500/[0.06] to-transparent",
    iconBg: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
    accent: "bg-pink-500",
  },
  SPORTS: {
    icon: Dumbbell,
    gradient: "from-emerald-500/[0.06] to-transparent",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    accent: "bg-emerald-500",
  },
  LANGUAGE: {
    icon: Languages,
    gradient: "from-amber-500/[0.06] to-transparent",
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    accent: "bg-amber-500",
  },
  OTHER: {
    icon: Sparkles,
    gradient: "from-slate-500/[0.06] to-transparent",
    iconBg: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
    accent: "bg-slate-500",
  },
};

export default async function BrowseSkillsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  const { q, type, category, availability } = await searchParams;

  const where: Prisma.SkillWhereInput = {};
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }
  if (type === "OFFER" || type === "REQUEST") where.type = type;
  if (category && ["ACADEMIC", "TECH", "CREATIVE", "SPORTS", "LANGUAGE", "OTHER"].includes(category)) {
    where.category = category as Category;
  }
  if (availability) {
    where.availability = { contains: availability, mode: "insensitive" };
  }

  const skills = await prisma.skill.findMany({
    where,
    include: {
      author: {
        select: { id: true, name: true, image: true, reputation: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const offerCount = skills.filter((s) => s.type === "OFFER").length;
  const requestCount = skills.length - offerCount;

  const activeFilters: { key: string; label: string; href: string }[] = [];
  if (type === "OFFER" || type === "REQUEST") {
    activeFilters.push({
      key: "type",
      label: type === "OFFER" ? "Offers" : "Requests",
      href: buildHref({ q, category, availability }),
    });
  }
  if (category && category in CATEGORY_LABELS) {
    activeFilters.push({
      key: "category",
      label: CATEGORY_LABELS[category as Category],
      href: buildHref({ q, type, availability }),
    });
  }
  if (availability) {
    activeFilters.push({
      key: "availability",
      label: `Available: ${availability}`,
      href: buildHref({ q, type, category }),
    });
  }

  return (
    <div className="animate-in mx-auto max-w-6xl space-y-10 px-4 py-14 md:space-y-12 md:px-6 md:py-16">
      {/* ─────────── HERO ─────────── */}
      <section className="bg-hero-glow relative overflow-hidden rounded-3xl border border-border/60 px-8 py-12 md:px-14 md:py-14">
        <div className="bg-noise absolute inset-0 opacity-[0.07] mix-blend-overlay" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-muted-foreground">
                {skills.length} {skills.length === 1 ? "result" : "results"}
                {(offerCount > 0 || requestCount > 0) && (
                  <>
                    {" · "}
                    {offerCount} offering · {requestCount} requesting
                  </>
                )}
              </span>
            </div>
            <h1 className="h1-display">Browse skills</h1>
            <p className="body-sm max-w-xl">
              Discover what fellow students can teach — and what they want to learn. Match, message, swap.
            </p>
          </div>

          {session?.user && (
            <Button size="lg" asChild>
              <Link href="/skills/new">
                <Plus className="mr-1.5 h-4 w-4" /> Post a Skill
              </Link>
            </Button>
          )}
        </div>
      </section>

      {/* ─────────── SEARCH + FILTERS ─────────── */}
      <div className="space-y-4">
        <form
          id={FILTER_FORM_ID}
          action="/skills"
          className="flex gap-2 rounded-2xl border border-border/60 bg-card p-3"
        >
          <Input
            name="q"
            placeholder="Search by title or description..."
            defaultValue={q}
            className="min-w-0 flex-1"
          />
          <FilterPopover
            formId={FILTER_FORM_ID}
            activeCount={activeFilters.length}
            defaultType={type}
            defaultCategory={category}
            defaultAvailability={availability}
          />
          <Button type="submit">Search</Button>
        </form>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 px-1">
            {activeFilters.map((f) => (
              <Link
                key={f.key}
                href={f.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1 text-xs transition-colors hover:bg-accent"
              >
                {f.label}
                <span aria-hidden className="text-muted-foreground">×</span>
                <span className="sr-only">Remove filter</span>
              </Link>
            ))}
            <Link
              href={buildHref({ q })}
              className="inline-flex items-center rounded-full px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Clear all
            </Link>
          </div>
        )}
      </div>

      {/* ─────────── SKILL GRID ─────────── */}
      {skills.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/60 px-6 py-20 text-center">
          <Sparkles className="mx-auto mb-4 h-10 w-10 text-muted-foreground/50" />
          <p className="h3-card mb-2">No skills found</p>
          <p className="body-sm">
            Try adjusting your filters or be the first to post a skill in this area.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {skills.map((skill) => {
            const meta = CATEGORY_META[skill.category];
            const Icon = meta.icon;
            const isOffer = skill.type === SkillType.OFFER;

            return (
              <Link key={skill.id} href={`/skills/${skill.id}`} className="group block h-full">
                <Card className="relative flex h-full flex-col overflow-hidden border-border/50 py-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-foreground/20 group-hover:shadow-md">
                  {/* Minimal top accent — short colored bar in category tint */}
                  <div className="absolute left-6 top-0 h-[2px] w-10 overflow-hidden rounded-b-full">
                    <div className={`h-full w-full ${meta.accent}`} />
                  </div>

                  {/* Subtle category-tinted backdrop + noise */}
                  <div className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${meta.gradient}`} />
                  <div className="bg-noise absolute inset-0 opacity-[0.04] mix-blend-overlay" />

                  <div className="relative flex flex-1 flex-col gap-5 px-6 pb-6 pt-7">
                    {/* Header row: category icon + type badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${meta.iconBg}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge
                        variant={isOffer ? "default" : "secondary"}
                        className="rounded-full"
                      >
                        {isOffer ? "Offering" : "Requesting"}
                      </Badge>
                    </div>

                    {/* Title + category label */}
                    <div className="space-y-1.5">
                      <div className="caption uppercase tracking-wide">
                        {CATEGORY_LABELS[skill.category]}
                      </div>
                      <h3 className="h3-card line-clamp-2 text-lg leading-snug">{skill.title}</h3>
                    </div>

                    {/* Description — fixed line clamp keeps card heights aligned */}
                    <p className="body-sm line-clamp-3 min-h-[3.75rem] flex-1">
                      {skill.description}
                    </p>

                    {/* Availability pill */}
                    {skill.availability && (
                      <div className="caption inline-flex w-fit items-center gap-1 rounded-full border border-border/60 bg-background/60 px-2.5 py-1 backdrop-blur">
                        <span className="text-muted-foreground">Available:</span>{" "}
                        <span className="font-medium text-foreground">{skill.availability}</span>
                      </div>
                    )}

                    {/* Footer pinned to bottom: author + arrow */}
                    <div className="mt-auto flex items-center gap-3 border-t border-border/60 pt-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={skill.author.image ?? undefined} />
                        <AvatarFallback className="text-xs">
                          {skill.author.name?.[0]?.toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{skill.author.name}</div>
                        {skill.author.reputation > 0 && (
                          <div className="caption flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                            <span className="tabular-nums">{skill.author.reputation.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
