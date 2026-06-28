"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from "@/lib/auth-client";
import {
    FaUsers, FaTasks, FaDollarSign, FaCheckCircle,
    FaHourglassHalf, FaBan, FaRegCreditCard, FaChartBar, FaThList
} from 'react-icons/fa';

export default function AdminDashboard() {
    const router = useRouter();
    const { data: session, isPending: sessionLoading } = authClient.useSession();
    const currentUser = session?.user;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [dashboardData, setDashboardData] = useState({
        stats: {
            totalUsers: 0,
            totalTasks: 0,
            totalRevenue: 0,
            activeTasks: 0,
            completedTasks: 0,
            in_progress: 0,
            pendingProposals: 0,
            blockedUsers: 0,
            successfulPayments: 0
        },
        revenueChart: [],
        taskStatusChart: { todo: 0, in_progress: 0, completed: 0 },
        recentTasks: [],
        recentUsers: [],
        recentPayments: []
    });

    useEffect(() => {
        if (!sessionLoading && (!currentUser || currentUser.role !== 'admin')) {
            router.push('/');
            return;
        }

        const fetchCompleteDashboardMatrix = async () => {
            try {
                setLoading(true);
                setError(null);

                const { data: tokenData } = await authClient.token();
                const secureToken = tokenData?.token;

                if (!secureToken) {
                    throw new Error("Security verification failed: Missing auth token context.");
                }

                const response = await fetch('http://localhost:8080/api/admin/overview-stats', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'authorization': `Bearer ${secureToken}`
                    }
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    setDashboardData(result.data);
                } else {
                    throw new Error(result.message || "Failed to retrieve aggregated dashboard metrics.");
                }
            } catch (err) {
                console.error("❌ ==> [FRONTEND DASHBOARD RECOVERY EXCEPTION]:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser?.email) {
            fetchCompleteDashboardMatrix();
        }
    }, [currentUser, sessionLoading, router]);

    if (sessionLoading || loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 font-mono text-sm tracking-wider animate-pulse">
                Syncing platform administrative metrics...
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

    // ────────────────────────────────────────────────────────────────────────
    // ✅ SAFE STATE NORMALIZATION (Handles "open", "Completed", "in_progress")
    // ────────────────────────────────────────────────────────────────────────
    const stats = dashboardData?.stats || {
        totalUsers: 0, totalTasks: 0, totalRevenue: 0, activeTasks: 0,
        completedTasks: 0, in_progress: 0, pendingProposals: 0,
        blockedUsers: 0, successfulPayments: 0
    };

    const revenueChart = dashboardData?.revenueChart || [];
    const recentTasks = dashboardData?.recentTasks || [];
    const recentUsers = dashboardData?.recentUsers || [];
    const recentPayments = dashboardData?.recentPayments || [];

    // Map any dynamic raw DB values safely to standard lowercase keys
    const rawChart = dashboardData?.taskStatusChart || {};
    const taskStatusChart = {
        todo: Number(rawChart.todo || rawChart.open || stats.totalTasks - (stats.completedTasks + (stats.in_progress || stats.activeTasks || 0)) || 0),
        in_progress: Number(rawChart.in_progress || stats.in_progress || stats.activeTasks || 0),
        completed: Number(rawChart.completed || rawChart.Completed || stats.completedTasks || 0)
    };

    const graphTotalTasks = (taskStatusChart.todo + taskStatusChart.in_progress + taskStatusChart.completed) || 1;
    const maxRevenuePoint = Math.max(...revenueChart.map(d => d.amount || 0), 1);

    return (
        <div className="bg-zinc-950 min-h-screen text-zinc-100 p-4 md:p-10 selection:bg-emerald-500/30">
            <div className="max-w-7xl mx-auto flex flex-col gap-8">

                {/* Header block */}
                <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                            <span className="text-emerald-400">🛡️</span> Admin Control Terminal
                        </h1>
                        <p className="text-zinc-400 text-xs mt-1 font-mono">
                            Platform monitoring configuration panel • Session: <span className="text-zinc-300 font-bold">{currentUser?.email}</span>
                        </p>
                    </div>
                    <div className="bg-zinc-900 border border-white/5 px-4 py-2 rounded-xl text-xs font-mono text-zinc-400">
                        Status: <span className="text-emerald-400 animate-ping inline-block w-2 h-2 rounded-full bg-emerald-400 mr-1" /> LIVE_SYNC
                    </div>
                </div>

                {/* Top-tier metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition">
                        <div className="flex items-center justify-between text-zinc-400"><span className="text-xs font-bold uppercase tracking-wider">Total Users</span><FaUsers className="text-zinc-500" /></div>
                        <h3 className="text-3xl font-black text-white mt-3 font-mono">{stats.totalUsers}</h3>
                    </div>
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition">
                        <div className="flex items-center justify-between text-zinc-400"><span className="text-xs font-bold uppercase tracking-wider">Total Tasks</span><FaTasks className="text-zinc-500" /></div>
                        <h3 className="text-3xl font-black text-white mt-3 font-mono">{stats.totalTasks}</h3>
                    </div>
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition">
                        <div className="flex items-center justify-between text-zinc-400"><span className="text-xs font-bold uppercase tracking-wider">Active Tasks</span><FaHourglassHalf className="text-teal-400" /></div>
                        <h3 className="text-3xl font-black text-teal-400 mt-3 font-mono">{stats.activeTasks}</h3>
                    </div>
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition">
                        <div className="flex items-center justify-between text-zinc-400"><span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span><FaDollarSign className="text-emerald-400" /></div>
                        <h3 className="text-3xl font-black text-emerald-400 mt-3 font-mono">${(stats.totalRevenue || 0).toLocaleString()}</h3>
                    </div>
                </div>

                {/* Main Visualization Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Pie / Donut Chart Panel */}
                    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 flex flex-col justify-between gap-6">
                        <div>
                            <h4 className="text-sm font-bold tracking-wider uppercase text-zinc-400 mb-6">Task Distribution Status</h4>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 my-4">
                                {/* ✅ FIXED: Corrected mapping values to exact normalized lowercase keys */}
                                <div
                                    className="w-32 h-32 rounded-full relative shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center flex-shrink-0"
                                    style={{
                                        background: `conic-gradient(
                                            #10b981 0% ${(taskStatusChart.completed / graphTotalTasks) * 100}%, 
                                            #f59e0b ${(taskStatusChart.completed / graphTotalTasks) * 100}% ${((taskStatusChart.completed + taskStatusChart.in_progress) / graphTotalTasks) * 100}%, 
                                            #71717a ${((taskStatusChart.completed + taskStatusChart.in_progress) / graphTotalTasks) * 100}% 100%
                                        )`
                                    }}
                                >
                                    <div className="w-[70%] h-[70%] bg-zinc-950 rounded-full flex flex-col items-center justify-center border border-white/5">
                                        <span className="text-xs font-mono text-zinc-500 uppercase tracking-tighter">Total</span>
                                        <span className="text-lg font-black text-white font-mono">
                                            {taskStatusChart.todo + taskStatusChart.in_progress + taskStatusChart.completed}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col gap-3 w-full">
                                    {[
                                        { key: 'completed', label: 'Completed', color: 'bg-emerald-400', text: 'text-emerald-400' },
                                        { key: 'in_progress', label: 'In Progress', color: 'bg-amber-400', text: 'text-amber-400' },
                                        { key: 'todo', label: 'Open / Todo', color: 'bg-zinc-500', text: 'text-zinc-400' }
                                    ].map((item) => {
                                        const value = taskStatusChart[item.key] || 0;
                                        const pct = ((value / graphTotalTasks) * 100).toFixed(0);
                                        return (
                                            <div key={item.key} className="flex flex-col gap-1 w-full">
                                                <div className="flex justify-between items-center text-xs font-mono">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`w-2.5 h-2.5 rounded-sm ${item.color}`} />
                                                        <span className="text-zinc-300 font-semibold">{item.label}</span>
                                                    </div>
                                                    <span className={`${item.text} font-bold`}>{value} ({pct}%)</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="text-[11px] text-zinc-500 font-mono pt-4 border-t border-white/5 text-center">
                            Platform Lifecycle Fulfillment Distribution
                        </div>
                    </div>

                    {/* Revenue Line Graph */}
                    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 ">
                        <h4 className="text-sm font-bold tracking-wider uppercase text-zinc-400 mb-6 flex items-center gap-2"><FaChartBar className="text-emerald-400" /> Revenue Timeline Stream</h4>
                        <div className="h-48 flex items-end justify-between gap-2 pt-4 border-b border-white/10 px-2">
                            {revenueChart.map((point, index) => {
                                const percentage = ((point.amount || 0) / maxRevenuePoint) * 100;
                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                                        <div className="text-[10px] text-emerald-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 px-1.5 py-0.5 rounded border border-white/10 mb-1">
                                            ${point.amount}
                                        </div>
                                        <div
                                            style={{ height: `${Math.max(percentage, 8)}%` }}
                                            className="w-full bg-gradient-to-t from-emerald-600/50 to-emerald-400 rounded-t-sm transition-all duration-500 group-hover:brightness-125"
                                        />
                                        <span className="text-[10px] text-zinc-500 font-mono mt-1 select-none uppercase">{point.date}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Secondary metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-4 flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400"><FaCheckCircle /></div>
                        <div><p className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">Completed Tasks</p><p className="text-xl font-bold font-mono text-zinc-200">{stats.completedTasks}</p></div>
                    </div>
                    <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-4 flex items-center gap-4">
                        <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400"><FaThList /></div>
                        <div><p className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">Pending Proposals</p><p className="text-xl font-bold font-mono text-zinc-200">{stats.pendingProposals}</p></div>
                    </div>
                    <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-4 flex items-center gap-4">
                        <div className="p-3 bg-rose-500/10 rounded-lg text-rose-400"><FaBan /></div>
                        <div><p className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">Blocked Users</p><p className="text-xl font-bold font-mono text-rose-400">{stats.blockedUsers}</p></div>
                    </div>
                    <div className="bg-zinc-900/30 border border-white/5 rounded-xl p-4 flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400"><FaRegCreditCard /></div>
                        <div><p className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">Successful Payments</p><p className="text-xl font-bold font-mono text-zinc-200">{stats.successfulPayments}</p></div>
                    </div>
                </div>

                {/* Live Activity Feeds */}
                <div className="gap-6">
                    {/* Recent Tasks */}
                    <div className="bg-zinc-900/20 border border-white/5 rounded-2xl p-5 flex flex-col gap-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 border-b border-white/5 pb-2">Recent Tasks Feed</h4>
                        <div className="flex flex-col gap-3 overflow-y-auto max-h-[280px]">
                            {recentTasks.map((task) => (
                                <div key={task._id} className="p-3 bg-zinc-900/60 rounded-xl border border-white/5 flex flex-col gap-1">
                                    <p className="text-sm font-semibold text-white truncate">{task.title}</p>
                                    <div className="flex justify-between items-center text-[11px] font-mono text-zinc-400 mt-1">
                                        <span className="text-emerald-400">${task.budget}</span>
                                        {/* ✅ FIXED: Clean case fallback rendering */}
                                        <span className="capitalize px-1.5 py-0.5 rounded bg-zinc-800 border border-white/5 text-[10px]">
                                            {task.status === 'open' ? 'Todo' : task.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Users */}
                    <div className="bg-zinc-900/20 border border-white/5 rounded-2xl p-5 flex flex-col gap-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 border-b border-white/5 pb-2">Recent User Signups</h4>
                        <div className="flex flex-col gap-3 overflow-y-auto max-h-[280px]">
                            {recentUsers.map((user) => (
                                <div key={user._id} className="p-3 bg-zinc-900/60 rounded-xl border border-white/5 flex items-center justify-between">
                                    <div className="truncate max-w-[150px]">
                                        <p className="text-xs font-mono text-zinc-200 truncate">{user.email}</p>
                                        <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono">{user.role || 'client'}</span>
                                    </div>
                                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${user.isBlocked ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-zinc-800 text-zinc-400 border-white/5'}`}>
                                        {user.isBlocked ? 'Blocked' : 'Active'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Payments */}
                    <div className="bg-zinc-900/20 border border-white/5 rounded-2xl p-5 flex flex-col gap-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 border-b border-white/5 pb-2">Recent Stripe Payments</h4>
                        <div className="flex flex-col gap-3 overflow-y-auto max-h-[280px]">
                            {recentPayments.map((pay) => (
                                <div key={pay._id} className="p-3 bg-zinc-900/60 rounded-xl border border-white/5 flex items-center justify-between">
                                    <div className="truncate max-w-[140px]">
                                        <p className="text-xs font-mono text-zinc-300 truncate">{pay.client_email}</p>
                                        <span className="text-[9px] font-mono text-zinc-500 block truncate">{pay.transaction_id}</span>
                                    </div>
                                    <span className="text-xs font-bold font-mono text-emerald-400">${pay.amount}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}