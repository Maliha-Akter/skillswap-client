'use client';

import React, { useState, useEffect } from 'react';
import { useSession, authClient } from '@/lib/auth-client';
import { 
    FaDollarSign, FaChartBar, FaReceipt, FaArrowUp, 
    FaSpinner, FaFolderOpen, FaCalendarAlt, FaFingerprint,
    FaArrowRight, FaShieldAlt, FaBriefcase, FaCircle
} from 'react-icons/fa';

const EarningsPage = () => {
    const { data: session, status: sessionStatus } = useSession();
    
    const [financeData, setFinanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEarningsData = async () => {
            if (sessionStatus === "loading") return;
            
            if (sessionStatus === "unauthenticated" || !session?.user?.email) {
                setError("Please log in first.");
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                const { data: tokenData } = await authClient.token();
                const token = tokenData?.token;

                if (!token) {
                    throw new Error("Security token is missing. Please log in again.");
                }
                
                // Fetch user earnings from the server using email
                const res = await fetch(`http://localhost:8080/freelancer-earnings?email=${encodeURIComponent(session.user.email)}`, {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!res.ok) throw new Error("Could not get data from the server.");
                
                const data = await res.json();
                setFinanceData(data);
                setError(null);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchEarningsData();
    }, [session, sessionStatus]);

    // Loading Screen
    if (sessionStatus === "loading" || loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-500 gap-3">
                <div className="relative w-10 h-10 flex items-center justify-center">
                    <div className="absolute inset-0 border-2 border-zinc-900 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-t-emerald-500 rounded-full animate-spin"></div>
                </div>
                <p className="font-mono text-[10px] tracking-wider uppercase">Loading your money logs...</p>
            </div>
        );
    }

    // Error Screen
    if (error) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 font-mono">
                <div className="max-w-md w-full border border-red-900/40 bg-red-950/5 p-5 rounded-lg space-y-3">
                    <div className="flex items-center gap-2 text-red-400 text-xs font-bold">
                        <span>[SYSTEM ERROR]</span>
                    </div>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">Something went wrong: {error}</p>
                </div>
            </div>
        );
    }

    // Fallback data if backend values are missing
    const summary = financeData?.summary || { totalEarned: 0, paymentCount: 0, averagePerTask: 0 };
    const chartData = financeData?.chartData || [];
    const history = financeData?.history || [];

    const maxChartValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.earnings), 100) : 100;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-300 p-4 sm:p-8 lg:p-12 font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
            <div className="max-w-7xl mx-auto space-y-12">
                
                {/* Top Header Panel */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-900 pb-8">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px] tracking-wider uppercase">
                            <FaShieldAlt className="text-emerald-500/70" />
                            <span>Secure Vault</span>
                        </div>
                        <h1 className="text-2xl font-light tracking-tight text-white font-mono">
                            My Earnings<span className="text-emerald-400 font-sans font-medium">.log</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-3 bg-zinc-900/40 border border-zinc-900 px-4 py-2 rounded-lg">
                        <FaCircle className="text-[6px] text-emerald-500 animate-pulse" />
                        <span className="text-[11px] font-mono text-zinc-400 truncate max-w-[200px]">
                            {session?.user?.email}
                        </span>
                    </div>
                </div>

                {/* Main Dashboard Grid Split */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Panel: Big Money Display Box */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/80 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 border-r border-t border-emerald-500/10 rounded-tr-2xl pointer-events-none" />
                            
                            <div className="space-y-8">
                                <span className="inline-block text-[9px] font-mono tracking-widest uppercase bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                                    Total Money Earned
                                </span>
                                
                                <div className="space-y-1">
                                    <span className="text-xs font-mono text-zinc-500">$ USD</span>
                                    <h2 className="text-5xl font-extralight tracking-tight text-white font-mono">
                                        {summary.totalEarned.toLocaleString()}
                                    </h2>
                                </div>

                                {/* Mini Stats Grid */}
                                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-900 text-xs font-mono">
                                    <div className="space-y-1">
                                        <span className="text-zinc-500 text-[10px] block">Payments Received</span>
                                        <span className="text-zinc-200 font-semibold flex items-center gap-1.5">
                                            <FaReceipt className="text-zinc-600 text-[10px]" />
                                            {summary.paymentCount} times
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-zinc-500 text-[10px] block">Average Pay</span>
                                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                            <FaArrowUp className="text-[9px]" />
                                            ${summary.averagePerTask} / job
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Informative Banner Box */}
                        <div className="border border-zinc-900 bg-zinc-900/20 p-4 rounded-xl flex items-start gap-3">
                            <FaBriefcase className="text-zinc-600 mt-0.5 text-xs shrink-0" />
                            <p className="text-[11px] text-zinc-500 leading-relaxed">
                                Money updates in real-time. Payments are sent automatically as soon as the client approves your completed work milestones.
                            </p>
                        </div>
                    </div>

                    {/* Right Panel: Clean Bar Chart Charting */}
                    <div className="lg:col-span-7 bg-zinc-900/20 border border-zinc-900 rounded-2xl p-6 shadow-xl space-y-6">
                        <div className="flex items-center justify-between border-b border-zinc-900/60 pb-4">
                            <div className="flex items-center gap-2">
                                <FaChartBar className="text-zinc-600 text-xs" />
                                <h3 className="text-[11px] font-mono font-medium uppercase tracking-wider text-zinc-400">Monthly Yield Graph</h3>
                            </div>
                            <span className="text-[9px] font-mono text-zinc-600">MAX HEIGHT: ${maxChartValue}</span>
                        </div>

                        {/* Geometric Minimalist Chart Columns */}
                        <div className="h-44 flex items-end gap-2 sm:gap-4 pt-4 px-2 font-mono">
                            {chartData.map((bar, index) => {
                                const heightPercentage = (bar.earnings / maxChartValue) * 100;
                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                        
                                        {/* Simple Hover Popup Tooltip */}
                                        {bar.earnings > 0 && (
                                            <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 bg-white text-zinc-950 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xl transition-all duration-150 pointer-events-none z-10">
                                                ${bar.earnings}
                                            </div>
                                        )}
                                        
                                        {/* Colored column bar */}
                                        <div 
                                            style={{ height: `${Math.max(heightPercentage, bar.earnings > 0 ? 3 : 8)}%` }}
                                            className={`w-full transition-all duration-300 ${
                                                bar.earnings > 0 
                                                    ? 'bg-emerald-500 group-hover:bg-emerald-400' 
                                                    : 'bg-zinc-900'
                                            }`}
                                        />
                                        
                                        <span className="text-[9px] text-zinc-600 mt-2 truncate max-w-full group-hover:text-zinc-400 transition-colors">
                                            {bar.name}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* History List Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                        <div className="flex items-center gap-2">
                            <FaReceipt className="text-zinc-600 text-xs" />
                            <h3 className="text-[11px] font-mono font-medium uppercase tracking-wider text-zinc-400">Payment History List</h3>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-600">{history.length} jobs total</span>
                    </div>

                    {history.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-zinc-900 rounded-xl text-zinc-600">
                            <FaFolderOpen className="mx-auto text-xl mb-1.5 opacity-40" />
                            <p className="text-[10px] font-mono">No payment records found on this account yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-900 border-t border-zinc-900">
                            {history.map((row, index) => (
                                <div 
                                    key={row.id || index} 
                                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-zinc-900/10 px-2 transition-colors duration-150"
                                >
                                    {/* Task Info & Transaction IDs */}
                                    <div className="space-y-1 max-w-md">
                                        <h4 className="text-xs font-medium text-zinc-200 group-hover:text-white transition-colors truncate">
                                            {row.taskTitle}
                                        </h4>
                                        <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-600">
                                            <span className="text-zinc-500">{row.clientEmail}</span>
                                            <span className="hidden sm:inline text-zinc-800">/</span>
                                            <span className="flex items-center gap-1">
                                                <FaFingerprint className="text-[9px]" />
                                                <span className="max-w-[100px] truncate">{row.transactionId}</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Date & Earned Amounts */}
                                    <div className="flex items-center justify-between sm:justify-end gap-6 font-mono text-xs">
                                        <span className="text-zinc-600 text-[10px] flex items-center gap-1">
                                            <FaCalendarAlt className="text-[9px]" />
                                            {new Date(row.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-emerald-500 font-medium">
                                                +${row.amount}
                                            </span>
                                            <FaArrowRight className="text-[9px] text-zinc-800 group-hover:text-zinc-600 group-hover:translate-x-0.5 transition-all" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default EarningsPage;