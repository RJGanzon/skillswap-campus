"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SkillType, Category } from "@prisma/client";

export async function createSkill(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const type = formData.get("type")?.toString() as SkillType;
  const category = formData.get("category")?.toString() as Category;
  const availability = formData.get("availability")?.toString().trim() || null;

  if (!title || title.length < 3) throw new Error("Title must be at least 3 characters");
  if (!description || description.length < 10) throw new Error("Description must be at least 10 characters");
  if (!["OFFER", "REQUEST"].includes(type)) throw new Error("Invalid type");
  if (!["ACADEMIC", "TECH", "CREATIVE", "SPORTS", "LANGUAGE", "OTHER"].includes(category)) {
    throw new Error("Invalid category");
  }

  const skill = await prisma.skill.create({
    data: {
      title,
      description,
      type,
      category,
      availability,
      authorId: session.user.id,
    },
  });

  revalidatePath("/skills");
  revalidatePath("/profile");
  redirect(`/skills/${skill.id}`);
}

export async function updateSkill(skillId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const skill = await prisma.skill.findUnique({ where: { id: skillId } });
  if (!skill) throw new Error("Skill not found");
  if (skill.authorId !== session.user.id) throw new Error("Not authorized");

  const title = formData.get("title")?.toString().trim();
  const description = formData.get("description")?.toString().trim();
  const category = formData.get("category")?.toString() as Category;
  const availability = formData.get("availability")?.toString().trim() || null;

  if (!title || title.length < 3) throw new Error("Title must be at least 3 characters");
  if (!description || description.length < 10) throw new Error("Description must be at least 10 characters");

  await prisma.skill.update({
    where: { id: skillId },
    data: { title, description, category, availability },
  });

  revalidatePath("/skills");
  revalidatePath(`/skills/${skillId}`);
  revalidatePath("/profile");
  redirect(`/skills/${skillId}`);
}

export async function deleteSkill(skillId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Not authenticated");

  const skill = await prisma.skill.findUnique({ where: { id: skillId } });
  if (!skill) throw new Error("Skill not found");
  if (skill.authorId !== session.user.id) throw new Error("Not authorized");

  await prisma.skill.delete({ where: { id: skillId } });

  revalidatePath("/skills");
  revalidatePath("/profile");
  redirect("/skills");
}