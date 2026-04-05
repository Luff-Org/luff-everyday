"use client";

import Link from "next/link";
import { Keyboard, Lock, Zap, Target } from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const MascotPlant = dynamic(() => import("@/components/3d/MascotPlant"), {
  ssr: false,
  loading: () => <div className="w-full h-full min-h-[400px] bg-transparent animate-pulse rounded-2xl" />
});

export default function LandingPage() {
  const cards = [
    {
      title: "Typing Practice",
      desc: "Hone your speed and accuracy with our core test engine.",
      icon: (
        <Keyboard className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform text-primary" />
      ),
      href: "/typing",
      active: true,
    },
    {
      title: "Smart Todos",
      desc: "Organize your life with our intelligent task tracking.",
      icon: (
        <Target className="w-8 h-8 mb-4 text-sub-text group-hover:scale-110 transition-transform" />
      ),
      href: "#",
      active: false,
    },
    {
      title: "Deep Journal",
      desc: "Reflect and write daily entries securely.",
      icon: (
        <Zap className="w-8 h-8 mb-4 text-sub-text group-hover:scale-110 transition-transform" />
      ),
      href: "#",
      active: false,
    },
    {
      title: "Life Analytics",
      desc: "Visualize your personal growth over time.",
      icon: (
        <Lock className="w-8 h-8 mb-4 text-sub-text group-hover:scale-110 transition-transform" />
      ),
      href: "#",
      active: false,
    },
  ];

  return (
    <div className="w-full flex flex-col items-center">

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between w-full text-center lg:text-left py-12 md:py-24 gap-12 relative overflow-visible">
        <div className="flex-1 max-w-2xl px-4 lg:px-0 z-20 pointer-events-auto">
          <h1 className="text-5xl md:text-6xl font-black text-foreground tracking-tighter mb-6 leading-[1.1]">
            Elevate your <span className="text-primary italic">everyday</span>{" "}
            focus.
          </h1>
          <p className="text-lg md:text-xl text-sub-text max-w-xl leading-relaxed font-medium mb-12">
            A minimalist suite of tools designed to help you organize thoughts,
            practice skills, and reclaim your time.
          </p>
          <Link
            href="/typing"
            className="inline-flex items-center px-10 py-5 bg-primary text-background font-black rounded-2xl hover:scale-105 transition-transform text-lg shadow-[0_20px_60px_-10px_rgba(var(--primary-rgb),0.5)]"
          >
            Start Practice →
          </Link>
        </div>

        {/* 3D Mascot Section */}
        <div className="hidden xl:flex flex-1 relative w-full h-[400px] md:h-[600px] items-center justify-center lg:-mr-12 pointer-events-auto mt-8 lg:mt-0">
          <div className="absolute inset-0 w-full h-full z-10">
             <MascotPlant />
          </div>
        </div>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full pb-20">
        {cards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{
              y: -5,
              backgroundColor: "rgba(var(--primary-rgb), 0.05)",
              borderColor: "rgba(var(--primary-rgb), 0.2)",
            }}
            className="group relative flex flex-col bg-background/30 backdrop-blur-md border border-sub-text/20 p-6 rounded-2xl cursor-pointer transition-colors duration-300"
          >
            {card.active ? (
              <Link
                href={card.href}
                className="absolute inset-0 z-20 rounded-2xl"
              />
            ) : (
              <div className="absolute top-4 right-4 px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-sub-text/40 tracking-widest">
                SOON
              </div>
            )}

            <div className="flex flex-col flex-1 pointer-events-none">
              {card.icon}
              <h3
                className={`text-lg font-bold mb-2 ${card.active ? "text-foreground" : "text-foreground/40"}`}
              >
                {card.title}
              </h3>
              <p className="text-sub-text text-sm leading-tight line-clamp-2">
                {card.desc}
              </p>
            </div>

            {card.active && (
              <div className="mt-4 font-black text-primary text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                Enter →
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
