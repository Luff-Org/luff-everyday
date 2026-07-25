"use client";

import { motion } from "framer-motion";

export function LoadingScreen({ message = "Downloading user data..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background select-none">
      <div className="w-64 flex flex-col items-center gap-6">
        {/* Progress Bar Container */}
        <div className="relative w-full h-1.5 bg-sub-text/10 rounded-full overflow-hidden">
          {/* Animated Progress Fill */}
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute h-full bg-primary rounded-full"
            style={{
              boxShadow: "0 0 15px var(--primary)",
            }}
          />
        </div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-sm font-mono text-sub-text tracking-tight flex items-center gap-1"
        >
          {message}
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1] }}
          >
            _
          </motion.span>
        </motion.div>
      </div>
    </div>
  );
}
