'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion'; 
import { FaUsers, FaCheckCircle, FaCoins, FaSpinner } from 'react-icons/fa';

export default function PlatformStats() {
    const [stats, setStats] = useState({ totalUsers: 0, totalJobsDone: 0, totalPaymentSum: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlatformData = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/platform-stats`);
                if (!res.ok) throw new Error("Failed to sync platform directory matrices.");

                const json = await res.json();
                if (json.success) {
                    setStats(json.data);
                } else {
                    throw new Error(json.message || "Ledger calculations failed.");
                }
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPlatformData();
    }, []);

    if (loading) {
        return (
            <div className="w-full min-h-[300px] flex flex-col items-center gap-3 justify-center py-24 text-zinc-500 font-mono text-xs tracking-widest bg-zinc-950 border border-white/5 rounded-[28px]">
                <div className="w-5 h-5 border-2 border-zinc-800 border-t-amber-400 rounded-full animate-spin" />
                <span>COMPILING SKILLSWAP MATRIX DATA...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto p-6 bg-red-950/10 border border-red-500/10 rounded-2xl text-center text-red-400 font-mono text-xs my-4">
                ⚠️ System Metrics Fault: {error}
            </div>
        );
    }

    const statCards = [
        {
            title: "Ecosystem Members",
            value: stats.totalUsers.toLocaleString(),
            label: "Total registered accounts",
            icon: <FaUsers className="text-xl" />,
            colorClass: "text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]",
            conicColors: "transparent 60%, #3b82f6 90%, #60a5fa 100%",
        },
        {
            title: "Total Jobs Done",
            value: stats.totalJobsDone.toLocaleString(),
            label: "Completed system contracts",
            icon: <FaCheckCircle className="text-xl" />,
            colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
            conicColors: "transparent 60%, #10b981 90%, #34d399 100%",
        },
        {
            title: "Platform Volume",
            value: `$${stats.totalPaymentSum.toLocaleString()}`,
            label: "Gross clear-settled value",
            icon: <FaCoins className="text-xl" />,
            colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
            conicColors: "transparent 60%, #f59e0b 90%, #fbbf24 100%",
        },
    ];

    return (
        <section className="w-full bg-[size:200%_200%] bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 animate-[gradientMove_16s_ease_infinite] py-16 text-zinc-100 relative overflow-hidden select-none border border-white/5 rounded-[32px] max-w-6xl mx-auto px-6 md:px-10">
            
            {/* 🛑 Injecting the runtime CSS Custom Property Registration & Animation */}
            <style jsx global>{`
                @property --card-angle {
                    syntax: '<angle>';
                    initial-value: 0deg;
                    inherits: false;
                }

                @keyframes spin-border {
                    from { --card-angle: 0deg; }
                    to { --card-angle: 360deg; }
                }

                .animate-border-spin {
                    animation: spin-border 4s linear infinite;
                }
            `}</style>

            {/* 🌌 Ambient Background Blur Blobs */}
            <motion.div 
                animate={{
                    x: [0, 30, -10, 0],
                    y: [0, -30, 20, 0],
                    scale: [1, 1.05, 0.95, 1]
                }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 left-1/4 w-[350px] h-[350px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" 
            />
            <motion.div 
                animate={{
                    x: [0, -20, 30, 0],
                    y: [0, 20, -20, 0],
                    scale: [1, 0.95, 1.05, 1]
                }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" 
            />

            <div className="relative z-10 space-y-10">
                {/* Primary Section Title Header */}
                <div className="border-b border-white/5 pb-5">
                    <span className="text-xs font-bold font-mono tracking-widest uppercase text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full w-max shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                        Network Overview
                    </span>
                    <h1 className="text-3xl font-black tracking-tight text-white mt-3">
                        Platform Statistics
                    </h1>
                </div>

                {/* Performance Metric Matrix Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {statCards.map((card, i) => (
                        <motion.div
                            key={i}
                            whileHover={{ y: -5, scale: 1.01 }}
                            transition={{ type: "spring", stiffness: 150, damping: 15 }}
                            className="group relative bg-zinc-900 border border-white/5 rounded-2xl p-6 flex items-center justify-between shadow-2xl cursor-pointer backdrop-blur-md overflow-visible"
                        >
                            {/* 🔮 Glow Pseudo-Layer (Always Visible @ opacity-40) */}
                            <div 
                                className="absolute inset-0 rounded-2xl opacity-40 blur-xl pointer-events-none animate-border-spin z-0"
                                style={{
                                    background: `conic-gradient(from var(--card-angle), ${card.conicColors})`,
                                }}
                            />

                            {/* ⚡ Sharp Border Pseudo-Layer (Always Visible @ opacity-100) */}
                            <div 
                                className="absolute inset-0 rounded-2xl opacity-100 p-[1.5px] pointer-events-none animate-border-spin z-0"
                                style={{
                                    background: `conic-gradient(from var(--card-angle), ${card.conicColors})`,
                                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                    maskComposite: 'exclude',
                                    WebkitMaskComposite: 'xor',
                                }}
                            />

                            {/* Inner Main Card Content Layer */}
                            <div className="absolute inset-[1px] bg-zinc-900 bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-[15px] pointer-events-none z-0" />

                            <div className="space-y-1.5 relative z-10">
                                <p className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase font-mono">
                                    {card.title}
                                </p>
                                <h2 className="text-3xl font-black text-white font-mono tracking-tight transition-colors">
                                    {card.value}
                                </h2>
                                <p className="text-zinc-500 text-[11px] font-medium tracking-wide">
                                    {card.label}
                                </p>
                            </div>
                            
                            <div className={`p-4 rounded-xl border relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${card.colorClass}`}>
                                {card.icon}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}