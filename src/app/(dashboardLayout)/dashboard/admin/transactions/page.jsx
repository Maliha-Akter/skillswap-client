"use client";
import React, { useState, useEffect } from 'react';
import { FaHistory } from 'react-icons/fa';
import { authClient } from "@/lib/auth-client";
import { useRouter } from 'next/navigation';

export default function TransactionsPage() {
    const router = useRouter();
    const { data: session } = authClient.useSession();
    const currentUser = session?.user;

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTransactionLedger = async () => {
        try {
            if (transactions.length === 0) setLoading(true);
            setError(null);

            // 1. Fetch token securely from auth store
            const tokenData = await authClient.token();
            const actualToken = tokenData?.token || tokenData?.data?.token || tokenData?.token?.token;

            if (!actualToken) {
                console.warn("⚠️ ==> Authorization token string missing for transactions fetch pipeline.");
                setError("Authentication session has expired. Please sign back in.");
                setLoading(false);
                return;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${actualToken}` // ✅ Attached Secure Bearer Token
                }
            });

            if (!res.ok) {
                throw new Error(`Server returned error code ${res.status}`);
            }

            const data = await res.json();
            setTransactions(Array.isArray(data) ? data : data.data || []);
        } catch (err) {
            console.error("❌ ==> [FRONTEND TRANSACTIONS FAULT]:", err);
            setError(err.message);
        } finally {
            closeLoadingPipeline();
        }
    };

    // Helper to keep code clean and manageable
    const closeLoadingPipeline = () => setLoading(false);

    useEffect(() => {
        if (currentUser && currentUser.role !== 'admin') {
            router.push('/unauthorized');
            return;
        }

        if (currentUser?.email) {
            fetchTransactionLedger();
        }
    }, [currentUser, router]);

    return (
        <div className="p-6 md:p-10 bg-zinc-950 min-h-screen text-zinc-100 flex flex-col gap-6 max-w-7xl mx-auto">
            {/* Title Block */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                    <FaHistory className="text-emerald-400" /> Transactions History Ledger
                </h1>
                <p className="text-sm text-zinc-400 mt-1">Audit active Stripe data records, payouts, and incoming payment statuses</p>
            </div>

            {/* FULL WIDTH INTERACTIVE TABLE SECTION */}
            <div className="w-full overflow-x-auto rounded-2xl border border-white/10 bg-zinc-900/30 backdrop-blur-md shadow-2xl">
                {!currentUser?.email || loading ? (
                    <div className="text-center py-20 text-zinc-500 text-sm animate-pulse tracking-wide font-mono">
                        Syncing transaction data...
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-red-400 text-sm font-mono bg-red-950/10 border border-red-500/10 rounded-2xl m-4">
                        ⚠️ Exception caught matching data records: {error}
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-20 text-zinc-500 text-sm border border-dashed border-white/10 rounded-2xl m-4 font-mono">
                        <div className="text-zinc-400 font-semibold mb-1 text-base">No Transactions Yet</div>
                        No active Stripe payment streams have been processed on this server matrix yet.
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-zinc-900/80 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">Transaction ID</th>
                                <th className="px-6 py-4">Client Email</th>
                                <th className="px-6 py-4">Freelancer Email</th>
                                <th className="px-6 py-4">Task ID</th>
                                <th className="px-6 py-4">Payout Size</th>
                                <th className="px-6 py-4">Payment Date</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx) => (
                                <tr 
                                    key={tx._id} 
                                    className="border-b border-white/5 hover:bg-zinc-900/40 transition-colors duration-150"
                                >
                                    <td className="px-6 py-4 text-xs font-mono text-zinc-400 max-w-[150px] truncate" title={tx.transaction_id}>
                                        {tx.transaction_id || "N/A"}
                                    </td>
                                    
                                    <td className="px-6 py-4 text-sm text-zinc-300 font-mono max-w-[180px] truncate" title={tx.client_email}>
                                        {tx.client_email || "N/A"}
                                    </td>
                                    
                                    <td className="px-6 py-4 text-sm text-zinc-300 font-mono max-w-[180px] truncate" title={tx.freelancer_email}>
                                        {tx.freelancer_email || "N/A"}
                                    </td>
                                    
                                    <td className="px-6 py-4 text-xs font-mono text-zinc-500 max-w-[120px] truncate" title={tx.task_id}>
                                        {tx.task_id || "N/A"}
                                    </td>
                                    
                                    <td className="px-6 py-4 text-sm font-semibold text-emerald-400 font-mono">
                                        ${tx.amount || 0}
                                    </td>
                                    
                                    <td className="px-6 py-4 text-sm text-zinc-400 font-mono">
                                        {tx.paid_at ? new Date(tx.paid_at).toLocaleString() : "Recent"}
                                    </td>
                                    
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-0.5 border rounded-full text-[10px] font-mono tracking-wider font-bold inline-block uppercase ${
                                            String(tx.payment_status).toLowerCase() === 'paid' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                            String(tx.payment_status).toLowerCase() === 'pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                                            'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                        }`}>
                                            {tx.payment_status || "Unknown"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}