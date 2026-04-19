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
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
        <div className="flex items-center gap-5">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="text-2xl">
              {user.name?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="h1-page">{user.name}</h1>
            <p className="body-sm mt-1">{user.email}</p>
            <p className="caption mt-0.5">
              Member since {user.createdAt.toLocaleDateString()}
            </p>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href="/profile/edit">Edit Profile</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        <StatBlock label="Reputation" value={user.reputation > 0 ? user.reputation.toFixed(1) : "—"} />
        <StatBlock label="Skills Offered" value={offers.length.toString()} />
        <StatBlock label="Skills Requested" value={requests.length.toString()} />
      </div>

      {/* About */}
      <Card className="mb-10">
        <CardHeader>
          <CardTitle className="h3-card">About</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {user.bio ? (
            <p className="body whitespace-pre-wrap">{user.bio}</p>
          ) : (
            <p className="body-sm italic">
              You haven&apos;t written a bio yet.{" "}
              <Link href="/profile/edit" className="underline hover:text-foreground">
                Add one
              </Link>
            </p>
          )}
        </CardContent>
      </Card>

      {/* My Skills */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="h2-section">My Skills</h2>
        <Button size="sm" asChild>
          <Link href="/skills/new">+ Post a Skill</Link>
        </Button>
      </div>

      {user.skills.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border/60">
          <p className="body-sm mb-4">You haven&apos;t posted any skills yet.</p>
          <Button asChild>
            <Link href="/skills/new">Post your first skill</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {user.skills.map((skill) => (
            <Link key={skill.id} href={`/skills/${skill.id}`} className="group">
              <Card className="h-full group-hover:border-primary/40 transition-colors">
                <CardHeader className="gap-2">
                  <Badge variant={skill.type === "OFFER" ? "default" : "secondary"} className="w-fit rounded-lg">
                    {skill.type === "OFFER" ? "Offering" : "Requesting"}
                  </Badge>
                  <CardTitle className="h3-card line-clamp-1">{skill.title}</CardTitle>
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

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-2xl border border-border/60 bg-card">
      <p className="caption mb-1">{label}</p>
      <p className="text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
