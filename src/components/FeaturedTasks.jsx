"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
    FaCalendarDays, FaDollarSign, FaTags, 
    FaArrowRight, FaArrowUpRightFromSquare, FaUser  
} from 'react-icons/fa6';

export default function FeaturedTasks() {
    const router = useRouter();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFeaturedTasks = async () => {
            try {
                setLoading(true);
                const response = await fetch('http://localhost:8080/api/tasks/featured-open');
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

    const gridContainerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { 
            opacity: 1, 
            y: 0,
            transition: { type: "spring", stiffness: 110, damping: 16 } 
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
        <section className="w-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 py-24 text-zinc-100 relative overflow-hidden select-none">
            {/* Ambient Brand Core Blurs */}
            <div className="absolute top-1/4 left-1/12 w-[500px] h-[500px] bg-teal-400/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/12 w-[500px] h-[500px] bg-yellow-400/10 blur-[150px] rounded-full pointer-events-none" />

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
                        onClick={() => router.push('/tasks')}
                        className="group flex items-center gap-2 text-xs font-bold font-mono tracking-wider uppercase text-zinc-400 hover:text-white transition duration-200"
                    >
                        View Full Ledger <FaArrowUpRightFromSquare className="text-[10px] text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
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
                        {tasks.map((task) => {
                            const clientDisplay = task.client_email ? task.client_email.split('@')[0] : 'Client';
                            const deadlineDate = task.deadline 
                                ? new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) 
                                : 'Flexible';

                            return (
                                <motion.div 
                                    key={task._id}
                                    variants={cardVariants}
                                    whileHover={{ 
                                        y: -6, 
                                        scale: 1.015,
                                        boxShadow: "0 25px 50px rgba(45, 212, 191, 0.15)" // Signature glowing shadow
                                    }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => router.push(`/jobs/${task._id}`)}
                                    className="group flex flex-col justify-between bg-gradient-to-br from-zinc-900 to-zinc-800 border border-white/5 rounded-[28px] overflow-hidden cursor-pointer shadow-2xl transition-all duration-300"
                                >
                                    {/* 📦 TOP CONTENT BOX: Moving signature brand gradient across all cards */}
                                    <div className="p-6 flex flex-col gap-6 bg-gradient-to-r from-teal-500/15 via-yellow-400/10 to-teal-500/15 animate-gradient-move border-b border-white/5">
                                        
                                        <div className="flex flex-col gap-2.5">
                                            <h3 className="text-xl font-bold text-white tracking-tight leading-snug group-hover:text-teal-300 transition duration-200 truncate" title={task.title}>
                                                {task.title}
                                            </h3>
                                            <p className="text-xs text-zinc-400 font-normal line-clamp-2 leading-relaxed min-h-[36px] opacity-90">
                                                {task.description || "No project overview statement appended by the creator."}
                                            </p>
                                        </div>

                                        {/* Horizontal Pill Row: Frosted Brand Badges */}
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {/* Tag / Category Pill */}
                                            <span className="inline-flex items-center gap-1 text-[10px] px-3 py-1 rounded-full font-mono font-bold bg-white/5 backdrop-blur text-teal-300 border border-teal-400/20 hover:bg-teal-400/10 transition-colors">
                                                <FaTags className="text-[9px] opacity-80" /> {task.category || 'General'}
                                            </span>
                                            
                                            {/* Premium Budget Pill */}
                                            <span className="inline-flex items-center gap-1 text-[10px] px-3 py-1 rounded-full font-mono font-bold bg-yellow-400/10 text-yellow-300 border border-yellow-400/20">
                                                <FaDollarSign className="text-[9px]" /> {task.budget}
                                            </span>
                                            
                                            {/* Deadline Pill */}
                                            <span className="inline-flex items-center gap-1 text-[10px] px-3 py-1 rounded-full font-mono font-medium bg-white/5 backdrop-blur text-zinc-400 border border-white/10">
                                                <FaCalendarDays className="text-[9px]" /> {deadlineDate}
                                            </span>
                                            
                                            {/* Client Metadata Pill */}
                                            <span className="inline-flex items-center gap-1 text-[10px] px-3 py-1 rounded-full font-mono font-medium bg-white/5 backdrop-blur text-zinc-400 border border-white/10 max-w-[100px] truncate">
                                                <FaUser className="text-[8px] shrink-0" /> {clientDisplay}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 🧭 BOTTOM ACTION ROW: Transitions smoothly to brand blend on hover */}
                                    <div className="bg-zinc-900/20 p-4 px-6 flex items-center justify-between transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-teal-500/10 group-hover:to-yellow-400/10">
                                        <span className="text-sm font-bold text-zinc-300 group-hover:text-teal-300 transition-colors duration-300">
                                            Apply Now
                                        </span>
                                        
                                        {/* High-Impact Square Arrow Box */}
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-yellow-400 flex items-center justify-center text-zinc-950 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                                            <FaArrowRight className="text-xs transition-transform group-hover:translate-x-0.5" />
                                        </div>
                                    </div>

                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>
        </section>
    );
}