import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { deleteSkill } from "../actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RequestSessionDialog } from "@/components/request-session-dialog";
import { MessageButton } from "@/components/message-button";
import { Category } from "@prisma/client";

const CATEGORY_LABELS: Record<Category, string> = {
  ACADEMIC: "Academic",
  TECH: "Tech",
  CREATIVE: "Creative",
  SPORTS: "Sports",
  LANGUAGE: "Language",
  OTHER: "Other",
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
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/skills" className="caption hover:text-foreground transition-colors inline-flex items-center gap-1 mb-6">
        ← Back to browse
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant={skill.type === "OFFER" ? "default" : "secondary"} className="rounded-lg">
            {skill.type === "OFFER" ? "Offering" : "Requesting"}
          </Badge>
          <Badge variant="outline" className="rounded-lg">{CATEGORY_LABELS[skill.category]}</Badge>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight leading-tight">{skill.title}</h1>
      </div>

      <div className="space-y-6">
        {/* Description */}
        <Card>
          <CardContent className="pt-0">
            <h2 className="caption uppercase tracking-wider mb-3">Description</h2>
            <p className="body whitespace-pre-wrap">{skill.description}</p>
          </CardContent>
        </Card>

        {/* Availability */}
        {skill.availability && (
          <Card>
            <CardContent className="pt-0">
              <h2 className="caption uppercase tracking-wider mb-3">Availability</h2>
              <p className="body">{skill.availability}</p>
            </CardContent>
          </Card>
        )}

        {/* Author */}
        <Card>
          <CardContent className="pt-0">
            <h2 className="caption uppercase tracking-wider mb-3">
              {skill.type === "OFFER" ? "Posted by" : "Requested by"}
            </h2>
            <Link href={`/users/${skill.author.id}`} className="flex items-center gap-3 group">
              <Avatar className="h-12 w-12">
                <AvatarImage src={skill.author.image ?? undefined} />
                <AvatarFallback className="text-base">
                  {skill.author.name?.[0]?.toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium group-hover:underline">{skill.author.name}</p>
                {skill.author.reputation > 0 ? (
                  <p className="caption">
                    {skill.author.reputation.toFixed(1)} reputation
                  </p>
                ) : (
                  <p className="caption">No ratings yet</p>
                )}
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Actions */}
        {isOwner ? (
          <div className="flex gap-3 pt-2">
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
          <div className="pt-2 flex flex-wrap gap-3">
            {skill.type === "OFFER" ? (
              <RequestSessionDialog skillId={skill.id} />
            ) : (
              <p className="body-sm">
                This is a skill request. Reach out to {skill.author.name?.split(" ")[0]} if you can teach it!
              </p>
            )}
            <MessageButton userId={skill.author.id} />
          </div>
        ) : (
          <div className="pt-2">
            <Button asChild>
              <Link href="/login">Login to request this skill</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
