import { getOrCreateConversationAction } from "@/app/messages/actions";
import { Button } from "@/components/ui/button";

export function MessageButton({
  userId,
  variant = "outline",
}: {
  userId: string;
  variant?: "default" | "outline";
}) {
  return (
    <form
      action={async () => {
        "use server";
        await getOrCreateConversationAction(userId);
      }}
    >
      <Button type="submit" variant={variant}>
        Message
      </Button>
    </form>
  );
}
