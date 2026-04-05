"use client";

import Link from "next/link";
import { Keyboard, Lock, Zap, Target } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

function BackgroundAnimation() {
  return (
    <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none opacity-50">
      <motion.div
        animate={{
          x: [0, 100, -100, 0],
          y: [0, -100, 100, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 blur-[120px] rounded-full"
      />
      <motion.div
        animate={{
          x: [0, -120, 120, 0],
          y: [0, 80, -80, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full"
      />
      <motion.div
        animate={{
          x: [0, 50, -50, 0],
          y: [0, 150, -150, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/2 left-1/3 w-72 h-72 bg-primary/15 blur-[100px] rounded-full"
      />
    </div>
  );
}

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
      <BackgroundAnimation />

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between w-full text-center lg:text-left py-20 md:py-32 gap-12 relative overflow-visible">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 max-w-2xl px-4 lg:px-0 z-20"
        >
          <h1 className="text-5xl md:text-6xl font-black text-foreground tracking-tighter mb-6 leading-[1]">
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
        </motion.div>

        <div className="flex-1 relative w-full h-[400px] md:h-[600px] flex items-center justify-center">
          {/* Main Crystal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute z-10 w-[300px] h-[300px] md:w-[500px] md:h-[500px]"
          >
            <motion.div
              animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full"
            >
              <Image
                src="/focus-3d.png"
                alt="Focus Crystal"
                fill
                className="object-contain drop-shadow-[0_0_100px_rgba(var(--primary-rgb),0.3)]"
                priority
              />
            </motion.div>
          </motion.div>

          {/* Floating Torus */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, x: 100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1.8, delay: 0.2, ease: "easeOut" }}
            className="absolute -top-10 right-0 md:right-10 w-[150px] h-[150px] md:w-[250px] md:h-[250px] z-0"
          >
            <motion.div
              animate={{ y: [0, 40, 0], rotate: [0, -20, 0], x: [0, 20, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="w-full h-full opacity-60 blur-[1px]"
            >
              <Image
                src="/torus-3d.png"
                alt="Torus"
                fill
                className="object-contain"
              />
            </motion.div>
          </motion.div>

          {/* Floating Sphere */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, x: -100 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1.8, delay: 0.4, ease: "easeOut" }}
            className="absolute -bottom-10 left-0 md:left-10 w-[120px] h-[120px] md:w-[220px] md:h-[220px] z-20"
          >
            <motion.div
              animate={{ y: [0, -50, 0], rotate: [360, 0, 0], x: [0, -30, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="w-full h-full opacity-80"
            >
              <Image
                src="/sphere-3d.png"
                alt="Sphere"
                fill
                className="object-contain drop-shadow-[0_0_40px_rgba(var(--primary-rgb),0.2)]"
              />
            </motion.div>
          </motion.div>
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
