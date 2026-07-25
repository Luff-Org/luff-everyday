"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({
  content,
  children,
  position = "top",
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case "bottom":
        return "top-full mt-2 left-0";
      case "left":
        return "right-full mr-2 top-1/2 -translate-y-1/2";
      case "right":
        return "left-full ml-2 top-1/2 -translate-y-1/2";
      default: // top
        return "bottom-full mb-2 left-0";
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case "bottom":
        return "-top-[3px] left-3 border-t border-l";
      case "left":
        return "-right-[3px] top-1/2 -translate-y-1/2 border-t border-r";
      case "right":
        return "-left-[3px] top-1/2 -translate-y-1/2 border-b border-l";
      default: // top
        return "-bottom-[3px] left-3 border-r border-b";
    }
  };

  return (
    <div
      className="relative inline-flex items-center justify-center p-0 m-0"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: position === "top" ? 2 : position === "bottom" ? -2 : 0, x: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: position === "top" ? 2 : position === "bottom" ? -2 : 0, x: 0 }}
            transition={{ duration: 0.08, ease: "easeOut" }}
            className={`absolute ${getPositionClasses()} px-2.5 py-1.5 bg-background/98 backdrop-blur-md border border-sub-text/10 rounded-md text-[8px] font-black text-foreground whitespace-nowrap shadow-xl z-[100] pointer-events-none select-none tracking-widest uppercase font-sans flex items-center justify-center leading-none`}
          >
            {content}
            <div className={`absolute w-1 h-1 bg-background border-sub-text/10 rotate-45 ${getArrowClasses()}`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
