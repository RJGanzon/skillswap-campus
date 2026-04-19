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

export async function completeSession(sessionId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const sess = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!sess) throw new Error("Session not found");

  // Either participant can mark as complete
  if (sess.requesterId !== session.user.id && sess.providerId !== session.user.id) {
    throw new Error("Not authorized");
  }
  if (!["ACCEPTED", "ONGOING"].includes(sess.status)) {
    throw new Error("Session must be accepted before completing");
  }

  await prisma.session.update({
    where: { id: sessionId },
    data: { status: "COMPLETED" },
  });

  revalidatePath("/sessions");
  revalidatePath(`/sessions/${sessionId}`);
}

export async function rateSession(
  sessionId: string,
  stars: number,
  comment: string | null
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  if (stars < 1 || stars > 5) throw new Error("Stars must be 1-5");

  const sess = await prisma.session.findUnique({ where: { id: sessionId } });
  if (!sess) throw new Error("Session not found");
  if (sess.status !== "COMPLETED") throw new Error("Session not completed yet");

  // Determine who's being rated
  const raterId = session.user.id;
  let rateeId: string;
  if (sess.requesterId === raterId) {
    rateeId = sess.providerId;
  } else if (sess.providerId === raterId) {
    rateeId = sess.requesterId;
  } else {
    throw new Error("You are not a participant in this session");
  }

  // Check if already rated (unique constraint on sessionId + raterId)
  const existing = await prisma.rating.findFirst({
    where: { sessionId, raterId },
  });
  if (existing) throw new Error("You already rated this session");

  // Create the rating
  await prisma.rating.create({
    data: {
      sessionId,
      raterId,
      rateeId,
      stars,
      comment: comment?.trim() || null,
    },
  });

  // Recalculate the ratee's reputation (average of all ratings they received)
  const allRatings = await prisma.rating.findMany({
    where: { rateeId },
    select: { stars: true },
  });
  const avg = allRatings.reduce((sum, r) => sum + r.stars, 0) / allRatings.length;

  await prisma.user.update({
    where: { id: rateeId },
    data: { reputation: Math.round(avg * 10) / 10 }, // round to 1 decimal
  });

  revalidatePath("/sessions");
  revalidatePath(`/sessions/${sessionId}`);
  revalidatePath(`/users/${rateeId}`);
  revalidatePath("/profile");
}