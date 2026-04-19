"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const name = formData.get("name")?.toString().trim();
  const bio = formData.get("bio")?.toString().trim() || null;
  const image = formData.get("image")?.toString().trim() || null;

  if (!name || name.length < 2) {
    throw new Error("Name must be at least 2 characters");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name, bio, image },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  redirect("/profile");
}