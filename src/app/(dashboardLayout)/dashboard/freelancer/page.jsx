"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from "@/lib/auth-client";
import { 
    FaFileInvoiceDollar, FaHourglassHalf, FaCheckCircle, 
    FaDollarSign, FaTasks, FaPaperPlane 
} from 'react-icons/fa';

export default function FreelancerDashboard() {
    const router = useRouter();
    const { data: session, isPending: sessionLoading } = authClient.useSession();
    const currentUser = session?.user;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Live Aggregated State Structure matching your specs
    const [dashboardData, setDashboardData] = useState({
        stats: {
            totalProposals: 0,
            pendingProposals: 0,
            acceptedProposals: 0,
            totalEarnings: 0
        },
        earningsChart: [],
        proposalStatusChart: { pending: 0, accepted: 0, rejected: 0 },
        recentProposals: [],
        activeContracts: []
    });

    useEffect(() => {
        // Guard against non-freelancer entries safely
        if (!sessionLoading && (!currentUser || currentUser.role !== 'freelancer')) {
            router.push('/'); 
            return;
        }

        const fetchFreelancerMetrics = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/freelancer/overview-stats`, {
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
                    throw new Error(result.message || "Failed to retrieve freelancer metrics.");
                }
            } catch (err) {
                console.error("❌ ==> [FREELANCER DASHBOARD FETCH ERROR]:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (currentUser?.email) {
            fetchFreelancerMetrics();
        }
    }, [currentUser, sessionLoading, router]);

    if (sessionLoading || loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400 font-mono text-sm tracking-wider animate-pulse">
                Syncing workspace earnings and proposals...
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

    // Extract stats with explicit null-ish coalescing safeguards
    const stats = dashboardData?.stats;
    const totalProposals = stats?.totalProposals ?? 0;
    const pendingProposals = stats?.pendingProposals ?? 0;
    const acceptedProposals = stats?.acceptedProposals ?? 0;
    const totalEarnings = stats?.totalEarnings ?? 0;

    const earningsChart = dashboardData?.earningsChart || [];
    const proposalStatusChart = dashboardData?.proposalStatusChart || { pending: 0, accepted: 0, rejected: 0 };
    const recentProposals = dashboardData?.recentProposals || [];
    const activeContracts = dashboardData?.activeContracts || [];

    // Pure CSS Graph Multipliers
    const graphTotalProposals = ((proposalStatusChart?.pending || 0) + (proposalStatusChart?.accepted || 0) + (proposalStatusChart?.rejected || 0)) || 1;
    const maxEarningsPoint = Math.max(...earningsChart.map(d => d.amount || 0), 1);

    return (
        <div className="bg-zinc-950 min-h-screen text-zinc-100 p-4 md:p-10 selection:bg-blue-500/30">
            <div className="max-w-7xl mx-auto flex flex-col gap-8">
                
                {/* 1. Header block */}
                <div className="border-b border-white/10 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                            <span className="text-blue-400">🚀</span> Freelancer Workspace
                        </h1>
                        <p className="text-zinc-400 text-xs mt-1 font-mono">
                            Metrics, bidding funnels, and payout ledger • Account: <span className="text-zinc-300 font-bold">{currentUser?.email}</span>
                        </p>
                    </div>
                    <div className="bg-zinc-900 border border-white/5 px-4 py-2 rounded-xl text-xs font-mono text-zinc-400">
                        Status: <span className="text-blue-400 animate-ping inline-block w-2 h-2 rounded-full bg-blue-400 mr-1" /> ACTIVE_SESSION
                    </div>
                </div>

                {/* 2. Top-tier metrics cards (Requested Core KPI Set) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition">
                        <div className="flex items-center justify-between text-zinc-400"><span className="text-xs font-bold uppercase tracking-wider">Total Proposals</span><FaPaperPlane className="text-zinc-500" /></div>
                        <h3 className="text-3xl font-black text-white mt-3 font-mono">{totalProposals}</h3>
                    </div>
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition">
                        <div className="flex items-center justify-between text-zinc-400"><span className="text-xs font-bold uppercase tracking-wider">Pending Proposals</span><FaHourglassHalf className="text-amber-400" /></div>
                        <h3 className="text-3xl font-black text-amber-400 mt-3 font-mono">{pendingProposals}</h3>
                    </div>
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition">
                        <div className="flex items-center justify-between text-zinc-400"><span className="text-xs font-bold uppercase tracking-wider">Accepted Proposals</span><FaCheckCircle className="text-blue-400" /></div>
                        <h3 className="text-3xl font-black text-blue-400 mt-3 font-mono">{acceptedProposals}</h3>
                    </div>
                    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5 hover:border-white/10 transition">
                        <div className="flex items-center justify-between text-zinc-400"><span className="text-xs font-bold uppercase tracking-wider">Total Earnings (USD)</span><FaDollarSign className="text-emerald-400" /></div>
                        <h3 className="text-3xl font-black text-emerald-400 mt-3 font-mono">${totalEarnings.toLocaleString()}</h3>
                    </div>
                </div>

                {/* 3. Graphical Trends & Proportions Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Monthly Earnings Column Graph */}
                    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 lg:col-span-2">
                        <h4 className="text-sm font-bold tracking-wider uppercase text-zinc-400 mb-6 flex items-center gap-2"><FaFileInvoiceDollar className="text-emerald-400" /> Earnings History Stream</h4>
                        <div className="h-44 flex items-end justify-between gap-2 pt-4 border-b border-white/10 px-2">
                            {earningsChart.map((point, index) => {
                                const percentage = (point.amount / maxEarningsPoint) * 100;
                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                                        <div className="text-[10px] text-emerald-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 px-1.5 py-0.5 rounded border border-white/10 mb-1">
                                            ${point.amount}
                                        </div>
                                        <div 
                                            style={{ height: `${Math.max(percentage, 8)}%` }} 
                                            className="w-full bg-gradient-to-t from-blue-600/50 to-emerald-400 rounded-t-sm transition-all duration-500 group-hover:brightness-125"
                                        />
                                        <span className="text-[10px] text-zinc-500 font-mono mt-1 uppercase select-none">{point.date}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Proposal Status Conversion Bar */}
                    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                        <div>
                            <h4 className="text-sm font-bold tracking-wider uppercase text-zinc-400 mb-6">Proposal Conversion Ratio</h4>
                            <div className="flex flex-col gap-4">
                                {['pending', 'accepted', 'rejected'].map((statusKey) => {
                                    const value = proposalStatusChart[statusKey] || 0;
                                    const pct = ((value / graphTotalProposals) * 100).toFixed(0);
                                    const colorMap = { pending: 'bg-amber-400', accepted: 'bg-blue-400', rejected: 'bg-rose-500/60' };
                                    return (
                                        <div key={statusKey} className="flex flex-col gap-1.5">
                                            <div className="flex justify-between text-xs font-mono uppercase text-zinc-400">
                                                <span>{statusKey} ({value})</span>
                                                <span>{pct}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                                                <div style={{ width: `${pct}%` }} className={`h-full ${colorMap[statusKey] || 'bg-zinc-400'}`} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="text-[11px] text-zinc-500 font-mono pt-4 border-t border-white/5 mt-4 text-center">
                            Bid Pitch Win-to-Loss Funnel Allocation
                        </div>
                    </div>
                </div>

                {/* 4. Row-By-Row Feeds (Giving full horizontal width to individual blocks) */}
                <div className="flex flex-col gap-6 w-full">
                    
                    {/* ROW FEED A: RECENT SUBMITTED PROPOSALS */}
                    <div className="bg-zinc-900/20 border border-white/5 rounded-2xl p-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Recent Applications Ledger</h4>
                            <span className="text-[10px] font-mono text-zinc-500">Active Bids</span>
                        </div>
                        <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] pr-1">
                            {recentProposals.length === 0 ? (
                                <p className="text-xs font-mono text-zinc-500 py-4 text-center">No submitted proposals found on record.</p>
                            ) : (
                                recentProposals.map((prop) => (
                                    <div 
                                        key={prop._id} 
                                        className="p-3 sm:p-4 bg-zinc-900/60 hover:bg-zinc-900/80 transition rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                                    >
                                        <div className="flex flex-col gap-0.5 max-w-xl">
                                            <p className="text-sm font-semibold text-white truncate">{prop.taskTitle || 'Contract Milestone Brief'}</p>
                                            <p className="text-[10px] text-zinc-500 font-mono truncate">Cover Note: "{prop.coverLetter || 'No cover letter appended.'}"</p>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-4 min-w-[150px]">
                                            <span className="text-sm font-bold text-emerald-400 font-mono">${prop.bidAmount}</span>
                                            <span className={`capitalize px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold ${
                                                prop.status === 'accepted' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                prop.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                'bg-zinc-800 text-zinc-400 border-white/5'
                                            }`}>
                                                {prop.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* ROW FEED B: ACTIVE ONGOING CONTRACTS */}
                    <div className="bg-zinc-900/20 border border-white/5 rounded-2xl p-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Active Retainer Contracts</h4>
                            <span className="text-[10px] font-mono text-zinc-500">In Progress Works</span>
                        </div>
                        <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] pr-1">
                            {activeContracts.length === 0 ? (
                                <p className="text-xs font-mono text-zinc-500 py-4 text-center">No open work orders assigned to this account.</p>
                            ) : (
                                activeContracts.map((contract) => (
                                    <div 
                                        key={contract._id} 
                                        className="p-3 sm:p-4 bg-zinc-900/60 hover:bg-zinc-900/80 transition rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                    >
                                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                            <p className="text-sm font-mono text-zinc-200 truncate">{contract.title}</p>
                                            <p className="text-[10px] text-zinc-500 font-mono truncate">Client Ref: {contract.client_email || 'Private Buyer'}</p>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-white/5 sm:border-0 pt-2 sm:pt-0">
                                            <div className="text-left sm:text-right">
                                                <span className="text-[9px] font-mono text-zinc-500 block uppercase">Project Budget</span>
                                                <span className="text-sm font-bold text-emerald-400 font-mono">${contract.budget}</span>
                                            </div>
                                            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-bold bg-teal-500/10 text-teal-400 border-teal-500/20 flex items-center gap-1">
                                                <FaTasks className="text-[9px]" /> Processing
                                            </span>
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