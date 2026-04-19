import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="h1-page mb-3">Page not found</h1>
        <p className="body-sm mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/skills">Browse skills</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
