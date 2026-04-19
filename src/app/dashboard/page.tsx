import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {session.user.name?.split(" ")[0]}! 👋</h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s your SkillSwap Campus at a glance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardDescription>Skills Offered</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Active Sessions</CardDescription>
            <CardTitle className="text-3xl">0</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Reputation</CardDescription>
            <CardTitle className="text-3xl">—</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="mt-8 p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground">
        You haven&apos;t posted any skills yet. Start by browsing what others offer or post your first skill!
      </div>
    </div>
  );
}