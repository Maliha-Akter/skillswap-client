'use client';

import React, { useState, useEffect } from 'react';
import { authClient, useSession } from '@/lib/auth-client';
import { FaReceipt, FaSpinner, FaDollarSign, FaUserCircle, FaCalendarAlt, FaHashtag } from 'react-icons/fa';

const ClientPayments = () => {
    // 🛠️ destructuring session data safely
    const { data: session, status: sessionStatus } = useSession();

    const [ledger, setLedger] = useState([]);
    const [totalSpent, setTotalSpent] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPaymentHistory = async () => {
            if (!session?.user?.email) {
                console.log("🛑 FRONTEND: Missing user email. Session object right now:", session);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const { data: tokenData } = await authClient.token();
                const token = tokenData?.token;

                const backendUrl = `http://localhost:8080/client-payment-history?email=${encodeURIComponent(session.user.email)}`;
                console.log("🛰️ FRONTEND: Sending request to Backend URL ->", backendUrl);

                const response = await fetch(backendUrl, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                console.log("📥 FRONTEND: Received HTTP response status code ->", response.status);

                if (!response.ok) {
                    throw new Error(`Server responded with status code: ${response.status}`);
                }

                const data = await response.json();
                console.log("📦 FRONTEND: Parsed JSON Payload from server ->", data);

                setLedger(data.history || []);
                setTotalSpent(data.totalSpent || 0);
            } catch (err) {
                console.error("❌ FRONTEND CRITICAL FETCH ERROR:", err.message);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        console.log("🔑 FRONTEND: Auth check - Status:", sessionStatus, " | Email:", session?.user?.email);

        if (sessionStatus === "authenticated" || session?.user?.email) {
            fetchPaymentHistory();
        }
    }, [session, sessionStatus]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 bg-zinc-950 text-zinc-400 gap-4 min-h-screen p-4">
                <FaSpinner className="animate-spin text-emerald-500 text-3xl" />
                <p className="font-medium tracking-wide text-xs sm:text-sm font-mono text-center">Syncing financial ledgers...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 sm:p-6 md:p-8 lg:p-12 font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="mb-6 sm:mb-8 lg:mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-1.5">Payment History</h1>
                        <p className="text-zinc-400 text-xs font-mono">Review active funding transactions and outlays</p>
                    </div>

                    {/* Summary Metric Block */}
                    <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-3 sm:p-4 flex items-center gap-3.5 shadow-xl w-full sm:w-auto shrink-0">
                        <div className="p-2.5 sm:p-3 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                            <FaDollarSign className="text-lg sm:text-xl" />
                        </div>
                        <div>
                            <span className="text-[9px] sm:text-[10px] text-zinc-500 block font-mono uppercase tracking-wider">Total Investment Spent</span>
                            <span className="text-xl sm:text-2xl font-black text-white font-mono">${totalSpent.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {error ? (
                    <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl text-center text-red-400 text-xs font-mono">
                        ❌ Connection Failed: {error}. Please verify your backend API engine is running.
                    </div>
                ) : ledger.length === 0 ? (
                    <div className="text-center py-16 sm:py-24 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10 p-4">
                        <FaReceipt className="mx-auto text-zinc-700 text-3xl sm:text-4xl mb-3" />
                        <h3 className="text-sm sm:text-base font-semibold text-zinc-300">No transactions recorded</h3>
                        <p className="text-zinc-500 text-[11px] sm:text-xs mt-1 max-w-sm mx-auto font-mono leading-relaxed">
                            When you fund a milestone or task item, it will build your audit history map here.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        
                        {/* 📱 1. Mobile & Tablet Cards Interface (Fires on `sm` and `md` viewports) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                            {ledger.map((row, idx) => (
                                <div key={`card-${idx}`} className="bg-zinc-900 border border-zinc-800/60 rounded-xl p-4 flex flex-col gap-3 shadow-md">
                                    <div className="flex justify-between items-start gap-2 border-b border-zinc-800/50 pb-2.5">
                                        <div className="min-w-0">
                                            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block mb-0.5">Specification</span>
                                            <h4 className="text-sm font-bold text-white truncate">{row.taskName}</h4>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block mb-0.5">Outlay</span>
                                            <span className="text-sm font-bold text-emerald-400 font-mono">${Number(row.amount).toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[11px]">
                                        <div className="min-w-0">
                                            <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 block mb-0.5">Freelancer</span>
                                            <div className="flex items-center gap-1.5 text-zinc-300 font-mono truncate">
                                                <FaUserCircle className="text-zinc-600 shrink-0 text-xs" />
                                                <span className="truncate">{row.freelancerEmail}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 block mb-0.5">Clearing Status</span>
                                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${row.status?.toLowerCase() === 'paid'
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                : 'bg-zinc-800 text-zinc-400 border border-zinc-700/30'
                                                } border`}>
                                                {row.status || 'pending'}
                                            </span>
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 block mb-0.5">Settled Date</span>
                                            <div className="flex items-center gap-1.5 text-zinc-400 font-mono">
                                                <FaCalendarAlt className="text-zinc-600 text-[10px]" />
                                                <span>{row.date ? new Date(row.date).toLocaleDateString(undefined, { dateStyle: 'medium' }) : "N/A"}</span>
                                            </div>
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <span className="text-[9px] uppercase font-mono tracking-wider text-zinc-500 block mb-0.5">Task Reference ID</span>
                                            <div className="flex items-center gap-1 text-zinc-500 font-mono truncate">
                                                <FaHashtag className="text-[9px] text-zinc-700 shrink-0" />
                                                <span className="truncate">{row.taskId}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 🖥️ 2. Spreadsheet View (Optimized for `lg` and `xl` desktop screen widths) */}
                        <div className="hidden lg:block bg-zinc-900 border border-zinc-800/60 rounded-xl overflow-hidden shadow-2xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse table-auto">
                                    <thead>
                                        <tr className="bg-zinc-950 border-b border-zinc-800/80 text-[11px] font-mono tracking-wider uppercase text-zinc-400">
                                            <th className="py-4.5 px-5 font-semibold lg:max-w-[200px] xl:max-w-[none]">Task Specification</th>
                                            <th className="py-4.5 px-5 font-semibold">Task Ident ID</th>
                                            <th className="py-4.5 px-5 font-semibold lg:max-w-[180px] xl:max-w-[none]">Assigned Freelancer</th>
                                            <th className="py-4.5 px-5 font-semibold text-right">Amount Outlay</th>
                                            <th className="py-4.5 px-5 font-semibold text-center">Clearing Status</th>
                                            <th className="py-4.5 px-5 font-semibold">Settled Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800/40 text-xs">
                                        {ledger.map((row, idx) => (
                                            <tr key={`row-${idx}`} className="hover:bg-zinc-950/40 transition-colors">
                                                <td className="py-4 px-5 font-medium text-white lg:max-w-[200px] xl:max-w-[320px] truncate">
                                                    {row.taskName}
                                                </td>
                                                <td className="py-4 px-5 font-mono text-zinc-500 whitespace-nowrap">
                                                    <span className="flex items-center gap-1">
                                                        <FaHashtag className="text-[10px] text-zinc-700" />
                                                        {row.taskId}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-5 text-zinc-300 font-mono lg:max-w-[180px] xl:max-w-[260px] truncate">
                                                    <span className="flex items-center gap-1.5 truncate">
                                                        <FaUserCircle className="text-zinc-600 shrink-0 text-sm" />
                                                        <span className="truncate">{row.freelancerEmail}</span>
                                                    </span>
                                                </td>
                                                <td className="py-4 px-5 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                                                    ${Number(row.amount).toLocaleString()}
                                                </td>
                                                <td className="py-4 px-5 text-center whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${row.status?.toLowerCase() === 'paid'
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700/30'
                                                        } border`}>
                                                        {row.status || 'pending'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-5 text-zinc-400 font-mono whitespace-nowrap">
                                                    <span className="flex items-center gap-1.5">
                                                        <FaCalendarAlt className="text-zinc-600 text-[10px]" />
                                                        {row.date ? new Date(row.date).toLocaleDateString(undefined, { dateStyle: 'medium' }) : "N/A"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Financial Capital Bottom Banner Summary */}
                        <div className="bg-zinc-900 lg:bg-zinc-950/40 border border-zinc-800/60 rounded-xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono shadow-md lg:mt-2">
                            <span className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-zinc-500">Financial Balance Summary</span>
                            <div className="text-left sm:text-right text-xs">
                                <span className="text-zinc-400 block sm:inline">Total Account Capital Spent: </span>
                                <span className="text-emerald-400 font-black text-sm sm:ml-1">${totalSpent.toLocaleString()}</span>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientPayments;