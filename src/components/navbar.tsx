"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session, status } = useSession();

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
              <span className="text-sm text-muted-foreground">Loading...</span>
            ) : session ? (
              <>
                <span className="text-sm text-foreground">
                  {session.user?.email}
                </span>
                <Button onClick={() => signOut()} variant="outline">
                  Sign out
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

