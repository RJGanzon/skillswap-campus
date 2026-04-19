import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      skills: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!user) redirect("/login");

  const offers = user.skills.filter((s) => s.type === "OFFER");
  const requests = user.skills.filter((s) => s.type === "REQUEST");

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Header */}
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardDescription>Reputation</CardDescription>
            <CardTitle className="text-3xl">{user.reputation.toFixed(1)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Skills Offered</CardDescription>
            <CardTitle className="text-3xl">{offers.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Skills Requested</CardDescription>
            <CardTitle className="text-3xl">{requests.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* About */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          {user.bio ? (
            <p className="whitespace-pre-wrap">{user.bio}</p>
          ) : (
            <p className="text-muted-foreground italic">
              You haven&apos;t written a bio yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* My Skills */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">My Skills</h2>
        <Button asChild>
          <Link href="/skills/new">+ Post a Skill</Link>
        </Button>
      </div>

      {user.skills.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">You haven&apos;t posted any skills yet.</p>
          <Button asChild>
            <Link href="/skills/new">Post your first skill</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {user.skills.map((skill) => (
            <Link key={skill.id} href={`/skills/${skill.id}`}>
              <Card className="h-full hover:border-primary transition">
                <CardHeader>
                  <Badge variant={skill.type === "OFFER" ? "default" : "secondary"} className="w-fit mb-2">
                    {skill.type === "OFFER" ? "Offer" : "Request"}
                  </Badge>
                  <CardTitle className="line-clamp-1">{skill.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{skill.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}