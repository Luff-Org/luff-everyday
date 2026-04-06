"use client";

import { useEffect, useState } from "react";
import { useTypingStore } from "@/store/useTypingStore";
import { Activity, LogOut, Settings, User } from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DURATION_OPTIONS } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { Tooltip } from "@/components/ui/Tooltip";

function NavIcon({
  href,
  onClick,
  icon: Icon,
  label,
  className = "",
}: {
  href?: string;
  onClick?: () => void;
  icon: any;
  label: string;
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const content = (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex items-center justify-center p-1.5"
    >
      <Icon
        className={`w-5 h-5 transition-all duration-300 ${
          isHovered ? "scale-110 text-foreground" : "text-sub-text"
        } ${className}`}
      />
    </div>
  );

  return (
    <Tooltip content={label} position="bottom">
      {href ? (
        <Link href={href} className="outline-none">
          {content}
        </Link>
      ) : (
        <button onClick={onClick} className="outline-none cursor-pointer">
          {content}
        </button>
      )}
    </Tooltip>
  );
}

export default function Header() {
  const { status, tick, duration, setDuration } = useTypingStore();
  const { data: session, status: authStatus } = useSession();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [hasNotified, setHasNotified] = useState(false);

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

  // Toast notifications for Auth
  useEffect(() => {
    if (authStatus === "authenticated" && session?.user && !hasNotified) {
      toast.success(`Welcome back, ${session.user.name?.split(" ")[0]}!`, {
        description: "Your stats are being synced.",
      });
      setHasNotified(true);
    } else if (authStatus === "unauthenticated" && hasNotified) {
      toast.info("Logged out successfully.");
      setHasNotified(false);
    }
  }, [authStatus, session, hasNotified]);

  if (!mounted) return <header className="w-full h-20" />;

  return (
    <header className="sticky top-0 z-50 w-full flex flex-col md:flex-row items-center justify-between min-h-[5rem] py-4 px-6 md:py-0 text-sub-text bg-background/80 backdrop-blur-md transition-all duration-300">
      <div className="w-full md:w-auto flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-black text-primary cursor-pointer hover:opacity-80 transition-all font-mono"
        >
          <Activity className="w-8 h-8" />
          <span className="tracking-tighter">luff.</span>
        </Link>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-4">
          <NavIcon href="/settings" icon={Settings} label="Settings" />
          <AnimatePresence mode="wait">
            {session ? (
              <motion.div
                key="auth-user-mobile-btn"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <NavIcon
                  onClick={() => signOut()}
                  icon={LogOut}
                  label="Log Out"
                  className="hover:text-error"
                />
              </motion.div>
            ) : (
              <motion.div
                key="auth-guest-mobile-btn"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <NavIcon
                  onClick={() => signIn("google")}
                  icon={User}
                  label="Login"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 flex justify-center w-full md:w-auto mt-4 md:mt-0">
        <AnimatePresence mode="wait">
          {isTypingPage && status === "idle" && (
            <motion.div
              key="duration-selector"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-2 sm:gap-4 bg-background/30 backdrop-blur-md p-1 rounded-xl border border-sub-text/10 font-bold text-xs transition text-sub-text shadow-sm"
            >
              {DURATION_OPTIONS.map((t) => (
                <button
                  key={`dur-${t}`}
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

      {/* Desktop controls */}
      <div className="hidden md:flex items-center gap-6">
        <NavIcon href="/settings" icon={Settings} label="Settings" />
        <AnimatePresence mode="wait">
          {session ? (
            <motion.div
              key="auth-user-desktop-wrap"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-6 text-sm font-bold"
            >
              <span className="text-foreground/80 tracking-tight cursor-default">
                {session.user?.name}
              </span>
              <NavIcon
                onClick={() => signOut()}
                icon={LogOut}
                label="Log Out"
                className="hover:text-error"
              />
            </motion.div>
          ) : (
            <motion.div
              key="auth-guest-desktop-btn"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <NavIcon
                onClick={() => signIn("google")}
                icon={User}
                label="Login"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
