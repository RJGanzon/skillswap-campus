import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) redirect("/login");

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="text-2xl">
              {user.name?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Member since {user.createdAt.toLocaleDateString()}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href="/profile/edit">Edit Profile</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Reputation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{user.reputation.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">out of 5.0</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Skills Posted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">offers + requests</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          {user.bio ? (
            <p className="whitespace-pre-wrap">{user.bio}</p>
          ) : (
            <p className="text-muted-foreground italic">
              You haven&apos;t written a bio yet. Click &quot;Edit Profile&quot; to add one.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}