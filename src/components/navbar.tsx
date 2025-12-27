"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const isRound2 =
    pathname?.includes("/round2") ||
    pathname?.includes("/leaderboard-r2");

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-xl font-bold text-foreground">
              CP Event
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            {status === "loading" ? (
              <span className="text-sm text-muted-foreground">
                Loading...
              </span>
            ) : session ? (
              <div className="flex items-center gap-2">
                {isRound2 && (
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(192,132,252,0.6)]" />
                )}
                <span
                  className={`text-xl font-bold ${
                    isRound2 ? "text-purple-300" : "text-foreground"
                  }`}
                >
                  {session.user?.name || "Team"}
                </span>
              </div>
            ) : pathname !== "/login" ? (
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}