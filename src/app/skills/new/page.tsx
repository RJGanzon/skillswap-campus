import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createSkill } from "../actions";
import { SkillForm } from "@/components/skill-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewSkillPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Post a Skill</CardTitle>
          <CardDescription>
            Share something you can teach or request something you want to learn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SkillForm action={createSkill} mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}