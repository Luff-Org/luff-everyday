"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCircle, Settings, LogOut, ChevronDown } from "lucide-react";

export function UserMenu({
  name,
  email,
  image,
}: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const displayName = name?.trim() || "Account";
  const initial = displayName.charAt(0).toUpperCase();
  const showImage = !!image && !imgError;

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex cursor-pointer items-center gap-2 rounded-full py-1 pl-1 pr-2 text-sm font-bold text-foreground/80 transition-all hover:text-foreground"
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image!}
            alt={displayName}
            onError={() => setImgError(true)}
            className="h-8 w-8 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-black text-primary">
            {initial}
          </span>
        )}
        <span className="hidden max-w-[10rem] truncate tracking-tight md:inline">
          {displayName}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-sub-text transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-sub-text/10 bg-background shadow-xl"
          >
            <div className="border-b border-sub-text/10 px-4 py-3">
              <p className="truncate text-sm font-black text-foreground">
                {displayName}
              </p>
              {email && (
                <p className="truncate text-xs text-sub-text">{email}</p>
              )}
            </div>

            <nav className="flex flex-col p-1.5">
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-bold text-sub-text transition-all hover:bg-primary/10 hover:text-foreground"
              >
                <UserCircle className="h-4 w-4" />
                Profile
              </Link>
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-bold text-sub-text transition-all hover:bg-primary/10 hover:text-foreground"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  signOut();
                }}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-bold text-sub-text transition-all hover:bg-error/10 hover:text-error"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
