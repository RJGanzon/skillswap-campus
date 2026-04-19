"use client";

import { useState } from "react";
import { rateSession } from "@/app/sessions/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function RateSessionDialog({ sessionId, rateeName }: { sessionId: string; rateeName: string }) {
  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (stars === 0) {
      setError("Please pick a star rating");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const comment = formData.get("comment")?.toString() ?? null;

    try {
      await rateSession(sessionId, stars, comment);
      setOpen(false);
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2">
        Leave a Rating
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate your session with {rateeName}</DialogTitle>
          <DialogDescription>
            How was the session? Your rating affects their reputation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Picker */}
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setStars(n)}
                  onMouseEnter={() => setHovered(n)}
                  onMouseLeave={() => setHovered(0)}
                  className="text-3xl transition-transform hover:scale-110"
                >
                  {(hovered || stars) >= n ? "★" : "☆"}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {stars === 0 ? "Click a star to rate" : `${stars} out of 5`}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment (optional)</Label>
            <Textarea
              id="comment"
              name="comment"
              rows={3}
              placeholder="What went well? Anything they could improve?"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Rating"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}