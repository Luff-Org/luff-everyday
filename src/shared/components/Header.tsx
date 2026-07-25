"use client";

import { useEffect, useRef, useState } from "react";
import { useTypingStore } from "@/features/typing/store/useTypingStore";
import { Activity, ListTodo, User } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DURATION_OPTIONS } from "@/features/typing/lib/constants";
import { useHasMounted } from "@/shared/lib/useHasMounted";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { Tooltip } from "@/shared/ui/Tooltip";
import { UserMenu } from "@/shared/components/UserMenu";

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
        <Link href={href} prefetch={false} className="outline-none">
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
  // Selectors kept per-field (not one destructure) so the tick() calls that
  // update timeLeft/wpmHistory every second don't re-render this whole header
  // and repaint the sticky backdrop-blur bar in sync with the countdown.
  const status = useTypingStore((s) => s.status);
  const duration = useTypingStore((s) => s.duration);
  const tick = useTypingStore((s) => s.tick);
  const setDuration = useTypingStore((s) => s.setDuration);
  const { data: session, status: authStatus } = useSession();
  const pathname = usePathname();
  const mounted = useHasMounted();
  const hasNotified = useRef(false);

  const isTypingPage = pathname === "/typing";
  const loginHref = `/login?callbackUrl=${encodeURIComponent(pathname || "/")}`;

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
    if (authStatus === "authenticated" && session?.user && !hasNotified.current) {
      toast.success(`Welcome back, ${session.user.name?.split(" ")[0]}!`, {
        description: "Your stats are being synced.",
      });
      hasNotified.current = true;
    } else if (authStatus === "unauthenticated" && hasNotified.current) {
      toast.info("Logged out successfully.");
      hasNotified.current = false;
    }
  }, [authStatus, session]);

  if (!mounted) return <header className="w-full h-20" />;

  return (
    <header className="sticky top-0 z-50 w-full flex flex-col md:flex-row items-center justify-between min-h-[5rem] py-4 px-6 md:py-0 text-sub-text bg-background">
      <div className="w-full md:w-auto flex items-center justify-between">
        <Link
          href="/"
          prefetch={false}
          className="flex items-center gap-2 text-2xl font-black text-primary cursor-pointer hover:opacity-80 transition-all font-mono"
        >
          <Activity className="w-8 h-8" />
          <span className="tracking-tighter">luff.</span>
        </Link>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-4">
          <NavIcon href="/todos" icon={ListTodo} label="Todos" />
          <AnimatePresence mode="wait">
            {session ? (
              <motion.div
                key="auth-user-mobile-btn"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <UserMenu name={session.user?.name} email={session.user?.email} />
              </motion.div>
            ) : (
              <motion.div
                key="auth-guest-mobile-btn"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <NavIcon href={loginHref} icon={User} label="Login" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 flex justify-center w-full md:w-auto mt-4 md:mt-0">
        <AnimatePresence>
          {isTypingPage && status === "idle" && (
            <motion.div
              key="duration-selector"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex gap-2 sm:gap-4 p-1 rounded-xl border border-sub-text/10 font-bold text-xs text-sub-text shadow-sm"
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
        <NavIcon href="/todos" icon={ListTodo} label="Todos" />
        <AnimatePresence mode="wait">
          {session ? (
            <motion.div
              key="auth-user-desktop-wrap"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <UserMenu name={session.user?.name} email={session.user?.email} />
            </motion.div>
          ) : (
            <motion.div
              key="auth-guest-desktop-btn"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <NavIcon href={loginHref} icon={User} label="Login" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
