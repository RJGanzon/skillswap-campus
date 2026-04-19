"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SkillFormProps = {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: {
    title?: string;
    description?: string;
    type?: "OFFER" | "REQUEST";
    category?: string;
    availability?: string;
  };
  mode: "create" | "edit";
};

export function SkillForm({ action, defaultValues, mode }: SkillFormProps) {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    try {
      await action(formData);
    } catch (err) {
      setSubmitting(false);
      alert(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {mode === "create" && (
        <div className="space-y-2">
          <Label htmlFor="type">I am...</Label>
          <Select name="type" defaultValue={defaultValues?.type ?? "OFFER"} required>
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OFFER">Offering a skill (I can teach)</SelectItem>
              <SelectItem value="REQUEST">Requesting a skill (I want to learn)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Python Programming for Beginners"
          defaultValue={defaultValues?.title}
          required
          minLength={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={5}
          placeholder="What exactly can you teach or want to learn? Include your level, topics covered, and what the other person should expect."
          defaultValue={defaultValues?.description}
          required
          minLength={10}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select name="category" defaultValue={defaultValues?.category ?? "ACADEMIC"} required>
          <SelectTrigger id="category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACADEMIC">📚 Academic</SelectItem>
            <SelectItem value="TECH">💻 Tech</SelectItem>
            <SelectItem value="CREATIVE">🎨 Creative</SelectItem>
            <SelectItem value="SPORTS">⚽ Sports</SelectItem>
            <SelectItem value="LANGUAGE">🌍 Language</SelectItem>
            <SelectItem value="OTHER">✨ Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="availability">Availability (optional)</Label>
        <Input
          id="availability"
          name="availability"
          placeholder="e.g. Weekends, MWF evenings, Flexible"
          defaultValue={defaultValues?.availability}
        />
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : mode === "create" ? "Post Skill" : "Save Changes"}
      </Button>
    </form>
  );
}