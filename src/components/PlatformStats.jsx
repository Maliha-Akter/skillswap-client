'use client';

import React, { useState, useEffect } from 'react';
import { FaUsers, FaCheckCircle, FaCoins, FaSpinner } from 'react-icons/fa';

const PlatformStats = () => {
    const [stats, setStats] = useState({ totalUsers: 0, totalJobsDone: 0, totalPaymentSum: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlatformData = async () => {
            try {
                setLoading(true);
                const res = await fetch('http://localhost:8080/api/platform-stats');
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
            <div className="flex items-center gap-2 justify-center py-12 text-zinc-400 font-mono text-xs bg-zinc-950">
                <FaSpinner className="animate-spin text-amber-500 text-sm" />
                <span>Compiling skillswap matrix data...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl text-center text-red-400 font-mono text-xs my-4">
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
            colorClass: "text-blue-400 bg-blue-500/10 border-blue-500/10",
        },
        {
            title: "Total Jobs Done",
            value: stats.totalJobsDone.toLocaleString(),
            label: "Completed system contracts",
            icon: <FaCheckCircle className="text-xl" />,
            colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/10",
        },
        {
            title: "Platform Volume",
            value: `$${stats.totalPaymentSum.toLocaleString()}`,
            label: "Gross clear-settled value",
            icon: <FaCoins className="text-xl" />,
            colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/10",
        },
    ];

    return (
        <div className="space-y-6 w-full bg-zinc-950 p-4 max-w-6xl mx-auto">
            {/* Primary Section Title Header */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">
                    Platform Statistics
                </h1>
            </div>

            {/* Performance Metric Matrix Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((card, i) => (
                    <div 
                        key={i} 
                        className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-6 shadow-xl flex items-center justify-between transition-all duration-200 hover:border-zinc-700"
                    >
                        <div className="space-y-1">
                            <p className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">
                                {card.title}
                            </p>
                            <h2 className="text-3xl font-black text-white font-mono tracking-tight">
                                {card.value}
                            </h2>
                            <p className="text-zinc-500 text-[11px] font-medium">
                                {card.label}
                            </p>
                        </div>
                        <div className={`p-4 rounded-xl border ${card.colorClass}`}>
                            {card.icon}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlatformStats;