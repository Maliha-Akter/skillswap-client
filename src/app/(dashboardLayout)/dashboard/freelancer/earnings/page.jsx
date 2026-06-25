'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { 
    FaDollarSign, FaChartBar, FaReceipt, FaArrowUp, 
    FaSpinner, FaFolderOpen, FaCalendarAlt, FaFingerprint 
} from 'react-icons/fa';

const EarningsPage = () => {
    const { data: session, status: sessionStatus } = useSession();
    
    const [financeData, setFinanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEarningsAnalytics = async () => {
            // Wait until the session state is fully determined
            if (sessionStatus === "loading") return;
            
            if (sessionStatus === "unauthenticated" || !session?.user?.email) {
                setError("Authentication missing. Please log in.");
                setLoading(false);
                return;
            }
            
            try {
                setLoading(true);
                const res = await fetch(`http://localhost:8080/freelancer-earnings?email=${encodeURIComponent(session.user.email)}`);
                if (!res.ok) throw new Error("Could not fetch earnings data from server.");
                
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

        fetchEarningsAnalytics();
    }, [session, sessionStatus]);

    // Render loading spinner
    if (sessionStatus === "loading" || loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 bg-zinc-950 text-zinc-400 gap-4">
                <FaSpinner className="animate-spin text-emerald-500 text-3xl" />
                <p className="font-medium tracking-wide text-xs font-mono">Syncing financial ledgers...</p>
            </div>
        );
    }

    // Render error container 
    if (error) {
        return (
            <div className="max-w-4xl mx-auto my-12 p-6 bg-red-950/20 border border-red-900/30 rounded-xl text-center">
                <p className="text-red-400 font-mono text-xs">⚠️ Analytics Ledger Fault: {error}</p>
            </div>
        );
    }

    // SAFE FALLBACK DESTRUCTURING: Guarantees your page can never crash even if arrays are empty
    const summary = financeData?.summary || { totalEarned: 0, paymentCount: 0, averagePerTask: 0 };
    const chartData = financeData?.chartData || [];
    const history = financeData?.history || [];

    // Calculate maximum bar height context safely
    const maxChartValue = chartData.length > 0 ? Math.max(...chartData.map(d => d.earnings), 100) : 100;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 sm:p-10 font-sans">
            <div className="max-w-7xl mx-auto space-y-10">
                
                {/* Section Header */}
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Earnings</h1>
                    <p className="text-zinc-400 text-xs tracking-wide">Track your income from completed tasks</p>
                </div>

                {/* Performance Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Total Earned Card */}
                    <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-6 shadow-xl flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">Total Earned</p>
                            <h2 className="text-3xl font-black text-white font-mono">${summary.totalEarned}</h2>
                            <p className="text-zinc-500 text-[11px] font-medium">From {summary.paymentCount} completed clearing payments</p>
                        </div>
                        <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/10 text-amber-500">
                            <FaDollarSign className="text-xl" />
                        </div>
                    </div>

                    {/* Average Earned Card */}
                    <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-6 shadow-xl flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[11px] font-semibold tracking-wider text-zinc-500 uppercase">Average Per Task</p>
                            <h2 className="text-3xl font-black text-white font-mono">${summary.averagePerTask}</h2>
                            <p className="text-zinc-500 text-[11px] font-medium">Average earning per completed task</p>
                        </div>
                        <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/10 text-emerald-400">
                            <FaArrowUp className="text-xl" />
                        </div>
                    </div>
                </div>

                {/* Monthly Performance Analytics Visualization */}
                <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl p-6 shadow-2xl">
                    <div className="flex items-center gap-2 mb-6">
                        <FaChartBar className="text-amber-500 text-sm" />
                        <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">Monthly Earnings</h3>
                    </div>

                    <div className="h-64 flex items-end gap-2 pt-6 px-2 border-b border-zinc-800 font-mono">
                        {chartData.map((bar, index) => {
                            const heightPercentage = (bar.earnings / maxChartValue) * 100;
                            return (
                                <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                    {/* Interactive Hover Tooltip */}
                                    {bar.earnings > 0 && (
                                        <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-2 bg-zinc-950 border border-zinc-800 text-white font-bold text-[10px] px-2 py-1 rounded shadow-xl transition-opacity duration-150 pointer-events-none z-10">
                                            ${bar.earnings}
                                        </div>
                                    )}
                                    {/* Rendered Bar Graph Column */}
                                    <div 
                                        style={{ height: `${Math.max(heightPercentage, bar.earnings > 0 ? 4 : 1)}%` }}
                                        className={`w-full rounded-t-md transition-all duration-300 ${
                                            bar.earnings > 0 
                                                ? 'bg-gradient-to-t from-amber-600 to-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                                                : 'bg-zinc-800/40'
                                        }`}
                                    />
                                    <span className="text-[10px] text-zinc-500 font-sans mt-3 transform group-hover:text-zinc-300 transition-colors">
                                        {bar.name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Historical Table Grid */}
                <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl shadow-2xl overflow-hidden">
                    <div className="p-6 border-b border-zinc-800/80 flex items-center gap-2">
                        <FaReceipt className="text-zinc-400 text-sm" />
                        <h3 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">Historical Account Statement</h3>
                    </div>

                    {history.length === 0 ? (
                        <div className="text-center py-16 text-zinc-500">
                            <FaFolderOpen className="mx-auto text-3xl mb-3 text-zinc-700" />
                            <p className="text-xs">No successful settlements recorded on this ledger account.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-zinc-950 text-zinc-400 font-semibold tracking-wider border-b border-zinc-800/80 uppercase text-[10px]">
                                        <th className="py-4 px-6">Task Description</th>
                                        <th className="py-4 px-6">Client Profile</th>
                                        <th className="py-4 px-6">Amount Secured</th>
                                        <th className="py-4 px-6">Settlement Date</th>
                                        <th className="py-4 px-6 font-mono">Core Transaction Hash</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                                    {history.map((row, index) => (
                                        <tr key={row.id || index} className="hover:bg-zinc-850/40 transition-colors">
                                            <td className="py-4 px-6 font-semibold text-white max-w-xs truncate">{row.taskTitle}</td>
                                            <td className="py-4 px-6 font-mono text-zinc-400">{row.clientEmail}</td>
                                            <td className="py-4 px-6 font-bold font-mono text-emerald-400">+{row.amount}</td>
                                            <td className="py-4 px-6 text-zinc-400 font-mono">
                                                <div className="flex items-center gap-1.5">
                                                    <FaCalendarAlt className="text-zinc-600 text-[10px]" />
                                                    {new Date(row.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-zinc-500 font-mono text-[11px] tracking-tight">
                                                <div className="flex items-center gap-1.5 max-w-[180px]">
                                                    <FaFingerprint className="text-zinc-700 text-[10px] shrink-0" />
                                                    <span className="truncate">{row.transactionId}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default EarningsPage; 