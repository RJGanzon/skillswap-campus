import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

export async function notify(input: {
  userId: string;
  type: NotificationType;
  message: string;
  link?: string;
}) {
  await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      message: input.message,
      link: input.link ?? null,
    },
  });
}
