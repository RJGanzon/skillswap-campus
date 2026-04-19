import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageForm } from "./message-form";
import { cn } from "@/lib/utils";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      userA: { select: { id: true, name: true, image: true } },
      userB: { select: { id: true, name: true, image: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!conversation) notFound();
  if (conversation.userAId !== userId && conversation.userBId !== userId) {
    notFound();
  }

  // Mark inbound messages as read
  await prisma.message.updateMany({
    where: {
      conversationId: id,
      senderId: { not: userId },
      read: false,
    },
    data: { read: true },
  });

  const other = conversation.userA.id === userId ? conversation.userB : conversation.userA;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 flex flex-col" style={{ minHeight: "calc(100vh - 3.5rem)" }}>
      <Link
        href="/messages"
        className="caption hover:text-foreground transition-colors inline-flex items-center gap-1 mb-6"
      >
        ← Back to messages
      </Link>

      <div className="flex items-center gap-3 pb-4 border-b border-border/60 mb-4">
        <Link href={`/users/${other.id}`} className="flex items-center gap-3 group">
          <Avatar className="h-10 w-10">
            <AvatarImage src={other.image ?? undefined} />
            <AvatarFallback>
              {other.name?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium group-hover:underline">{other.name}</p>
            <p className="caption">View profile</p>
          </div>
        </Link>
      </div>

      <div className="flex-1 space-y-3 mb-4">
        {conversation.messages.length === 0 ? (
          <p className="text-center body-sm py-12">
            No messages yet. Say hello!
          </p>
        ) : (
          conversation.messages.map((m) => {
            const isMine = m.senderId === userId;
            return (
              <div
                key={m.id}
                className={cn("flex", isMine ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2",
                    isMine
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted rounded-bl-sm"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                  <p
                    className={cn(
                      "text-[10px] mt-1",
                      isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}
                  >
                    {m.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="sticky bottom-4 bg-background pt-2">
        <MessageForm conversationId={id} />
      </div>
    </div>
  );
}
