import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Prisma, SkillType, Category } from "@prisma/client";

type SearchParams = Promise<{
  q?: string;
  type?: string;
  category?: string;
}>;

const CATEGORY_LABELS: Record<Category, string> = {
  ACADEMIC: "📚 Academic",
  TECH: "💻 Tech",
  CREATIVE: "🎨 Creative",
  SPORTS: "⚽ Sports",
  LANGUAGE: "🌍 Language",
  OTHER: "✨ Other",
};

export default async function BrowseSkillsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  const { q, type, category } = await searchParams;

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
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Browse Skills</h1>
          <p className="text-muted-foreground mt-1">
            {skills.length} {skills.length === 1 ? "skill" : "skills"} available
          </p>
        </div>
        {session?.user && (
          <Button asChild>
            <Link href="/skills/new">Post a Skill</Link>
          </Button>
        )}
      </div>

      {/* Search + Filters */}
      <form className="flex flex-wrap gap-3 mb-8" action="/skills">
        <Input
          name="q"
          placeholder="Search skills..."
          defaultValue={q}
          className="max-w-sm"
        />
        <select
          name="type"
          defaultValue={type ?? ""}
          className="border rounded-md px-3 py-2 text-sm bg-background"
        >
          <option value="">All types</option>
          <option value="OFFER">Offers</option>
          <option value="REQUEST">Requests</option>
        </select>
        <select
          name="category"
          defaultValue={category ?? ""}
          className="border rounded-md px-3 py-2 text-sm bg-background"
        >
          <option value="">All categories</option>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <Button type="submit" variant="outline">Filter</Button>
      </form>

      {/* Skill Grid */}
      {skills.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No skills found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skills.map((skill) => (
            <Link key={skill.id} href={`/skills/${skill.id}`}>
              <Card className="h-full hover:border-primary transition">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={skill.type === "OFFER" ? "default" : "secondary"}>
                      {skill.type === "OFFER" ? "Offer" : "Request"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {CATEGORY_LABELS[skill.category]}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-2">{skill.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {skill.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={skill.author.image ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {skill.author.name?.[0]?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{skill.author.name}</span>
                    {skill.author.reputation > 0 && (
                      <span className="text-xs text-muted-foreground ml-auto">
                        ⭐ {skill.author.reputation.toFixed(1)}
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