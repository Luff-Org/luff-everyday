"use client";

import { useEffect, useState } from "react";
import { useTypingStore } from "@/store/useTypingStore";
import { Activity, LogOut, Settings, User } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DURATION_OPTIONS } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const { status, tick, duration, setDuration } = useTypingStore();
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  const isTypingPage = pathname === "/typing";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === "typing" && isTypingPage) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, tick, isTypingPage]);

  if (!mounted) return <header className="w-full h-20" />;

  return (
    <header className="w-full flex items-center justify-between h-20 text-sub-text">
      <Link
        href="/"
        className="flex items-center gap-2 text-2xl font-black text-primary cursor-pointer hover:opacity-80 transition-all"
      >
        <Activity className="w-8 h-8" />
        <span className="tracking-tighter lowercase">luff.</span>
      </Link>

      <div className="flex-1 flex justify-center">
        <AnimatePresence mode="wait">
          {isTypingPage && status === "idle" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-4 bg-background/30 backdrop-blur-md p-1.5 rounded-xl border border-sub-text/10 font-bold text-xs transition text-sub-text shadow-sm"
            >
              {DURATION_OPTIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => setDuration(t)}
                  className={`hover:text-foreground transition-all px-3 py-1.5 rounded-lg ${
                    duration === t
                      ? "text-primary bg-primary/10 shadow-inner"
                      : ""
                  }`}
                >
                  {t}s
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-6">
        <Link href="/settings" className="hover:text-foreground transition-all">
          <Settings className="w-5 h-5" />
        </Link>
        <AnimatePresence mode="wait">
          {session ? (
            <motion.div
              key="auth-user"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4 text-sm font-bold"
            >
              <span className="text-foreground/80">{session.user?.name}</span>
              <button
                onClick={() => signOut()}
                className="hover:text-error transition flex items-center gap-2 group"
              >
                <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="auth-guest"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => signIn("google")}
              className="hover:text-foreground transition flex items-center gap-2 group"
            >
              <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
