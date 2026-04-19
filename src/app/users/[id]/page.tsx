import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageButton } from "@/components/message-button";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      image: true,
      bio: true,
      reputation: true,
      createdAt: true,
    },
  });

  if (!user) notFound();

  const ratings = await prisma.rating.findMany({
    where: { rateeId: id },
    include: {
      rater: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="text-2xl">
              {user.name?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Member since {user.createdAt.toLocaleDateString()}
            </p>
            <p className="text-sm mt-2">
              {user.reputation.toFixed(1)} reputation
              {ratings.length > 0 && (
                <span className="text-muted-foreground"> ({ratings.length} {ratings.length === 1 ? "rating" : "ratings"})</span>
              )}
            </p>
          </div>
        </div>
        {session?.user?.id && session.user.id !== user.id && (
          <MessageButton userId={user.id} />
        )}
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>About {user.name?.split(" ")[0]}</CardTitle>
        </CardHeader>
        <CardContent>
          {user.bio ? (
            <p className="whitespace-pre-wrap">{user.bio}</p>
          ) : (
            <p className="text-muted-foreground italic">
              This user hasn&apos;t written a bio yet.
            </p>
          )}
        </CardContent>
      </Card>

      {ratings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Ratings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ratings.map((r) => (
              <div key={r.id} className="border-b last:border-0 pb-4 last:pb-0">
                <div className="flex items-center gap-3 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={r.rater.image ?? undefined} />
                    <AvatarFallback className="text-xs">
                      {r.rater.name?.[0]?.toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{r.rater.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.stars} / 5 · {r.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {r.comment && <p className="text-sm ml-11 whitespace-pre-wrap">{r.comment}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}