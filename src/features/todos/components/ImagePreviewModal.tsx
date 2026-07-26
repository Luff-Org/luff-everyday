"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

/** Full-size lightbox for a single todo image. Closes on backdrop click or Escape. */
export function ImagePreviewModal({ url, onClose }: { url: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="preview-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
      >
        <motion.img
          key="preview-img"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          src={url}
          alt=""
          onClick={(e) => e.stopPropagation()}
          className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
        />
        <button
          onClick={onClose}
          aria-label="Close preview"
          className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 text-foreground shadow hover:bg-background"
        >
          <X className="w-5 h-5" />
        </button>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
