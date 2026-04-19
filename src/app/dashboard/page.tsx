import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  const [skillCount, pendingIncoming, activeCount, user] = await Promise.all([
    prisma.skill.count({ where: { authorId: userId } }),
    prisma.session.count({
      where: { providerId: userId, status: "PENDING" },
    }),
    prisma.session.count({
      where: {
        OR: [{ requesterId: userId }, { providerId: userId }],
        status: { in: ["ACCEPTED", "ONGOING"] },
      },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { reputation: true } }),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="h1-page">
          Welcome back, {session.user.name?.split(" ")[0]} 👋
        </h1>
        <p className="body-sm mt-2">
          Here&apos;s a quick look at your SkillSwap Campus activity.
        </p>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <StatCard label="Skills Posted" value={skillCount.toString()} />
        <StatCard label="Pending Requests" value={pendingIncoming.toString()} highlight={pendingIncoming > 0} />
        <StatCard label="Active Sessions" value={activeCount.toString()} />
        <StatCard label="Reputation" value={user?.reputation.toFixed(1) ?? "—"} suffix="/ 5" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
        <ActionCard
          title="Post a Skill"
          description="Share what you can teach or request something to learn."
          href="/skills/new"
          cta="Get started"
        />
        <ActionCard
          title="Browse Skills"
          description="Find students offering skills or requesting help."
          href="/skills"
          cta="Explore"
        />
      </div>

      {pendingIncoming > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="h3-card">
              You have {pendingIncoming} pending session {pendingIncoming === 1 ? "request" : "requests"}
            </CardTitle>
            <CardDescription>
              Review them and decide whether to accept or decline.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/sessions">View Sessions</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ label, value, suffix, highlight }: { label: string; value: string; suffix?: string; highlight?: boolean }) {
  return (
    <Card className={highlight ? "border-primary/40" : ""}>
      <CardHeader className="pb-2">
        <CardDescription className="caption">{label}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tracking-tight">
          {value}
          {suffix && <span className="text-sm text-muted-foreground font-normal ml-1">{suffix}</span>}
        </p>
      </CardContent>
    </Card>
  );
}

function ActionCard({ title, description, href, cta }: { title: string; description: string; href: string; cta: string }) {
  return (
    <Card className="hover:border-primary/40 transition-colors">
      <CardHeader>
        <CardTitle className="h3-card">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" size="sm" asChild>
          <Link href={href}>{cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}