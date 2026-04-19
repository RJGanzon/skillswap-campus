import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { markAllNotificationsRead } from "@/app/notifications/actions";
import { relativeTime } from "@/lib/relative-time";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export async function NotificationsBell() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const userId = session.user.id;

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.notification.count({ where: { userId, read: false } }),
  ]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Notifications"
        className="relative inline-flex size-9 items-center justify-center rounded-xl hover:bg-accent transition-colors outline-none"
      >
        <BellIcon className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 inline-flex min-w-4 h-4 px-1 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-semibold leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 mt-1 p-0">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm font-medium">Notifications</span>
          {unreadCount > 0 && (
            <form
              action={async () => {
                "use server";
                await markAllNotificationsRead();
              }}
            >
              <button
                type="submit"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Mark all read
              </button>
            </form>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        {notifications.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">
            You&apos;re all caught up
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={n.link ?? "/dashboard"}
                className={cn(
                  "block px-3 py-2.5 hover:bg-accent transition-colors border-b border-border/40 last:border-0",
                  !n.read && "bg-primary/5"
                )}
              >
                <p className="text-sm leading-snug">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {relativeTime(n.createdAt)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
