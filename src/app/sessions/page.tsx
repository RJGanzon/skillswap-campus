import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { acceptSession, declineSession, cancelSession, completeSession } from "./actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RateSessionDialog } from "@/components/rate-session-dialog";
import { SessionStatus } from "@prisma/client";

const STATUS_LABELS: Record<SessionStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  PENDING: { label: "Pending", variant: "secondary" },
  ACCEPTED: { label: "Accepted", variant: "default" },
  ONGOING: { label: "Ongoing", variant: "default" },
  COMPLETED: { label: "Completed", variant: "outline" },
  DECLINED: { label: "Declined", variant: "destructive" },
  CANCELLED: { label: "Cancelled", variant: "outline" },
};

export default async function SessionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  // Sessions where you're the provider (people requesting to learn from you)
const incoming = await prisma.session.findMany({
  where: { providerId: userId },
  include: {
    skill: { select: { id: true, title: true } },
    requester: { select: { id: true, name: true, image: true } },
    ratings: { where: { raterId: userId }, select: { id: true } },
  },
  orderBy: { createdAt: "desc" },
});

const outgoing = await prisma.session.findMany({
  where: { requesterId: userId },
  include: {
    skill: { select: { id: true, title: true } },
    provider: { select: { id: true, name: true, image: true } },
    ratings: { where: { raterId: userId }, select: { id: true } },
  },
  orderBy: { createdAt: "desc" },
});

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">Sessions</h1>
      <p className="text-muted-foreground mb-8">
        Track your incoming requests and the skills you&apos;ve requested from others.
      </p>

      {/* Incoming */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">
          Incoming Requests <span className="text-muted-foreground">({incoming.length})</span>
        </h2>
        {incoming.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No one has requested your skills yet.
          </p>
        ) : (
          <div className="space-y-3">
            {incoming.map((s) => (
              <Card key={s.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={s.requester.image ?? undefined} />
                        <AvatarFallback>
                          {s.requester.name?.[0]?.toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">
                          {s.requester.name} wants to learn{" "}
                          <Link href={`/skills/${s.skill.id}`} className="underline">
                            {s.skill.title}
                          </Link>
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          Requested {s.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={STATUS_LABELS[s.status].variant}>
                      {STATUS_LABELS[s.status].label}
                    </Badge>
                  </div>
                </CardHeader>
                {(s.message || s.status === "PENDING") && (
                <CardContent>
                {s.message && (
                    <p className="text-sm bg-muted p-3 rounded-md mb-3 whitespace-pre-wrap">
                    {s.message}
                    </p>
                )}
                {s.status === "PENDING" && (
                    <div className="flex gap-2">
                    <form action={async () => { "use server"; await acceptSession(s.id); }}>
                        <Button size="sm" type="submit">Accept</Button>
                    </form>
                    <form action={async () => { "use server"; await declineSession(s.id); }}>
                        <Button size="sm" variant="outline" type="submit">Decline</Button>
                    </form>
                    </div>
                )}
                {["ACCEPTED", "ONGOING"].includes(s.status) && (
                    <form action={async () => { "use server"; await completeSession(s.id); }}>
                    <Button size="sm" type="submit">Mark as Completed</Button>
                    </form>
                )}
                {s.status === "COMPLETED" && s.ratings.length === 0 && (
                    <RateSessionDialog sessionId={s.id} rateeName={s.requester.name ?? "them"} />
                )}
                {s.status === "COMPLETED" && s.ratings.length > 0 && (
                    <p className="text-sm text-muted-foreground">✅ You&apos;ve rated this session</p>
                )}
                </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Outgoing */}
      <section>
        <h2 className="text-xl font-semibold mb-4">
          My Requests <span className="text-muted-foreground">({outgoing.length})</span>
        </h2>
        {outgoing.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            You haven&apos;t requested any sessions yet.{" "}
            <Link href="/skills" className="underline">Browse skills</Link> to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {outgoing.map((s) => (
              <Card key={s.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={s.provider.image ?? undefined} />
                        <AvatarFallback>
                          {s.provider.name?.[0]?.toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">
                          Learning{" "}
                          <Link href={`/skills/${s.skill.id}`} className="underline">
                            {s.skill.title}
                          </Link>{" "}
                          from {s.provider.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          Sent {s.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={STATUS_LABELS[s.status].variant}>
                      {STATUS_LABELS[s.status].label}
                    </Badge>
                  </div>
                </CardHeader>
                {["PENDING", "ACCEPTED"].includes(s.status) && (
                  <CardContent>
                    <form
                      action={async () => {
                        "use server";
                        await cancelSession(s.id);
                      }}
                    >
                      <Button size="sm" variant="outline" type="submit">
                        Cancel Request
                      </Button>
                    </form>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}