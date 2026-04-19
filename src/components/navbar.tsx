import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    <nav className="border-b bg-background">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-16">
        {/* Logo / Brand */}
        <Link href="/" className="font-bold text-lg">
          SkillSwap <span className="text-muted-foreground">Campus</span>
        </Link>

        {/* Center Links */}
        {user && (
        <div className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/dashboard" className="hover:text-primary">
            Dashboard
            </Link>
            <Link href="/skills" className="hover:text-primary">
            Browse Skills
            </Link>
            <Link href="/sessions" className="hover:text-primary">
            Sessions
            </Link>
            <Link href="/profile" className="hover:text-primary">
            My Profile
            </Link>
        </div>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full hover:opacity-80 transition outline-none">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.image ?? undefined} />
                  <AvatarFallback>
                    {user.name?.[0]?.toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground font-normal">
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
                    className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
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