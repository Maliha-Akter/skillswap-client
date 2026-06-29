"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation'; // 🔗 Imported usePathname
import { motion } from 'framer-motion';

import {
    FaCalendarDays, FaDollarSign, FaTags,
    FaArrowRight, FaArrowUpRightFromSquare, FaUser
} from 'react-icons/fa6';
import { useSession } from '@/lib/auth-client';

// --- 3D PARALLAX TILT & REFRACTIVE GLOSS CARD WRAPPER ---
function TiltCard({ children, onClick }) {
    const cardRef = useRef(null);
    const glassRef = useRef(null);

    const handleMouseMove = (e) => {
        const card = cardRef.current;
        const glass = glassRef.current;
        if (!card || !glass) return;

        const rect = card.getBoundingClientRect();
        const pointerX = e.clientX;
        const pointerY = e.clientY;

        const halfWidth = rect.width / 2;
        const halfHeight = rect.height / 2;
        const cardCenterX = rect.left + halfWidth;
        const cardCenterY = rect.top + halfHeight;

        const deltaX = pointerX - cardCenterX;
        const deltaY = pointerY - cardCenterY;

        const rx = deltaY / halfHeight;
        const ry = deltaX / halfWidth;

        const distanceToCenter = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
        const maxDistance = Math.max(halfWidth, halfHeight);

        const dynamicDegree = (distanceToCenter / maxDistance) * 8;

        card.style.transform = `perspective(1000px) rotate3d(${-rx}, ${ry}, 0, ${dynamicDegree}deg)`;

        const glassX = -ry * 100;
        const glassY = -rx * 100;
        glass.style.transform = `translate(${glassX}%, ${glassY}%) scale(2.2)`;
        glass.style.opacity = (distanceToCenter / maxDistance) * 0.45;
    };

    const handleMouseLeave = () => {
        const card = cardRef.current;
        const glass = glassRef.current;
        if (!card || !glass) return;

        card.style.transform = "perspective(1000px) rotate3d(0, 0, 0, 0deg)";
        glass.style.transform = "translate(0%, 0%) scale(2.2)";
        glass.style.opacity = "0";
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            className="group relative flex flex-col justify-between bg-gradient-to-br from-zinc-900 to-zinc-800 border border-white/5 rounded-[28px] overflow-hidden cursor-pointer shadow-2xl transition-all duration-300 ease-out preserve-3d will-change-transform h-full"
            style={{ transformStyle: "preserve-3d" }}
        >
            <div
                ref={glassRef}
                className="absolute inset-0 w-full h-full pointer-events-none rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.05)_45%,transparent_100%)] opacity-0 mix-blend-screen transition-opacity duration-200 ease-out z-30"
                style={{ width: '100%', height: '100%', top: 0, left: 0 }}
            />
            {children}
        </div>
    );
}

// --- MAIN FEATURED TASKS INTERFACE ---
export default function FeaturedTasks() {
    const router = useRouter();
    const currentPath = usePathname(); // 🔑 Captures exactly which page path the user is on right now
    const { data: session } = useSession();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFeaturedTasks = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/featured-open`);
                const result = await response.json();

                if (response.ok && result.success) {
                    setTasks(result.data);
                } else {
                    throw new Error(result.message || "Could not retrieve featured postings.");
                }
            } catch (err) {
                console.error("❌ ==> [FEATURED TASKS COMPONENT ERROR]:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedTasks();
    }, []);

    // 🛡️ Safe Routing Interceptor Function with dynamic dynamic return redirect URL
    const handleNavigation = (targetUrl) => {
        if (session) {
            router.push(targetUrl);
        } else {
            // 🔑 Encodes current location to pass down as a search query argument to your sign-in module
            const encodedCallback = encodeURIComponent(targetUrl);
            router.push(`/auth/signin?callbackUrl=${encodedCallback}`);
        }
    };

    const gridContainerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 18
            }
        }
    };

    if (loading) {
        return (
            <div className="w-full py-24 text-center font-mono text-xs tracking-widest text-zinc-500 flex flex-col items-center justify-center gap-3 bg-[#07161a]">
                <div className="w-5 h-5 border-2 border-zinc-800 border-t-teal-400 rounded-full animate-spin" />
                <span>RENDERING BRAND UNIVERSE...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full bg-[#07161a] py-12 px-6">
                <div className="max-w-7xl mx-auto py-6 text-center text-xs font-mono text-yellow-400 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl">
                    ⚠️ Operational Error: {error}
                </div>
            </div>
        );
    }

    return (
        <section className="w-full bg-[size:200%_200%] bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 animate-[gradientMove_16s_ease_infinite] py-24 text-zinc-100 relative overflow-hidden select-none">

            {/* 🌌 Animated Brand Core Ambient Blobs */}
            <motion.div
                animate={{
                    x: [0, 40, -20, 0],
                    y: [0, -50, 30, 0],
                    scale: [1, 1.1, 0.9, 1]
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-1/4 left-1/12 w-[500px] h-[500px] bg-teal-400/10 blur-[130px] rounded-full pointer-events-none will-change-transform"
            />
            <motion.div
                animate={{
                    x: [0, -30, 40, 0],
                    y: [0, 40, -40, 0],
                    scale: [1, 0.9, 1.1, 1]
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute bottom-1/4 right-1/12 w-[500px] h-[500px] bg-yellow-400/10 blur-[130px] rounded-full pointer-events-none will-change-transform"
            />

            <div className="max-w-7xl mx-auto px-6 flex flex-col gap-12 relative z-10">

                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold font-mono tracking-widest uppercase text-teal-300 bg-teal-400/10 border border-teal-400/20 px-3 py-1 rounded-full w-max shadow-[0_0_15px_rgba(45,212,191,0.08)]">
                            Live Marketplace
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                            Explore Featured Tasks
                        </h2>
                    </div>
                    <button
                        onClick={() => handleNavigation('/jobs')}
                        className="group flex items-center gap-2 text-xs font-bold font-mono tracking-wider uppercase text-zinc-400 hover:text-white transition duration-200"
                    >
                        View Full Job Details <FaArrowUpRightFromSquare className="text-[10px] text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </button>
                </div>

                {/* Main Content Grid */}
                {tasks.length === 0 ? (
                    <div className="text-center py-20 text-zinc-500 font-mono text-xs border border-dashed border-white/5 rounded-3xl bg-zinc-900/10">
                        No active workspace briefs populated at this instant.
                    </div>
                ) : (
                    <motion.div
                        variants={gridContainerVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {tasks.map((task, index) => {
                            const clientDisplay = task.client_email ? task.client_email.split('@')[0] : 'Client';
                            const deadlineDate = task.deadline
                                ? new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                                : 'Flexible';

                            return (
                                <motion.div
                                    key={task._id}
                                    variants={cardVariants}
                                    className="h-full"
                                >
                                    <motion.div
                                        animate={{ y: [0, -8, 0] }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                            delay: index * 0.15
                                        }}
                                        className="h-full"
                                    >
                                        <TiltCard onClick={() => handleNavigation(`/jobs/${task._id}`)}>

                                            {/* Content Block */}
                                            <div className="p-6 flex flex-col gap-6 bg-gradient-to-r from-teal-500/15 via-yellow-400/10 to-teal-500/15 border-b border-white/5 relative z-10 select-none pointer-events-none">
                                                <div className="flex flex-col gap-2.5">
                                                    <h3 className="text-xl font-bold text-white tracking-tight leading-snug group-hover:text-teal-300 transition duration-200 truncate" title={task.title}>
                                                        {task.title}
                                                    </h3>
                                                    <p className="text-xs text-zinc-400 font-normal line-clamp-2 leading-relaxed min-h-[36px] opacity-90">
                                                        {task.description || "No project overview statement appended by the creator."}
                                                    </p>
                                                </div>

                                                {/* Badge Row */}
                                                <div className="flex flex-wrap gap-2 pt-1">
                                                    <span className="inline-flex items-center gap-1 text-[10px] px-3 py-1 rounded-full font-mono font-bold bg-white/5 backdrop-blur text-teal-300 border border-teal-400/20">
                                                        <FaTags className="text-[9px] opacity-80" /> {task.category || 'General'}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-[10px] px-3 py-1 rounded-full font-mono font-bold bg-yellow-400/10 text-yellow-300 border border-yellow-400/20">
                                                        <FaDollarSign className="text-[9px]" /> {task.budget}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-[10px] px-3 py-1 rounded-full font-mono font-medium bg-white/5 backdrop-blur text-zinc-400 border border-white/10">
                                                        <FaCalendarDays className="text-[9px]" /> {deadlineDate}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-[10px] px-3 py-1 rounded-full font-mono font-medium bg-white/5 backdrop-blur text-zinc-400 border border-white/10 max-w-[100px] truncate">
                                                        <FaUser className="text-[8px] shrink-0" /> {clientDisplay}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Action Row */}
                                            <div className="bg-zinc-900/20 p-4 px-6 flex items-center justify-between transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-teal-500/10 group-hover:to-yellow-400/10 relative z-10 select-none pointer-events-none">
                                                <span className="text-sm font-bold text-zinc-300 group-hover:text-teal-300 transition-colors duration-300">
                                                    Apply Now
                                                </span>
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-yellow-400 flex items-center justify-center text-zinc-950 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                                                    <FaArrowRight className="text-xs transition-transform group-hover:translate-x-0.5" />
                                                </div>
                                            </div>

                                        </TiltCard>
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>
        </section>
    );
}