import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          Trade skills. Not money.
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          SkillSwap Campus connects AUF students who want to learn with those who love to teach.
          No money — just peer-to-peer knowledge exchange.
        </p>
        <div className="flex gap-3 justify-center">
          <Button size="lg" asChild>
            <Link href="/register">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">I already have an account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}