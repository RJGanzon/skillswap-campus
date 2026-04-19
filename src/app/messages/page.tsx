import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { relativeTime } from "@/lib/relative-time";
import { cn } from "@/lib/utils";

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ userAId: userId }, { userBId: userId }] },
    include: {
      userA: { select: { id: true, name: true, image: true } },
      userB: { select: { id: true, name: true, image: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true, senderId: true, read: true },
      },
      _count: {
        select: {
          messages: { where: { read: false, senderId: { not: userId } } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="h1-page">Messages</h1>
        <p className="body-sm mt-2">
          Direct messages with other students.
        </p>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-border/60">
          <p className="h3-card mb-2">No conversations yet</p>
          <p className="body-sm">
            Start a conversation by clicking &quot;Message&quot; on someone&apos;s profile or skill post.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/60 overflow-hidden">
          {conversations.map((c) => {
            const other = c.userA.id === userId ? c.userB : c.userA;
            const lastMessage = c.messages[0];
            const unreadCount = c._count.messages;
            return (
              <Link
                key={c.id}
                href={`/messages/${c.id}`}
                className={cn(
                  "flex items-center gap-3 p-4 border-b border-border/40 last:border-0 hover:bg-accent/40 transition-colors",
                  unreadCount > 0 && "bg-primary/5"
                )}
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage src={other.image ?? undefined} />
                  <AvatarFallback>
                    {other.name?.[0]?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("text-sm truncate", unreadCount > 0 ? "font-semibold" : "font-medium")}>
                      {other.name}
                    </p>
                    {lastMessage && (
                      <span className="caption shrink-0">
                        {relativeTime(lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {lastMessage
                      ? `${lastMessage.senderId === userId ? "You: " : ""}${lastMessage.content}`
                      : "No messages yet"}
                  </p>
                </div>
                {unreadCount > 0 && (
                  <span className="inline-flex min-w-5 h-5 px-1.5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
