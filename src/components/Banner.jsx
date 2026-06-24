"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const floatUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1], // Premium custom ease-out
    },
  }),
};

const sentence = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.08,
    },
  },
};

const wordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const Banner = () => {
  // Phrases to cycle through the type/delete loop
  const phrases = ["skilled freelancers", "expert developers", "creative designers", "vetted writers"];
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentFullText = phrases[currentPhraseIndex];
    
    // Typing speeds
    const typeSpeed = isDeleting ? 40 : 80;
    
    const handleType = () => {
      if (!isDeleting) {
        // Adding a letter
        setDisplayedText(currentFullText.substring(0, displayedText.length + 1));
        
        // If word complete, it pauses before deleting
        if (displayedText === currentFullText) {
          setTimeout(() => setIsDeleting(true), 1800);
        }
      } else {
        // Remove a letter
        setDisplayedText(currentFullText.substring(0, displayedText.length - 1));
        
        // If fully deleted, shift to the next word
        if (displayedText === "") {
          setIsDeleting(false);
          setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    };

    const timer = setTimeout(handleType, typeSpeed);
    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, currentPhraseIndex]);

  return (
    <motion.section 
      /* --- CONTINUOUS SMOOTH GRADIENT BACKGROUND ANIMATION (LEFT TO RIGHT) --- */
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{
        backgroundSize: "300% 300%",
        backgroundImage: "linear-gradient(135deg, #0B1220 0%, #0F172A 35%, #052E16 70%, #0B1220 100%)"
      }}
      className="relative overflow-hidden text-white min-h-[90vh] flex items-center"
    >
      
      {/* 1. DYNAMIC BACKGROUND MESH & GLOW EFFECTS */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Animated Moving Gradient Blob 1 */}
        <motion.div 
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.15, 0.9, 1]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -left-24 top-10 h-96 w-96 rounded-full bg-teal-500/10 blur-[100px]" 
        />
        
        {/* Animated Moving Gradient Blob 2 */}
        <motion.div 
          animate={{
            x: [0, -50, 30, 0],
            y: [0, 40, -30, 0],
            scale: [1, 0.9, 1.2, 1]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-yellow-500/10 blur-[120px]" 
        />

        {/* Linear/Radial Hue-Shifting Overlay Backing */}
        <motion.div 
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{ backgroundSize: "200% 200%" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.15),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.12),transparent_40%)]" 
        />

        {/* Tech Blueprint Faint Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:44px_44px] opacity-40" />
        
        {/* Ambient Floating Dust Particles */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: "100vh", x: Math.random() * 100 + "%", opacity: 0 }}
            animate={{ y: "-10vh", opacity: [0, 0.4, 0.4, 0] }}
            transition={{
              duration: 10 + i * 4,
              repeat: Infinity,
              delay: i * 2,
              ease: "linear"
            }}
            className="absolute h-1 w-1 rounded-full bg-teal-400/40 blur-[1px]"
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:px-10 lg:grid-cols-2 lg:py-24 w-full">
        
        {/* LEFT CONTENT */}
        <motion.div
          variants={floatUp}
          initial="hidden"
          animate="visible"
          className="max-w-2xl"
        >
          {/* Badge Trigger Accent */}
          <motion.div
            custom={0}
            variants={floatUp}
            whileHover={{ scale: 1.03 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur-md cursor-default shadow-inner"
          >
            <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
            Trusted freelance marketplace
          </motion.div>

          {/* 2. ADVANCED TYPEWRITER WRITING / REMOVING ANIMATION REVEAL */}
          <h1 className="text-4xl font-extrabold leading-[1.2] tracking-tight text-white md:text-6xl min-h-[120px] md:min-h-[150px]">
            <motion.span variants={wordVariants} className="inline-block mr-3">Get</motion.span>
            <motion.span variants={wordVariants} className="inline-block mr-3">your</motion.span>
            <motion.span variants={wordVariants} className="inline-block mr-3">tasks</motion.span>
            <motion.span variants={wordVariants} className="inline-block mr-3">done</motion.span>
            <motion.span variants={wordVariants} className="inline-block mr-3">by</motion.span>
            <br className="hidden md:block" />
            <span className="relative inline-block bg-gradient-to-r from-teal-400 via-slate-100 to-yellow-400 bg-clip-text text-transparent drop-shadow-sm pr-2">
              {displayedText}
              {/* Blinking writing cursor element */}
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                className="absolute right-0 top-[10%] w-[4px] bg-yellow-400 inline-block h-[85%] align-middle ml-1"
              />
            </span>
          </h1>

          <motion.p
            custom={2}
            variants={floatUp}
            className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 md:text-lg"
          >
            Post a task, receive proposals from verified freelancers, and hire the right
            talent with a smooth and secure workflow built for clients and creators.
          </motion.p>

          {/* Call to Actions with Button Hover Effects */}
          <motion.div
            custom={3}
            variants={floatUp}
            className="mt-8 flex flex-col gap-4 sm:flex-row"
          >
            <Link
              href="/dashboard/client/post-task"
              className="inline-flex items-center justify-center rounded-2xl bg-teal-500 px-6 py-3.5 text-sm font-semibold text-black shadow-lg shadow-teal-500/25 transition-all duration-300 hover:scale-[1.04] hover:bg-teal-400 hover:shadow-teal-400/40"
            >
              Post a Task
            </Link>

            <Link
              href="/tasks"
              className="inline-flex items-center justify-center rounded-2xl border border-yellow-400/30 bg-white/5 px-6 py-3.5 text-sm font-semibold text-yellow-200 backdrop-blur-md transition-all duration-300 hover:scale-[1.04] hover:border-yellow-400/80 hover:bg-yellow-400/10 hover:text-yellow-100"
            >
              Browse Tasks
            </Link>
          </motion.div>

          {/* Counter Cards Area */}
          <motion.div
            custom={4}
            variants={floatUp}
            className="mt-12 grid grid-cols-3 gap-4 max-w-lg"
          >
            {[
              { value: "1K+", label: "Tasks posted" },
              { value: "500+", label: "Freelancers" },
              { value: "99%", label: "Success rate" },
            ].map((item, idx) => (
              <motion.div
                key={item.label}
                whileHover={{ y: -4, border: "1px solid rgba(255,255,255,0.18)" }}
                transition={{ duration: 0.2 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md cursor-default"
              >
                <div className="text-xl font-bold text-white md:text-2xl">{item.value}</div>
                <div className="mt-1 text-xs text-slate-400 md:text-sm">{item.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* RIGHT VISUAL SIDE (Floating Interactive Mockup panels) */}
        <motion.div
          variants={floatUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="relative mx-auto w-full max-w-xl"
        >
          <div className="absolute inset-0 -z-10 mx-auto h-full w-full rounded-full bg-teal-400/10 blur-3xl" />

          {/* MAIN PREVIEW PANEL: Infinite Floating Wave Motion Loop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: [0, -14, 0],
              rotate: [0, 0.5, -0.5, 0]
            }}
            transition={{ 
              opacity: { delay: 0.3, duration: 0.8 },
              scale: { delay: 0.3, duration: 0.8 },
              y: { repeat: Infinity, duration: 6, ease: "easeInOut" },
              rotate: { repeat: Infinity, duration: 8, ease: "easeInOut" }
            }}
            className="rounded-[2rem] border border-white/10 bg-[#111827]/40 p-5 shadow-2xl shadow-black/50 backdrop-blur-xl border-t-white/20"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-mono tracking-wider">LIVE DATA FEED</p>
                <h3 className="text-lg font-bold text-white tracking-tight">Top task activity</h3>
              </div>
              <div className="rounded-full bg-teal-400/10 border border-teal-500/20 px-3 py-1 text-xs font-medium text-teal-300 flex items-center gap-1.5 shadow-inner">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-ping" />
                Updated now
              </div>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: "Logo design for startup",
                  meta: "Design • $120 • Due in 3 days",
                  accent: "from-teal-400/15",
                },
                {
                  title: "Blog article writing",
                  meta: "Writing • $80 • Due tomorrow",
                  accent: "from-yellow-400/15",
                },
                {
                  title: "React landing page",
                  meta: "Development • $240 • Due in 5 days",
                  accent: "from-cyan-400/15",
                },
              ].map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + index * 0.12, duration: 0.6 }}
                  whileHover={{ scale: 1.02, x: 6, border: "1px solid rgba(255,255,255,0.2)" }}
                  className={`rounded-2xl border border-white/5 bg-gradient-to-r ${card.accent} to-white/[0.02] p-4 cursor-pointer transition-colors duration-300`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-white tracking-wide">{card.title}</h4>
                      <p className="mt-1 text-sm text-slate-400">{card.meta}</p>
                    </div>
                    <div className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm shadow-inner">
                      🚀
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* PARALLAX COUNTER FLOATING PROFILE CARD (Drifts out-of-sync with main box) */}
          <motion.div
            initial={{ opacity: 0, y: 18, rotate: -2 }}
            animate={{ 
              opacity: 1, 
              rotate: -2,
              y: [0, 12, 0],
              x: [0, -4, 0]
            }}
            transition={{ 
              opacity: { delay: 0.7, duration: 0.6 },
              y: { repeat: Infinity, duration: 5.2, ease: "easeInOut" },
              x: { repeat: Infinity, duration: 7, ease: "easeInOut" }
            }}
            className="absolute -bottom-10 left-4 hidden w-60 rounded-2xl border border-white/10 bg-[#0F172A]/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-2xl md:block border-l-[#FACC15]/20"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-400 to-yellow-400 flex items-center justify-center text-xs font-bold text-black shadow-md">
                AR
              </div>
              <div>
                <p className="font-bold text-xs text-white">Ayesha Rahman</p>
                <p className="text-[10px] text-slate-400">Top worker of the month</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1">
              {["UI/UX", "React", "Next.js"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/5 bg-white/5 px-2 py-0.5 text-[9px] font-mono text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Banner;