"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function pairKey(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export async function getOrCreateConversationAction(otherUserId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");
  if (otherUserId === session.user.id) throw new Error("Cannot message yourself");

  const [userAId, userBId] = pairKey(session.user.id, otherUserId);

  const conversation = await prisma.conversation.upsert({
    where: { userAId_userBId: { userAId, userBId } },
    create: { userAId, userBId },
    update: {},
  });

  redirect(`/messages/${conversation.id}`);
}

export async function sendMessage(conversationId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const trimmed = content.trim();
  if (!trimmed) throw new Error("Message cannot be empty");
  if (trimmed.length > 2000) throw new Error("Message too long");

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true, userAId: true, userBId: true },
  });
  if (!conversation) throw new Error("Conversation not found");

  const senderId = session.user.id;
  const recipientId =
    conversation.userAId === senderId
      ? conversation.userBId
      : conversation.userBId === senderId
      ? conversation.userAId
      : null;
  if (!recipientId) throw new Error("Not a participant");

  const [, sender] = await Promise.all([
    prisma.message.create({
      data: { conversationId, senderId, content: trimmed },
    }),
    prisma.user.findUnique({
      where: { id: senderId },
      select: { name: true },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);

  await notify({
    userId: recipientId,
    type: "MESSAGE_RECEIVED",
    message: `New message from ${sender?.name ?? "someone"}`,
    link: `/messages/${conversationId}`,
  });

  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/messages");
}
