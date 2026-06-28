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


    // Destructuring 'data' directly from your auth client hook
    const { data, status } = useSession();

    // UI and data states
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // 1. Wait if authentication is explicitly processing
        if (status === "loading") return;

        if (status === "unauthenticated") {
            setError("You must be logged in to view your proposals.");
            setLoading(false);
            return;
        }

        // 2. Prevent fetching if data payload or the user object inside isn't resolved yet
        if (!data || !data.user) {
            return;
        }

        const fetchMyProposals = async () => {
            try {
                setLoading(true);

                // Extracting email from the correct level based on your console logs
                const freelancerEmail = data.user.email;

                if (!freelancerEmail) {
                    throw new Error("User email not found in session.");
                }

                // Hit port 5000 to reach your Express MongoDB server pipeline
                // const response = await fetch(`http://localhost:8080/proposals?freelancerEmail=${encodeURIComponent(freelancerEmail)}`);
                const { data: tokenData } = await authClient.token();
                const sessionToken = tokenData?.token;

                // Fetch the unique proposal from your backend pipeline
                const response = await fetch(`http://localhost:8080/proposals?freelancerEmail=${encodeURIComponent(freelancerEmail)}`
                , {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        // 🌟 Injected verified bearer authentication token layout
                        "Authorization": `Bearer ${sessionToken}`
                    }
                }
            );
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
    }, [data, status]); // Tracking the structured 'data' object wrapper changes safelys

    // Helper utility to style dynamic badge indicators based on application state
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
            default: // pending
                return {
                    bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                    icon: <FaHourglassHalf className="text-[10px] animate-spin-slow" />
                };
        }
    };

    if (loading) return <div className="text-center py-32 bg-zinc-950 text-zinc-500 font-medium tracking-wide animate-pulse">Loading your proposals...</div>;
    if (error) return <div className="text-center py-32 bg-zinc-950 text-red-400 font-mono tracking-tight">⚠️ Error: {error}</div>;

    return (
        <div className="bg-zinc-950 min-h-screen text-zinc-100 p-4 md:p-12 selection:bg-teal-500/30 selection:text-teal-200">
            <div className="max-w-6xl mx-auto flex flex-col gap-8">

                {/* Header Actions & Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => router.push('/tasks')}
                            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-200 text-xs font-semibold uppercase tracking-wider transition-colors group mb-1 self-start"
                        >
                            <FaArrowLeft className="transform group-hover:-translate-x-0.5 transition-transform" /> Browse More Tasks
                        </button>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                            My Proposals
                        </h1>
                        <p className="text-zinc-400 text-sm">
                            A historical record of your submitted project offers under <span className="font-mono text-teal-400 text-xs">{data?.user?.email}</span>.
                        </p>
                    </div>

                    <div className="bg-zinc-900/60 border border-white/5 px-4 py-2.5 rounded-xl self-start sm:self-center">
                        <span className="text-xs text-zinc-500 font-medium">Total Applications:</span>{' '}
                        <span className="text-sm font-bold text-white">{proposals.length}</span>
                    </div>
                </div>

                {/* Main Data Layout */}
                {proposals.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-900/30 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-3">
                        <p className="text-zinc-500 text-sm italic">You haven't submitted any proposals yet.</p>
                        <button
                            onClick={() => router.push('/tasks')}
                            className="text-xs bg-teal-500 text-black font-bold px-4 py-2 rounded-xl hover:bg-teal-400 transition-colors"
                        >
                            Find Work
                        </button>
                    </div>
                ) : (
                    <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-zinc-950/60 border-b border-white/5 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                                        <th className="py-4 px-6">Task Title</th>
                                        <th className="py-4 px-6 text-right">Budget Bid</th>
                                        <th className="py-4 px-6 text-center">Date Sent</th>
                                        <th className="py-4 px-6 text-center">Status</th>
                                        <th className="py-4 px-6 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm font-normal text-zinc-300">
                                    {proposals.map((proposal) => {
                                        const statusMeta = getStatusStyles(proposal.status);
                                        return (
                                            <tr key={proposal._id || proposal.id} className="hover:bg-white/[0.02] transition-colors group">

                                                {/* Task Title & Details */}
                                                <td className="py-5 px-6 max-w-sm">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-semibold text-white group-hover:text-teal-400 transition-colors line-clamp-1">
                                                            {/* Render the aggregated task title property smoothly */}
                                                            {proposal.taskTitle || "Untitled Task Framework"}
                                                        </span>
                                                        {proposal.cover_note && (
                                                            <span className="text-xs text-zinc-500 line-clamp-1 italic font-light">
                                                                "{proposal.cover_note}"
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Budget Bid */}
                                                <td className="py-5 px-6 text-right tabular-nums">
                                                    <span className="inline-flex items-center gap-0.5 text-teal-400 font-bold">
                                                        <FaDollarSign className="text-[10px]" />
                                                        {/* CHANGED: proposal.proposedBudget -> proposal.proposed_budget */}
                                                        {Number(proposal.proposed_budget || 0).toLocaleString()}
                                                    </span>
                                                </td>

                                                {/* Date Sent */}
                                                <td className="py-5 px-6 text-center text-zinc-400 font-mono text-xs tabular-nums">
                                                    <span className="inline-flex items-center gap-1.5 justify-center">
                                                        <FaCalendarAlt className="text-[10px] text-zinc-600" />
                                                        {/* CHANGED: proposal.createdAt -> proposal.submitted_at */}
                                                        {proposal.submitted_at
                                                            ? new Date(proposal.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                            : 'Recent'}
                                                    </span>
                                                </td>

                                                {/* Status Badges */}
                                                <td className="py-5 px-6 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-md text-[10px] font-bold uppercase tracking-wider ${statusMeta.bg}`}>
                                                        {statusMeta.icon}
                                                        {proposal.status || "Pending"}
                                                    </span>
                                                </td>

                                                {/* Actions */}
                                                <td className="py-5 px-6 text-center">
                                                    <button
                                                        onClick={() => router.push(`/dashboard/freelancer/proposals/${proposal._id}`)}
                                                        className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white bg-zinc-950 px-3 py-1.5 border border-white/5 rounded-lg transition-colors"
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
                )}
            </div>
        </div>
    );
};

export default MyProposalsPage;