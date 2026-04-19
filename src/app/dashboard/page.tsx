import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <Button variant="outline" type="submit">Logout</Button>
          </form>
        </div>
        <p>Welcome, {session.user.name}! 👋</p>
        <p className="text-sm text-muted-foreground mt-2">
          Email: {session.user.email}
        </p>
      </div>
    </div>
  );
}