import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FilterPopover } from "@/components/filter-popover";
import { Prisma, Category } from "@prisma/client";

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="h1-page">Browse Skills</h1>
          <p className="body-sm mt-2">
            {skills.length} {skills.length === 1 ? "skill" : "skills"} from fellow students
          </p>
        </div>
        {session?.user && (
          <Button asChild>
            <Link href="/skills/new">+ Post a Skill</Link>
          </Button>
        )}
      </div>

      {/* Search + Filters */}
      {(() => {
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
          <div className="mb-8">
            <form
              id={FILTER_FORM_ID}
              action="/skills"
              className="flex gap-2 p-3 rounded-2xl border border-border/60 bg-card"
            >
              <Input
                name="q"
                placeholder="Search skills..."
                defaultValue={q}
                className="flex-1 min-w-0"
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
              <div className="flex flex-wrap gap-2 mt-3 px-1">
                {activeFilters.map((f) => (
                  <Link
                    key={f.key}
                    href={f.href}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1 text-xs hover:bg-accent transition-colors"
                  >
                    {f.label}
                    <span aria-hidden className="text-muted-foreground">×</span>
                    <span className="sr-only">Remove filter</span>
                  </Link>
                ))}
                <Link
                  href={buildHref({ q })}
                  className="inline-flex items-center rounded-full px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear all
                </Link>
              </div>
            )}
          </div>
        );
      })()}

      {/* Skill Grid */}
      {skills.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-border/60">
          <p className="h3-card mb-2">No skills found</p>
          <p className="body-sm">Try adjusting your filters or be the first to post a skill in this area.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <Link key={skill.id} href={`/skills/${skill.id}`} className="group">
              <Card className="h-full group-hover:border-primary/40 transition-colors">
                <CardHeader className="gap-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={skill.type === "OFFER" ? "default" : "secondary"} className="rounded-lg">
                      {skill.type === "OFFER" ? "Offering" : "Requesting"}
                    </Badge>
                    <span className="caption">
                      {CATEGORY_LABELS[skill.category]}
                    </span>
                  </div>
                  <CardTitle className="h3-card line-clamp-2">{skill.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {skill.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={skill.author.image ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {skill.author.name?.[0]?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm truncate">{skill.author.name}</span>
                    {skill.author.reputation > 0 && (
                      <span className="caption ml-auto">
                        {skill.author.reputation.toFixed(1)} rep
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
