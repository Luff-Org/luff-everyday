"use client";

import { useEffect } from "react";
import { useTypingStore } from "@/store/useTypingStore";
import { Activity, LogOut, Settings, User } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header({ isLanding = false }: { isLanding?: boolean }) {
  const { status, tick, duration, setDuration } = useTypingStore();
  const { data: session } = useSession();
  const pathname = usePathname();
  const isTypingPage = pathname === "/typing";

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "typing" && isTypingPage) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, tick, isTypingPage]);

  return (
    <header className="w-full flex items-center justify-between py-6 text-sub-text">
      <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary cursor-pointer hover:text-foreground transition">
        <Activity className="w-8 h-8" />
        <span className="tracking-tighter">Luff-Everyday</span>
      </Link>

      {isTypingPage && status === "idle" && (
        <div className="flex gap-4 bg-background/50 p-2 rounded-full font-medium text-sm transition text-sub-text">
          {[15, 30, 60, 120].map((t) => (
            <button
              key={t}
              onClick={() => setDuration(t)}
              className={`hover:text-foreground transition ${duration === t ? "text-primary bg-primary/10 px-2 rounded" : "px-2"}`}
            >
              {t}s
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-6">
        <Link href="/settings" className="hover:text-foreground transition">
          <Settings className="w-5 h-5" />
        </Link>
        {session ? (
          <div className="flex items-center gap-4 text-sm font-medium">
             <span className="text-foreground">{session.user?.name}</span>
             <button onClick={() => signOut()} className="hover:text-error transition flex items-center gap-2">
                <LogOut className="w-5 h-5" />
             </button>
          </div>
        ) : (
          <button onClick={() => signIn("google")} className="hover:text-foreground transition flex items-center gap-2">
              <User className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
}
