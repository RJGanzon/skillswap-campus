"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const justRegistered = params.get("registered") === "true";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg font-semibold mb-6">
          S
        </Link>
        <h1 className="h1-page">Welcome back</h1>
        <p className="body-sm mt-2">Sign in to your SkillSwap Campus account</p>
      </div>

      {justRegistered && (
        <div className="mb-6 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
          <p className="text-sm text-green-700 dark:text-green-400 text-center">
            Account created. Please sign in.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        <Button type="submit" className="w-full" disabled={loading} size="lg">
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <p className="body-sm text-center mt-8">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-foreground font-medium hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
