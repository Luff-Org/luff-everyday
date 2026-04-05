"use client";

import Link from "next/link";
import { Keyboard, Lock, Zap, Target } from "lucide-react";
import Header from "@/components/Header";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function LandingPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const fadeOut = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scaleOut = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  const cards = [
    {
      title: "Typing Practice",
      desc: "Hone your speed and accuracy with our core test engine.",
      icon: (
        <Keyboard className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform text-primary" />
      ),
      href: "/typing",
      active: true,
    },
    {
      title: "Smart Todos",
      desc: "Organize your life with our intelligent task tracking.",
      icon: (
        <Target className="w-12 h-12 mb-4 text-sub-text group-hover:scale-110 transition-transform" />
      ),
      href: "#",
      active: false,
    },
    {
      title: "Deep Journal",
      desc: "Reflect and write daily entries securely.",
      icon: (
        <Zap className="w-12 h-12 mb-4 text-sub-text group-hover:scale-110 transition-transform" />
      ),
      href: "#",
      active: false,
    },
    {
      title: "Life Analytics",
      desc: "Visualize your personal growth over time.",
      icon: (
        <Lock className="w-12 h-12 mb-4 text-sub-text group-hover:scale-110 transition-transform" />
      ),
      href: "#",
      active: false,
    },
  ];

  return (
    <main
      className="w-full flex flex-col items-center flex-1 h-[200vh]"
      ref={containerRef}
    >
      <div className="w-full max-w-5xl px-8 flex flex-col items-center">
        <Header isLanding={true} />

        {/* Hero Section */}
        <motion.div
          style={{ opacity: fadeOut, scale: scaleOut }}
          className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl text-center py-40 sticky top-20"
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="perspective-1000"
          >
            <h1 className="text-7xl md:text-8xl font-extrabold text-foreground tracking-tight mb-8 drop-shadow-2xl">
              Elevate your{" "}
              <span className="text-primary z-10 relative">everyday</span>{" "}
              focus.
            </h1>
            <p className="text-2xl text-sub-text max-w-2xl mx-auto mb-16 leading-relaxed font-medium">
              A minimalist suite of tools designed to help you organize
              thoughts, practice skills, and reclaim your time.
            </p>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="text-sub-text text-sm uppercase tracking-[0.3em] font-bold"
            >
              Scroll to explore
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl z-10 pb-40">
          {cards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 100, rotateX: 20 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.6,
                delay: idx * 0.2,
                type: "spring",
                stiffness: 100,
              }}
              whileHover={{
                scale: 1.05,
                rotateY: 5,
                rotateX: -5,
                boxShadow: "0px 20px 40px rgba(0,0,0,0.4)",
              }}
              style={{ transformStyle: "preserve-3d" }}
              className="group relative flex flex-col bg-background/50 backdrop-blur-xl border border-white/5 p-10 rounded-3xl cursor-pointer"
            >
              {card.active ? (
                <Link
                  href={card.href}
                  className="absolute inset-0 z-20 rounded-3xl"
                />
              ) : (
                <div className="absolute top-6 right-6 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-sub-text/60 tracking-wider">
                  COMING SOON
                </div>
              )}

              <div
                style={{ transform: "translateZ(30px)" }}
                className="flex flex-col flex-1 pointer-events-none"
              >
                {card.icon}
                <h3
                  className={`text-3xl font-bold mb-4 ${card.active ? "text-foreground" : "text-foreground/50"}`}
                >
                  {card.title}
                </h3>
                <p className="text-sub-text text-lg leading-relaxed flex-1">
                  {card.desc}
                </p>
              </div>

              {card.active && (
                <div
                  style={{ transform: "translateZ(20px)" }}
                  className="mt-8 font-bold text-primary group-hover:translate-x-2 transition-transform uppercase tracking-wider text-sm"
                >
                  Enter Practice →
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
