import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { deleteSkill } from "../actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RequestSessionDialog } from "@/components/request-session-dialog";
import { Category } from "@prisma/client";

const CATEGORY_LABELS: Record<Category, string> = {
  ACADEMIC: "📚 Academic",
  TECH: "💻 Tech",
  CREATIVE: "🎨 Creative",
  SPORTS: "⚽ Sports",
  LANGUAGE: "🌍 Language",
  OTHER: "✨ Other",
};

export default async function SkillDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const skill = await prisma.skill.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, name: true, image: true, bio: true, reputation: true },
      },
    },
  });

  if (!skill) notFound();

  const isOwner = session?.user?.id === skill.author.id;

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="mb-6">
        <Link href="/skills" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to browse
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant={skill.type === "OFFER" ? "default" : "secondary"}>
              {skill.type === "OFFER" ? "Offering" : "Requesting"}
            </Badge>
            <Badge variant="outline">{CATEGORY_LABELS[skill.category]}</Badge>
          </div>
          <CardTitle className="text-2xl">{skill.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
            <p className="whitespace-pre-wrap">{skill.description}</p>
          </div>

          {skill.availability && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Availability</h3>
              <p>{skill.availability}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Posted by</h3>
            <Link href={`/users/${skill.author.id}`} className="flex items-center gap-3 hover:opacity-80">
              <Avatar className="h-10 w-10">
                <AvatarImage src={skill.author.image ?? undefined} />
                <AvatarFallback>
                  {skill.author.name?.[0]?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{skill.author.name}</p>
                {skill.author.reputation > 0 && (
                  <p className="text-xs text-muted-foreground">
                    ⭐ {skill.author.reputation.toFixed(1)} reputation
                  </p>
                )}
              </div>
            </Link>
          </div>

          {/* Owner Actions */}
          {isOwner ? (
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" asChild>
                <Link href={`/skills/${skill.id}/edit`}>Edit</Link>
              </Button>
              <form
                action={async () => {
                  "use server";
                  await deleteSkill(skill.id);
                }}
              >
                <Button variant="destructive" type="submit">Delete</Button>
              </form>
            </div>
            ) : session?.user ? (
            <div className="pt-4 border-t">
                {skill.type === "OFFER" ? (
                <RequestSessionDialog skillId={skill.id} />
                ) : (
                <p className="text-sm text-muted-foreground">
                    This is a skill request. Reach out to {skill.author.name?.split(" ")[0]} if you can teach it!
                </p>
                )}
            </div>
            ) : (
            <div className="pt-4 border-t">
              <Button asChild>
                <Link href="/login">Login to request this skill</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}