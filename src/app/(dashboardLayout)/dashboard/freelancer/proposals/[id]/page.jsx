"use client";
import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
    FaArrowLeft, FaDollarSign, FaCalendarAlt, FaClock, 
    FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaBriefcase, FaEnvelope 
} from 'react-icons/fa';
import { authClient } from '@/lib/auth-client';

const ProposalDetails = ({ params: paramsPromise }) => {
    // Safely unwrap params in Next.js App Router Client Components
    const params = use(paramsPromise);
    const { id } = params;
    const router = useRouter();

    // Core component states
    const [proposal, setProposal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;

        const fetchProposalDetails = async () => {
            try {
                setLoading(true);
                // Fetch the unique proposal from your backend pipeline
                const { data: tokenData } = await authClient.token();
                const sessionToken = tokenData?.token;

                // Fetch the unique proposal from your backend pipeline
                const response = await fetch(`http://localhost:8080/proposals/${id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        // 🌟 Injected verified bearer authentication token layout
                        "Authorization": `Bearer ${sessionToken}` 
                    }
                }
            );
                
                if (!response.ok) {
                    throw new Error("Failed to load proposal records.");
                }

                const data = await response.json();
                setProposal(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProposalDetails();
    }, [id]);

    // Helper utility to resolve dynamic style themes based on progress state
    const getStatusStyles = (statusText) => {
        switch (statusText?.toLowerCase()) {
            case 'accepted':
                return {
                    bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
                    text: 'text-emerald-400',
                    icon: <FaCheckCircle className="text-sm" />
                };
            case 'rejected':
                return {
                    bg: 'bg-red-500/10 border-red-500/20 text-red-400',
                    text: 'text-red-400',
                    icon: <FaTimesCircle className="text-sm" />
                };
            default: // pending
                return {
                    bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
                    text: 'text-amber-400',
                    icon: <FaHourglassHalf className="text-sm animate-spin-slow" />
                };
        }
    };

    if (loading) return <div className="text-center py-32 bg-zinc-950 text-zinc-500 font-medium tracking-wide animate-pulse">Loading application data structure...</div>;
    if (error) return <div className="text-center py-32 bg-zinc-950 text-red-400 font-mono tracking-tight">⚠️ Error: {error}</div>;
    if (!proposal) return <div className="text-center py-32 bg-zinc-950 text-zinc-500">Proposal record not found.</div>;

    const statusMeta = getStatusStyles(proposal.status);

    return (
        <div className="bg-zinc-950 min-h-screen text-zinc-100 p-4 md:p-12 selection:bg-teal-500/30 selection:text-teal-200">
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                
                {/* Back Link Control */}
                <button 
                    onClick={() => router.back()} 
                    className="flex items-center gap-2 text-zinc-500 hover:text-zinc-200 text-xs font-semibold uppercase tracking-wider transition-colors group self-start"
                >
                    <FaArrowLeft className="transform group-hover:-translate-x-0.5 transition-transform" /> Back to My Proposals
                </button>

                {/* Main Detailed Identity Display Card */}
                <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-xl relative overflow-hidden">
                    
                    {/* Top Meta Details Row */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/5 pb-6">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] bg-zinc-800 text-zinc-400 border border-white/5 px-2.5 py-1 rounded-md max-w-fit font-mono tracking-wider uppercase">
                                PROPOSAL ID: {proposal._id}
                            </span>
                            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2.5">
                                <FaBriefcase className="text-teal-500 text-lg flex-shrink-0" />
                                {proposal.taskTitle || "Untitled Task Context"}
                                
                            </h1>
                        </div>

                        {/* Configurable Status Badge */}
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs font-bold uppercase tracking-wider self-start ${statusMeta.bg}`}>
                            {statusMeta.icon}
                            {proposal.status || "Pending"}
                        </div>
                    </div>

                    {/* Metric Cards Grid Layout */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-zinc-950/50 border border-white/5 p-4 rounded-xl flex flex-col gap-1">
                            <span className="text-xs text-zinc-500 font-medium">Proposed Bid</span>
                            <span className="text-xl font-black text-teal-400 flex items-center gap-0.5">
                                <FaDollarSign className="text-sm text-teal-500" />
                                {Number(proposal.proposed_budget || 0).toLocaleString()}
                            </span>
                        </div>
                        <div className="bg-zinc-950/50 border border-white/5 p-4 rounded-xl flex flex-col gap-1">
                            <span className="text-xs text-zinc-500 font-medium">Estimated Timeline</span>
                            <span className="text-xl font-bold text-white flex items-center gap-2">
                                <FaClock className="text-xs text-zinc-500" />
                                {proposal.estimated_days || 0} Days
                            </span>
                        </div>
                        <div className="bg-zinc-950/50 border border-white/5 p-4 rounded-xl flex flex-col gap-1">
                            <span className="text-xs text-zinc-500 font-medium">Submission Date</span>
                            <span className="text-sm font-medium text-zinc-400 flex items-center gap-2 h-full">
                                <FaCalendarAlt className="text-xs text-zinc-600" />
                                {proposal.submitted_at 
                                    ? new Date(proposal.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
                                    : 'Recent'}
                            </span>
                        </div>
                    </div>

                    {/* Pitch Description/Cover Note Field */}
                    <div className="flex flex-col gap-3 bg-zinc-950/40 border border-white/5 p-5 rounded-xl">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                            <FaEnvelope className="text-zinc-600 text-xs" /> Covered Offer Details
                        </h3>
                        <p className="text-zinc-300 text-sm leading-relaxed font-light whitespace-pre-wrap italic">
                            "{proposal.cover_note || "No cover note description added to this offer submission."}"
                        </p>
                    </div>

                    {/* Global Actions Block */}
                    <div className="flex justify-end gap-3 border-t border-white/5 pt-6 mt-2">
                        <button 
                            onClick={() => router.push(`/tasks/${proposal.task_id}`)}
                            className="px-4 py-2 text-xs font-bold bg-zinc-800 text-zinc-200 border border-white/5 rounded-xl hover:bg-zinc-700 transition-colors"
                        >
                            View Original Workspace Job
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProposalDetails;