import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateProfile } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EditProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) redirect("/login");

  return (
    <div className="max-w-2xl mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>
            Update your public information. Others will see this when they view your profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateProfile} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" defaultValue={user.name ?? ""} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Avatar URL (optional)</Label>
              <Input
                id="image"
                name="image"
                type="url"
                placeholder="https://example.com/your-photo.jpg"
                defaultValue={user.image ?? ""}
              />
              <p className="text-xs text-muted-foreground">
                Paste a link to any image online. We&apos;ll add real uploads later.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                rows={5}
                placeholder="Tell others what you're studying, what you love teaching, and what you want to learn..."
                defaultValue={user.bio ?? ""}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit">Save Changes</Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/profile">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}