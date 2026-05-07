"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isValidStatusTransition, VALID_SESSION_TRANSITIONS } from "@/lib/validation";

/**
 * Request a learning session for a skill
 */
export async function requestSession(skillId: string, message: string | null) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Not authenticated");

    // Validate skill exists
    const skill = await prisma.skill.findUnique({
      where: { id: skillId },
      include: { author: true },
    });
    if (!skill) throw new Error("Skill not found");

    // Prevent self-requests
    if (skill.authorId === session.user.id) {
      throw new Error("You can't request your own skill");
    }

    // Only OFFERS can be requested
    if (skill.type !== "OFFER") {
      throw new Error("Only offered skills can be requested");
    }

    // Check for duplicate active requests
    const existing = await prisma.session.findFirst({
      where: {
        skillId,
        requesterId: session.user.id,
        status: { in: ["PENDING", "ACCEPTED", "ONGOING"] },
      },
    });
    if (existing) throw new Error("You already have an active request for this skill");

    // Create session with transaction for consistency
    const newSession = await prisma.session.create({
      data: {
        skillId,
        requesterId: session.user.id,
        providerId: skill.authorId,
        message: message?.trim() || null,
        status: "PENDING",
      },
    });

    // Notify provider
    await notify({
      userId: skill.authorId,
      type: "SESSION_REQUEST",
      message: `${session.user.name ?? "Someone"} requested your skill "${skill.title}"`,
      link: "/sessions",
    });

    revalidatePath(`/skills/${skillId}`);
    revalidatePath("/sessions");
    redirect("/sessions");
  } catch (error) {
    console.error("requestSession error:", error);
    throw error;
  }
}

/**
 * Accept a session request
 */
export async function acceptSession(sessionId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Not authenticated");

    const sess = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!sess) throw new Error("Session not found");

    // Authorization check
    if (sess.providerId !== session.user.id) {
      throw new Error("Only the provider can accept this session");
    }

    // Validate state transition
    if (!isValidStatusTransition(sess.status, "ACCEPTED")) {
      throw new Error(`Cannot accept session in ${sess.status} status`);
    }

    // Update status
    await prisma.session.update({
      where: { id: sessionId },
      data: { status: "ACCEPTED" },
    });

    // Notify requester
    const skill = await prisma.skill.findUnique({
      where: { id: sess.skillId },
      select: { title: true },
    });
    await notify({
      userId: sess.requesterId,
      type: "SESSION_ACCEPTED",
      message: `${session.user.name ?? "Your provider"} accepted your request for "${skill?.title ?? "a skill"}"`,
      link: "/sessions",
    });

    revalidatePath("/sessions");
  } catch (error) {
    console.error("acceptSession error:", error);
    throw error;
  }
}

/**
 * Decline a session request
 */
export async function declineSession(sessionId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Not authenticated");

    const sess = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!sess) throw new Error("Session not found");

    // Authorization check
    if (sess.providerId !== session.user.id) {
      throw new Error("Only the provider can decline this session");
    }

    // Validate state transition
    if (!isValidStatusTransition(sess.status, "DECLINED")) {
      throw new Error(`Cannot decline session in ${sess.status} status`);
    }

    // Update status
    await prisma.session.update({
      where: { id: sessionId },
      data: { status: "DECLINED" },
    });

    // Notify requester
    const skill = await prisma.skill.findUnique({
      where: { id: sess.skillId },
      select: { title: true },
    });
    await notify({
      userId: sess.requesterId,
      type: "SESSION_DECLINED",
      message: `${session.user.name ?? "Your provider"} declined your request for "${skill?.title ?? "a skill"}"`,
      link: "/sessions",
    });

    revalidatePath("/sessions");
  } catch (error) {
    console.error("declineSession error:", error);
    throw error;
  }
}

/**
 * Cancel a session (requester only)
 */
export async function cancelSession(sessionId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Not authenticated");

    const sess = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!sess) throw new Error("Session not found");

    // Only requester can cancel
    if (sess.requesterId !== session.user.id) {
      throw new Error("Only the requester can cancel this session");
    }

    // Validate state transition
    if (!isValidStatusTransition(sess.status, "CANCELLED")) {
      throw new Error(`Cannot cancel session in ${sess.status} status`);
    }

    // Update status
    await prisma.session.update({
      where: { id: sessionId },
      data: { status: "CANCELLED" },
    });

    // Notify provider
    await notify({
      userId: sess.providerId,
      type: "SESSION_CANCELLED",
      message: `${session.user.name ?? "The requester"} cancelled their session request`,
      link: "/sessions",
    });

    revalidatePath("/sessions");
  } catch (error) {
    console.error("cancelSession error:", error);
    throw error;
  }
}

/**
 * Mark a session as completed
 */
export async function completeSession(sessionId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Not authenticated");

    const sess = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!sess) throw new Error("Session not found");

    // Check authorization (either participant)
    const isParticipant =
      sess.requesterId === session.user.id || sess.providerId === session.user.id;
    if (!isParticipant) {
      throw new Error("You are not a participant in this session");
    }

    // Validate state transition
    if (!isValidStatusTransition(sess.status, "COMPLETED")) {
      throw new Error(`Cannot complete session in ${sess.status} status`);
    }

    // Update status
    await prisma.session.update({
      where: { id: sessionId },
      data: { status: "COMPLETED" },
    });

    // Notify the other participant
    const otherUserId =
      sess.requesterId === session.user.id ? sess.providerId : sess.requesterId;
    await notify({
      userId: otherUserId,
      type: "SESSION_COMPLETED",
      message: `${session.user.name ?? "The other participant"} marked your session as completed. Leave a rating?`,
      link: "/sessions",
    });

    revalidatePath("/sessions");
    revalidatePath(`/sessions/${sessionId}`);
  } catch (error) {
    console.error("completeSession error:", error);
    throw error;
  }
}

/**
 * Rate a completed session
 */
export async function rateSession(
  sessionId: string,
  stars: number,
  comment: string | null
) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Not authenticated");

    // Validate rating value
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      throw new Error("Rating must be between 1 and 5 stars");
    }

    // Fetch session
    const sess = await prisma.session.findUnique({ 
      where: { id: sessionId },
      include: {
        skill: { select: { title: true } },
        requester: { select: { name: true } },
        provider: { select: { name: true } },
      }
    });
    if (!sess) throw new Error("Session not found");

    // Validate session is completed
    if (sess.status !== "COMPLETED") {
      throw new Error("Can only rate completed sessions");
    }

    // Determine rater and ratee
    const raterId = session.user.id;
    let rateeId: string;

    if (sess.requesterId === raterId) {
      rateeId = sess.providerId;
    } else if (sess.providerId === raterId) {
      rateeId = sess.requesterId;
    } else {
      throw new Error("You are not a participant in this session");
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Check if already rated
      const existing = await tx.rating.findFirst({
        where: { sessionId, raterId },
      });
      if (existing) {
        throw new Error("You already rated this session");
      }

      // Create rating
      const newRating = await tx.rating.create({
        data: {
          sessionId,
          raterId,
          rateeId,
          stars,
          comment: comment?.trim() || null,
        },
      });

      // Recalculate reputation (Bayesian average for better accuracy)
      const allRatings = await tx.rating.findMany({
        where: { rateeId },
        select: { stars: true },
      });

      // Bayesian average: (sum + default_stars * min_ratings) / (count + min_ratings)
      // This prevents extreme ratings from new users
      const avg =
        allRatings.reduce((sum, r) => sum + r.stars, 0) / Math.max(1, allRatings.length);
      const minRatings = 5;
      const defaultStars = 3;
      const bayesianAvg =
        (avg * allRatings.length + defaultStars * minRatings) /
        (allRatings.length + minRatings);

      // Update user reputation
      await tx.user.update({
        where: { id: rateeId },
        data: {
          reputation: Math.round(bayesianAvg * 10) / 10, // Round to 1 decimal
        },
      });

      return newRating;
    });

    // Notify ratee
    await notify({
      userId: rateeId,
      type: "RATING_RECEIVED",
      message: `${session.user.name ?? "Someone"} left you a ${stars}-star rating`,
      link: `/users/${rateeId}`,
    });

    revalidatePath("/sessions");
    revalidatePath(`/sessions/${sessionId}`);
    revalidatePath(`/users/${rateeId}`);
    revalidatePath("/profile");

    return result;
  } catch (error) {
    console.error("rateSession error:", error);
    throw error;
  }
}