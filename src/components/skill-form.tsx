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
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium leading-none mb-2">I am...</legend>
          <div className="grid grid-cols-2 gap-3">
            <TypeOption
              value="OFFER"
              title="Offering"
              description="I can teach this skill to others"
              defaultChecked={(defaultValues?.type ?? "OFFER") === "OFFER"}
            />
            <TypeOption
              value="REQUEST"
              title="Requesting"
              description="I want to learn this skill"
              defaultChecked={defaultValues?.type === "REQUEST"}
            />
          </div>
        </fieldset>
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
            <SelectItem value="ACADEMIC">Academic</SelectItem>
            <SelectItem value="TECH">Tech</SelectItem>
            <SelectItem value="CREATIVE">Creative</SelectItem>
            <SelectItem value="SPORTS">Sports</SelectItem>
            <SelectItem value="LANGUAGE">Language</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
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

function TypeOption({
  value,
  title,
  description,
  defaultChecked,
}: {
  value: "OFFER" | "REQUEST";
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="cursor-pointer">
      <input
        type="radio"
        name="type"
        value={value}
        defaultChecked={defaultChecked}
        required
        className="peer sr-only"
      />
      <div className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-border/80 peer-checked:border-primary peer-checked:bg-primary/5 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background">
        <div className="text-sm font-semibold tracking-tight">{title}</div>
        <div className="text-xs text-muted-foreground mt-1 leading-snug">{description}</div>
      </div>
    </label>
  );
}