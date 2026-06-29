"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import {
    FaArrowLeft, FaHourglassHalf, FaCheckCircle,
    FaTimesCircle, FaDollarSign, FaCalendarAlt, FaExternalLinkAlt
} from 'react-icons/fa';
import { authClient, useSession } from '@/lib/auth-client';

const MyProposalsPage = () => {
    const router = useRouter();

    const { data, status } = useSession();

    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            setError("You must be logged in to view your proposals.");
            setLoading(false);
            return;
        }

        if (!data || !data.user) {
            return;
        }

        const fetchMyProposals = async () => {
            try {
                setLoading(true);
                const freelancerEmail = data.user.email;

                if (!freelancerEmail) {
                    throw new Error("User email not found in session.");
                }

                const { data: tokenData } = await authClient.token();
                const sessionToken = tokenData?.token;

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/proposals?freelancerEmail=${encodeURIComponent(freelancerEmail)}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${sessionToken}`
                    }
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch your applications.");
                }

                const dataResults = await response.json();
                setProposals(dataResults);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMyProposals();
    }, [data, status]);

    const getStatusStyles = (statusText) => {
        switch (statusText?.toLowerCase()) {
            case 'accepted':
                return {
                    bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                    icon: <FaCheckCircle className="text-[10px]" />
                };
            case 'rejected':
                return {
                    bg: 'bg-red-500/10 border-red-500/20 text-red-400',
                    icon: <FaTimesCircle className="text-[10px]" />
                };
            default:
                return {
                    bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                    icon: <FaHourglassHalf className="text-[10px]" />
                };
        }
    };

    if (loading) return <div className="text-center py-32 bg-zinc-950 text-zinc-500 font-medium tracking-wide animate-pulse p-4">Loading your proposals...</div>;
    if (error) return <div className="text-center py-32 bg-zinc-950 text-red-400 font-mono tracking-tight p-4">⚠️ Error: {error}</div>;

    return (
        <div className="bg-zinc-950 min-h-screen text-zinc-100 p-4 sm:p-6 md:p-8 lg:p-12 selection:bg-teal-500/30 selection:text-teal-200">
            <div className="max-w-6xl mx-auto flex flex-col gap-6 md:gap-8">

                {/* Header Actions & Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
                    <div className="flex flex-col gap-1.5 min-w-0">
                        <button
                            onClick={() => router.push('/tasks')}
                            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-200 text-xs font-semibold uppercase tracking-wider transition-colors group mb-1 self-start"
                        >
                            <FaArrowLeft className="transform group-hover:-translate-x-0.5 transition-transform" /> Browse More Tasks
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                            My Proposals
                        </h1>
                        <p className="text-zinc-400 text-xs sm:text-sm truncate">
                            A historical record of your submitted project offers under <span className="font-mono text-teal-400 text-xs">{data?.user?.email}</span>.
                        </p>
                    </div>

                    <div className="bg-zinc-900/60 border border-white/5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl self-start sm:self-center shrink-0">
                        <span className="text-xs text-zinc-500 font-medium">Total Applications:</span>{' '}
                        <span className="text-sm font-bold text-white">{proposals.length}</span>
                    </div>
                </div>

                {/* Main Data Layout */}
                {proposals.length === 0 ? (
                    <div className="text-center py-16 md:py-20 bg-zinc-900/30 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3 p-4">
                        <p className="text-zinc-500 text-sm italic">You haven't submitted any proposals yet.</p>
                        <button
                            onClick={() => router.push('/tasks')}
                            className="text-xs bg-teal-500 text-black font-bold px-4 py-2 rounded-xl hover:bg-teal-400 transition-colors"
                        >
                            Find Work
                        </button>
                    </div>
                ) : (
                    <div className="w-full">
                        
                        {/* 📱 1. Card Grid Layout (Targeted: Mobile and Tablet breaks) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                            {proposals.map((proposal) => {
                                const statusMeta = getStatusStyles(proposal.status);
                                return (
                                    <div 
                                        key={`card-${proposal._id || proposal.id}`} 
                                        className="bg-zinc-900 border border-white/5 rounded-xl p-4 flex flex-col gap-3.5 shadow-md hover:border-zinc-800 transition-all"
                                    >
                                        <div className="flex justify-between items-start gap-3 border-b border-white/5 pb-2.5">
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-bold text-white truncate group-hover:text-teal-400">
                                                    {proposal.taskTitle || "Untitled Task Framework"}
                                                </h4>
                                                {proposal.cover_note && (
                                                    <p className="text-xs text-zinc-500 truncate italic mt-0.5">
                                                        "{proposal.cover_note}"
                                                    </p>
                                                )}
                                            </div>
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 border rounded-md text-[9px] font-bold uppercase tracking-wider shrink-0 ${statusMeta.bg}`}>
                                                {statusMeta.icon}
                                                {proposal.status || "Pending"}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-2 text-xs font-mono">
                                            <div className="flex items-center gap-1 text-teal-400 font-bold">
                                                <FaDollarSign className="text-[10px]" />
                                                <span>{Number(proposal.proposed_budget || 0).toLocaleString()}</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
                                                <FaCalendarAlt className="text-[10px]" />
                                                <span>
                                                    {proposal.submitted_at
                                                        ? new Date(proposal.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                        : 'Recent'}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => router.push(`/dashboard/freelancer/proposals/${proposal._id}`)}
                                            className="w-full flex items-center justify-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-zinc-950/60 py-2 border border-white/5 rounded-lg transition-colors mt-1"
                                        >
                                            View Details <FaExternalLinkAlt className="text-[9px]" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* 🖥️ 2. Clean Spreadsheet View (Targeted: Native Laptop & Desktop monitors) */}
                        <div className="hidden lg:block bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse table-auto">
                                    <thead>
                                        <tr className="bg-zinc-950/60 border-b border-white/5 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                                            <th className="py-4 px-6 lg:max-w-[220px] xl:max-w-[none]">Task Title</th>
                                            <th className="py-4 px-6 text-right w-[140px]">Budget Bid</th>
                                            <th className="py-4 px-6 text-center w-[160px]">Date Sent</th>
                                            <th className="py-4 px-6 text-center w-[150px]">Status</th>
                                            <th className="py-4 px-6 text-center w-[130px]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-sm font-normal text-zinc-300">
                                        {proposals.map((proposal) => {
                                            const statusMeta = getStatusStyles(proposal.status);
                                            return (
                                                <tr key={`row-${proposal._id || proposal.id}`} className="hover:bg-white/[0.02] transition-colors group">
                                                    
                                                    {/* Title Spec */}
                                                    <td className="py-5 px-6 lg:max-w-[220px] xl:max-w-[340px]">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="font-semibold text-white group-hover:text-teal-400 transition-colors truncate block">
                                                                {proposal.taskTitle || "Untitled Task Framework"}
                                                            </span>
                                                            {proposal.cover_note && (
                                                                <span className="text-xs text-zinc-500 truncate block italic font-light">
                                                                    "{proposal.cover_note}"
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Budget Bid */}
                                                    <td className="py-5 px-6 text-right tabular-nums whitespace-nowrap">
                                                        <span className="inline-flex items-center gap-0.5 text-teal-400 font-bold">
                                                            <FaDollarSign className="text-[10px]" />
                                                            {Number(proposal.proposed_budget || 0).toLocaleString()}
                                                        </span>
                                                    </td>

                                                    {/* Date Sent */}
                                                    <td className="py-5 px-6 text-center text-zinc-400 font-mono text-xs tabular-nums whitespace-nowrap">
                                                        <span className="inline-flex items-center gap-1.5 justify-center">
                                                            <FaCalendarAlt className="text-[10px] text-zinc-600" />
                                                            {proposal.submitted_at
                                                                ? new Date(proposal.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                                : 'Recent'}
                                                        </span>
                                                    </td>

                                                    {/* Status Badges */}
                                                    <td className="py-5 px-6 text-center whitespace-nowrap">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-md text-[10px] font-bold uppercase tracking-wider ${statusMeta.bg}`}>
                                                            {statusMeta.icon}
                                                            {proposal.status || "Pending"}
                                                        </span>
                                                    </td>

                                                    {/* Dynamic Details Actions Link */}
                                                    <td className="py-5 px-6 text-center whitespace-nowrap">
                                                        <button
                                                            onClick={() => router.push(`/dashboard/freelancer/proposals/${proposal._id}`)}
                                                            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white bg-zinc-950 px-3 py-1.5 border border-white/5 rounded-lg transition-colors"
                                                            title="View Submitted Proposal Details"
                                                        >
                                                            Details <FaExternalLinkAlt className="text-[9px]" />
                                                        </button>
                                                    </td>

                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default MyProposalsPage;