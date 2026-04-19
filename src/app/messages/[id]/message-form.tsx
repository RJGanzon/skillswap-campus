"use client";

import { useState } from "react";
import { sendMessage } from "../actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function MessageForm({ conversationId }: { conversationId: string }) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    setError("");
    try {
      await sendMessage(conversationId, content);
      setContent("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message... (Enter to send, Shift+Enter for newline)"
        rows={2}
        className="flex-1 resize-none"
        maxLength={2000}
      />
      <Button type="submit" disabled={sending || !content.trim()}>
        {sending ? "Sending..." : "Send"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </form>
  );
}
