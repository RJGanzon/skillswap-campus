import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationsBell } from "@/components/notifications-bell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-14">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm">
            S
          </span>
          <span>SkillSwap</span>
        </Link>

        {/* Center Links */}
        {user && (
          <div className="hidden md:flex items-center gap-1 text-sm">
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/skills">Browse</NavLink>
            <NavLink href="/sessions">Sessions</NavLink>
            <NavLink href="/messages">Messages</NavLink>
            <NavLink href="/profile">Profile</NavLink>
          </div>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-1">
          {user && <NotificationsBell />}
          <ThemeToggle />
          {!user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full hover:opacity-80 transition outline-none">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image ?? undefined} />
                  <AvatarFallback className="text-xs font-medium">
                    {user.name?.[0]?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 mt-1">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground font-normal truncate">
                        {user.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href="/dashboard" className="w-full">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/profile" className="w-full">My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/sessions" className="w-full">Sessions</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/messages" className="w-full">Messages</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/skills" className="w-full">Browse Skills</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/login" });
                  }}
                >
                  <button
                    type="submit"
                    className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm transition-colors"
                  >
                    Logout
                  </button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
    >
      {children}
    </Link>
  );
}