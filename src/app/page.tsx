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
      </div>
    </div>
  );
}