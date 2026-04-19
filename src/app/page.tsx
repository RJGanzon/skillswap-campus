import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-xs font-medium mb-6">
          <span className="size-1.5 rounded-full bg-green-500"></span>
          Built for AUF Students
        </div>

        <h1 className="h1-display mb-6">
          Trade skills.<br />
          <span className="text-muted-foreground">Not money.</span>
        </h1>

        <p className="body-lg mb-10 max-w-xl mx-auto">
          SkillSwap Campus connects students who want to learn with those who love to teach.
          Peer-to-peer knowledge exchange, zero fees.
        </p>

        <div className="flex gap-3 justify-center">
          <Button size="lg" asChild>
            <Link href="/register">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">I already have an account</Link>
          </Button>
        </div>

        <p className="caption mt-12">
          Made with ❤️ by Angeles University Foundation students
        </p>
      </div>
    </div>
  );
}