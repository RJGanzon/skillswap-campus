"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function requestSession(skillId: string, message: string | null) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const skill = await prisma.skill.findUnique({
    where: { id: skillId },
    include: { author: true },
  });
  if (!skill) throw new Error("Skill not found");

  // Can't request your own skill
  if (skill.authorId === session.user.id) {
    throw new Error("You can't request your own skill");
  }

  // Only OFFERS can be requested (for v1 simplicity)
  if (skill.type !== "OFFER") {
    throw new Error("Only offered skills can be requested");
  }

  // Check if a pending session already exists between these two users for this skill
  const existing = await prisma.session.findFirst({
    where: {
      skillId,
      requesterId: session.user.id,
      status: { in: ["PENDING", "ACCEPTED", "ONGOING"] },
    },
  });
  if (existing) throw new Error("You already have an active request for this skill");

  await prisma.session.create({
    data: {
      skillId,
      requesterId: session.user.id, // the learner
      providerId: skill.authorId,    // the teacher
      message: message?.trim() || null,
      status: "PENDING",
    },
  });

  revalidatePath(`/skills/${skillId}`);
  revalidatePath("/sessions");
  redirect("/sessions");
}

export async function acceptSession(sessionId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const sess = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!sess) throw new Error("Session not found");
  if (sess.providerId !== session.user.id) throw new Error("Not authorized");
  if (sess.status !== "PENDING") throw new Error("Session not pending");

  await prisma.session.update({
    where: { id: sessionId },
    data: { status: "ACCEPTED" },
  });

  revalidatePath("/sessions");
}

export async function declineSession(sessionId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const sess = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!sess) throw new Error("Session not found");
  if (sess.providerId !== session.user.id) throw new Error("Not authorized");
  if (sess.status !== "PENDING") throw new Error("Session not pending");

  await prisma.session.update({
    where: { id: sessionId },
    data: { status: "DECLINED" },
  });

  revalidatePath("/sessions");
}

export async function cancelSession(sessionId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const sess = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!sess) throw new Error("Session not found");
  if (sess.requesterId !== session.user.id) throw new Error("Not authorized");
  if (!["PENDING", "ACCEPTED"].includes(sess.status)) {
    throw new Error("Cannot cancel this session");
  }

  await prisma.session.update({
    where: { id: sessionId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/sessions");
}