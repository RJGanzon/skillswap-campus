import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { updateSkill } from "../../actions";
import { SkillForm } from "@/components/skill-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EditSkillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const skill = await prisma.skill.findUnique({ where: { id } });
  if (!skill) notFound();
  if (skill.authorId !== session.user.id) redirect(`/skills/${id}`);

  const boundUpdate = updateSkill.bind(null, skill.id);

  return (
    <div className="max-w-2xl mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Skill</CardTitle>
          <CardDescription>Update the details of your skill post.</CardDescription>
        </CardHeader>
        <CardContent>
          <SkillForm
            action={boundUpdate}
            mode="edit"
            defaultValues={{
              title: skill.title,
              description: skill.description,
              type: skill.type,
              category: skill.category,
              availability: skill.availability ?? undefined,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}