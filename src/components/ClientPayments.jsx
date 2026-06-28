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
            // Safe Check: If we have an email, we can proceed regardless of what 'status' says!
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

        // 🛠️ FIX: Run if status is authenticated OR if the user email is successfully found
        if (sessionStatus === "authenticated" || session?.user?.email) {
            fetchPaymentHistory();
        }
    }, [session, sessionStatus]);

    // Render loading state only if we don't have session data and it's explicitly loading
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 bg-zinc-950 text-zinc-400 gap-4 min-h-screen">
                <FaSpinner className="animate-spin text-emerald-500 text-3xl" />
                <p className="font-medium tracking-wide text-sm font-mono">Syncing financial ledgers...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 sm:p-10 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Payment History</h1>
                        <p className="text-zinc-400 text-xs font-mono">Review active funding transactions and outlays</p>
                    </div>

                    {/* Summary Metric Block */}
                    <div className="bg-zinc-900 border border-zinc-800/80 rounded-xl p-4 flex items-center gap-4 shadow-xl shrink-0">
                        <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                            <FaDollarSign className="text-xl" />
                        </div>
                        <div>
                            <span className="text-[10px] text-zinc-500 block font-mono uppercase tracking-wider">Total Investment Spent</span>
                            <span className="text-2xl font-black text-white font-mono">${totalSpent.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {error ? (
                    <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-xl text-center text-red-400 text-xs font-mono">
                        ❌ Connection Failed: {error}. Please verify your backend API engine is running.
                    </div>
                ) : ledger.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
                        <FaReceipt className="mx-auto text-zinc-700 text-4xl mb-4" />
                        <h3 className="text-base font-semibold text-zinc-300">No transactions recorded</h3>
                        <p className="text-zinc-500 text-xs mt-1 font-mono">When you fund a milestone or task item, it will build your audit history map here.</p>
                    </div>
                ) : (
                    /* Spreadsheet Data Presentation Card Layer */
                    <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto px-4">

                            {/* 2. ADD min-w-[800px] HERE to give columns fixed horizontal space */}
                            <table className="w-full min-w-[800px] text-left border-collapse">
                                <thead>
                                    <tr className="bg-zinc-950 border-b border-zinc-800/80 text-[11px] font-mono tracking-wider uppercase text-zinc-400">
                                        <th className="py-4 px-6 font-semibold">Task Specification</th>
                                        <th className="py-4 px-6 font-semibold hidden md:table-cell">Task Ident ID</th>
                                        <th className="py-4 px-6 font-semibold">Assigned Freelancer</th>
                                        <th className="py-4 px-6 font-semibold text-right">Amount Outlay</th>
                                        <th className="py-4 px-6 font-semibold text-center">Clearing Status</th>
                                        <th className="py-4 px-6 font-semibold hidden sm:table-cell">Settled Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/40 text-xs">
                                    {ledger.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-zinc-950/40 transition-colors">
                                            <td className="py-4 px-6 font-medium text-white max-w-[240px] truncate">
                                                {row.taskName}
                                            </td>
                                            <td className="py-4 px-6 font-mono text-zinc-500 hidden md:table-cell whitespace-nowrap">
                                                <span className="flex items-center gap-1">
                                                    <FaHashtag className="text-[10px] text-zinc-700" />
                                                    {row.taskId}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-zinc-300 font-mono">
                                                <span className="flex items-center gap-1.5 truncate max-w-[180px]">
                                                    <FaUserCircle className="text-zinc-600 shrink-0 text-sm" />
                                                    {row.freelancerEmail}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right font-mono font-bold text-emerald-400">
                                                ${Number(row.amount).toLocaleString()}
                                            </td>
                                            <td className="py-4 px-6 text-center whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${row.status?.toLowerCase() === 'paid'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700/30'
                                                    } border`}>
                                                    {row.status || 'pending'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-zinc-400 font-mono hidden sm:table-cell whitespace-nowrap">
                                                <span className="flex items-center gap-1.5">
                                                    <FaCalendarAlt className="text-zinc-600 text-[10px]" />
                                                    {/* 🛠️ Safe check for row.date since backend maps safe_date to date */}
                                                    {row.date ? new Date(row.date).toLocaleDateString(undefined, { dateStyle: 'medium' }) : "N/A"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-zinc-950/80 px-6 py-5 border-t border-zinc-800/80 flex items-center justify-between font-mono">
                            <span className="text-xs uppercase font-bold tracking-wider text-zinc-500">Financial Balance Summary</span>
                            <div className="text-right text-xs">
                                <span className="text-zinc-400">Total Account Capital Spent: </span>
                                <span className="text-emerald-400 font-black text-sm ml-1">${totalSpent.toLocaleString()}</span>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientPayments;