"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from "@/lib/auth-client";
import { 
    FaFolder, FaUnlockAlt, FaCogs, 
    FaDollarSign, FaHistory, FaArrowRight 
} from 'react-icons/fa';

export default function ClientDashboard() {
    const router = useRouter();
    const { data: session, isPending: sessionLoading } = authClient.useSession();
    const currentUser = session?.user;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Live Aggregated State Structure matching your database fields
    const [dashboardData, setDashboardData] = useState({
        stats: {
            totalTasks: 0,
            openTasks: 0,
            tasksInProgress: 0,
            totalSpent: 0
        },
        recentTasks: []
    });

    useEffect(() => {
        // Guard against non-client entries safely once session resolves
        if (!sessionLoading && (!currentUser || currentUser.role !== 'client')) {
            router.push('/'); 
            return;
        }

        const fetchClientMetrics = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch('http://localhost:8080/api/client/overview-stats', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'user-email': currentUser?.email || ''
                    }
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    setDashboardData(result.data);
                } else {
                    throw new Error(result.message || "Failed to retrieve client metric ledger.");
                }
            } catch (err) {
                console.error("❌ ==> [CLIENT DASHBOARD FETCH EXCEPTION]:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser?.email) {
            fetchClientMetrics();
        }
    }, [currentUser, sessionLoading, router]);

    if (sessionLoading || loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 font-mono text-sm tracking-wider animate-pulse">
                Syncing client project matrix and expenditure data...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="text-red-400 font-mono max-w-md bg-red-950/20 border border-red-500/20 p-6 rounded-2xl">
                    ⚠️ System Fault: {error}
                </div>
            </div>
        );
    }

    // Extract stats with individual nullish-coalescing safeguards
    const stats = dashboardData?.stats;
    const totalTasks = stats?.totalTasks ?? 0;
    const openTasks = stats?.openTasks ?? 0;
    const tasksInProgress = stats?.tasksInProgress ?? 0;
    const totalSpent = stats?.totalSpent ?? 0;
    
    const recentTasks = dashboardData?.recentTasks || [];

    return (
        <div className="bg-zinc-950 min-h-screen text-zinc-100 p-4 md:p-10 selection:bg-emerald-500/30">
            <div className="max-w-7xl mx-auto flex flex-col gap-8">
                
                {/* Header Block */}
                <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                            <span className="text-emerald-400">💼</span> Client Central Console
                        </h1>
                        <p className="text-zinc-400 text-xs mt-1 font-mono">
                            Project management pipelines and financial metrics • Client Ref: <span className="text-zinc-300 font-bold">{currentUser?.email}</span>
                        </p>
                    </div>
                    <div className="bg-zinc-900 border border-white/5 px-4 py-2 rounded-xl text-xs font-mono text-zinc-400">
                        Session: <span className="text-emerald-400 animate-ping inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1" /> ONLINE_LEDGER
                    </div>
                </div>

                {/* Core Main Statistics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Tasks */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition flex flex-col justify-between">
                        <div className="flex items-center justify-between text-zinc-400">
                            <span className="text-xs font-bold uppercase tracking-wider">Total Tasks</span>
                            <FaFolder className="text-zinc-500 text-sm" />
                        </div>
                        <h3 className="text-3xl font-black text-white mt-4 font-mono">{totalTasks}</h3>
                    </div>

                    {/* Open Tasks */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition flex flex-col justify-between">
                        <div className="flex items-center justify-between text-zinc-400">
                            <span className="text-xs font-bold uppercase tracking-wider">Open Tasks</span>
                            <FaUnlockAlt className="text-amber-400 text-sm" />
                        </div>
                        <h3 className="text-3xl font-black text-amber-400 mt-4 font-mono">{openTasks}</h3>
                    </div>

                    {/* Tasks In Progress */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition flex flex-col justify-between">
                        <div className="flex items-center justify-between text-zinc-400">
                            <span className="text-xs font-bold uppercase tracking-wider">Tasks In Progress</span>
                            <FaCogs className="text-blue-400 text-sm" />
                        </div>
                        <h3 className="text-3xl font-black text-blue-400 mt-4 font-mono">{tasksInProgress}</h3>
                    </div>

                    {/* Total Spent */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition flex flex-col justify-between">
                        <div className="flex items-center justify-between text-zinc-400">
                            <span className="text-xs font-bold uppercase tracking-wider">Total Spent (USD)</span>
                            <FaDollarSign className="text-emerald-400 text-sm" />
                        </div>
                        <h3 className="text-3xl font-black text-emerald-400 mt-4 font-mono">${totalSpent.toLocaleString()}</h3>
                    </div>
                </div>

                {/* Stacked Row-By-Row Feeds (No Columns layout) */}
                <div className="flex flex-col gap-6 w-full mt-2">
                    <div className="bg-zinc-900/20 border border-white/5 rounded-2xl p-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                <FaHistory className="text-zinc-500" /> Client Posted Project Streams
                            </h4>
                            <span className="text-[10px] font-mono text-zinc-500">Live Activity Feed</span>
                        </div>
                        
                        <div className="flex flex-col gap-2 overflow-y-auto max-h-[450px] pr-1">
                            {recentTasks.length === 0 ? (
                                <p className="text-xs font-mono text-zinc-500 py-6 text-center">
                                    No posted project briefs found for this account.
                                </p>
                            ) : (
                                recentTasks.map((task) => (
                                    <div 
                                        key={task._id} 
                                        className="p-3 sm:p-4 bg-zinc-900/60 hover:bg-zinc-900/80 transition rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                    >
                                        {/* Main Project Context Elements */}
                                        <div className="flex flex-col gap-1 max-w-xl min-w-0">
                                            <div className="flex items-center gap-3">
                                                <p className="text-sm font-semibold text-white truncate" title={task.title}>
                                                    {task.title}
                                                </p>
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-white/5 font-mono">
                                                    {task.category || 'General'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-zinc-400 line-clamp-1" title={task.description}>
                                                {task.description}
                                            </p>
                                            <p className="text-[9px] text-zinc-500 font-mono">
                                                Ref ID: {task._id} • Created: {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>

                                        {/* Financial Pricing and System Badges Block */}
                                        <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-white/5 sm:border-0 pt-2 sm:pt-0 min-w-[200px]">
                                            <div className="flex flex-col sm:items-end">
                                                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wide">Project Budget</span>
                                                <span className="text-sm font-bold text-emerald-400 font-mono">${task.budget}</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className={`capitalize px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold tracking-wide ${
                                                    task.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    task.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                }`}>
                                                    {task.status}
                                                </span>
                                                <button 
                                                    onClick={() => router.push(`/dashboard/client/tasks/${task._id}`)}
                                                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition border border-white/5"
                                                    title="View Details"
                                                >
                                                    <FaArrowRight className="text-[10px]" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}