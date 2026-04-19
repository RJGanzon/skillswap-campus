import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      bio: true,
      reputation: true,
      createdAt: true,
    },
  });

  if (!user) notFound();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center gap-6 mb-8">
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
            ⭐ {user.reputation.toFixed(1)} reputation
          </p>
        </div>
      </div>

      <Card>
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
    </div>
  );
}