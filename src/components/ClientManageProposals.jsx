// ClientManageProposals
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    FaUser, FaDollarSign, FaCalendarAlt, FaEnvelope,
    FaCheck, FaTimes, FaBriefcase, FaArrowLeft
} from 'react-icons/fa';
import { useSession, authClient } from '@/lib/auth-client'; // 🌟 Added authClient import

const ClientManageProposals = () => {
    const router = useRouter();
    const { data, status } = useSession();

    // Core data states
    const [proposals, setProposals] = useState([]);
    // Track paid task IDs retrieved directly from your payments table
    const [paidTaskIds, setPaidTaskIds] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (status === "loading") return;

        if (status === "unauthenticated") {
            setError("You must be logged in as a client to manage proposals.");
            setLoading(false);
            return;
        }

        if (!data || !data.user) return;

        const fetchDataAndCheckPayments = async () => {
            try {
                setLoading(true);
                const clientEmail = data.user.email;

                // 🌟 Fetch Token from authClient (Client-side)
                const { data: tokenData } = await authClient.token();
                const token = tokenData?.token;

                if (!token) {
                    throw new Error("Authentication token not found. Please log in again.");
                }

                // 1. Fetch proposals for jobs posted by this client
                const proposalsResponse = await fetch(`http://localhost:8080/client-proposals?clientEmail=${encodeURIComponent(clientEmail)}`, {
                    headers: {
                        'Authorization': `Bearer ${token}` // 🔒 Attached JWT Token
                    }
                });
                if (!proposalsResponse.ok) {
                    throw new Error("Failed to fetch incoming applications.");
                }
                const dataResults = await proposalsResponse.json();
                setProposals(dataResults);

                // 2. FETCH FROM PAYMENTS TABLE TO TRACK TRULY FINALIZED WORKFLOWS
                const paymentsResponse = await fetch(`http://localhost:8080/client-payments?clientEmail=${encodeURIComponent(clientEmail)}`, {
                    headers: {
                        'Authorization': `Bearer ${token}` // 🔒 Attached JWT Token
                    }
                });
                if (paymentsResponse.ok) {
                    const paymentsData = await paymentsResponse.json();
                    const paidIds = paymentsData.map(payment => String(payment.task_id || payment.taskId));
                    setPaidTaskIds(paidIds);
                }

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDataAndCheckPayments();
    }, [data, status]);

    const handleAcceptClick = async (proposal) => {
        const {
            _id: proposalId,
            task_id: taskId,
            freelancer_email,
            proposed_budget,
            estimated_days,
            cover_note,
            status: proposalStatus,
            submitted_at,
            taskTitle
        } = proposal;

        const clientEmail = data?.user?.email || proposal.client_email || "";

        try {
            // 🌟 Optional: Fetch token if Next.js local API route '/api/checkout_sessions' expects it
            const { data: tokenData } = await authClient.token();

            const response = await fetch('/api/checkout_sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenData?.token}` // 🔒 Passed downstream if needed
                },
                body: JSON.stringify({
                    taskId: taskId,
                    proposalId: proposalId,
                    amount: proposed_budget,
                    taskTitle: taskTitle || "Target Job Listing",
                    clientEmail: clientEmail 
                }),
            });

            const responseData = await response.json();

            if (responseData.clientSecret) {
                const queryParams = new URLSearchParams({
                    client_secret: responseData.clientSecret,
                    proposal_id: proposalId || '',
                    task_id: taskId || '',
                    amount: proposed_budget ? String(proposed_budget) : '',
                    task_title: taskTitle || "Target Job Listing",
                    freelancer_email: freelancer_email || '',
                    client_email: clientEmail,
                    estimated_days: estimated_days ? String(estimated_days) : '',
                    cover_note: cover_note || '',
                    status: proposalStatus || '',
                    submitted_at: submitted_at ? String(submitted_at) : ''
                });

                window.location.href = `/payment/checkout?${queryParams.toString()}`;
            } else {
                alert('Something went wrong. Could not initialize payment checkout.');
            }
        } catch (error) {
            console.error('Error handling checkout redirect:', error);
            alert('Network error. Please try again.');
        }
    };

    const handleRejectClick = async (proposalId) => {
        if (!confirm("Are you sure you want to decline this proposal?")) return;

        try {
            // 🌟 Get Token before making the PATCH mutation request
            const { data: tokenData } = await authClient.token();

            const response = await fetch(`http://localhost:8080/proposals/${proposalId}/reject`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenData?.token}` // 🔒 Secure backend patch endpoint
                }
            });

            if (response.ok) {
                setProposals(prevProposals => 
                    prevProposals.map(prop => 
                        prop._id === proposalId ? { ...prop, status: 'rejected' } : prop
                    )
                );
            } else {
                const resData = await response.json();
                alert(resData.message || 'Failed to reject the proposal. Please try again.');
            }
        } catch (error) {
            console.error('Error rejecting proposal:', error);
            alert('Network error occurred. Could not record rejection.');
        }
    };

    if (loading) return <div className="text-center py-32 bg-zinc-950 text-zinc-500 font-medium tracking-wide animate-pulse">Loading incoming proposals...</div>;
    if (error) return <div className="text-center py-32 bg-zinc-950 text-red-400 font-mono tracking-tight">⚠️ Error: {error}</div>;

    return (
        <div className="bg-zinc-950 min-h-screen text-zinc-100 p-4 md:p-12 selection:bg-teal-500/30 selection:text-teal-200">
            {/* Keeping your exact visual UI layers intact */}
            <div className="max-w-6xl mx-auto flex flex-col gap-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
                    <div className="flex flex-col gap-2">
                        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-200 text-xs font-semibold uppercase tracking-wider transition-colors group mb-1 self-start">
                            <FaArrowLeft className="transform group-hover:-translate-x-0.5 transition-transform" /> Dashboard Home
                        </button>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Manage Incoming Proposals</h1>
                        <p className="text-zinc-400 text-sm">Review and process pitches submitted by freelancers for your active listings.</p>
                    </div>
                    <div className="bg-zinc-900/60 border border-white/5 px-4 py-2.5 rounded-xl self-start sm:self-center">
                        <span className="text-xs text-zinc-500 font-medium">Total Submissions:</span> <span className="text-sm font-bold text-white">{proposals.length}</span>
                    </div>
                </div>

                {proposals.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-900/30 border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2">
                        <p className="text-zinc-500 text-sm italic">No freelancers have submitted proposals for your posts yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6">
                        {proposals.map((proposal) => {
                            const isTaskAlreadyPaid = paidTaskIds.includes(String(proposal.task_id || proposal.taskId));
                            const isAccepted = proposal.status === "accepted" || (isTaskAlreadyPaid && proposal.status !== "rejected");
                            const isRejected = proposal.status === "rejected";

                            return (
                                <div key={proposal._id} className="bg-zinc-900 border border-white/5 rounded-2xl p-6 flex flex-col lg:flex-row justify-between gap-6 shadow-xl relative overflow-hidden group hover:border-white/10 transition-colors">
                                    <div className="flex flex-col gap-4 flex-1">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-2xl font-semibold text-teal-400 flex items-center gap-1.5 font-mono">
                                                <FaBriefcase className="text-xs text-teal-500" />
                                                {proposal.taskTitle || "Target Job Listing"}
                                            </span>
                                            <h3 className="text-base font-bold text-white flex items-center gap-2 mt-1">
                                                <span className="text-xl text-zinc-500 font-mono font-normal">({proposal.freelancer_email})</span>
                                            </h3>
                                        </div>

                                        <div className="flex flex-wrap gap-4">
                                            <div className="bg-zinc-950/60 border border-white/5 px-3 py-1.5 rounded-xl flex items-center gap-2">
                                                <span className="text-xs text-zinc-500 font-medium">Bid Price:</span>
                                                <span className="text-sm font-bold text-emerald-400 flex items-center">
                                                    <FaDollarSign className="text-xs" />{Number(proposal.proposed_budget || 0).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="bg-zinc-950/60 border border-white/5 px-3 py-1.5 rounded-xl flex items-center gap-2">
                                                <span className="text-xs text-zinc-500 font-medium">Timeline:</span>
                                                <span className="text-sm font-semibold text-zinc-300 flex items-center gap-1">
                                                    <FaCalendarAlt className="text-xs text-zinc-500" />{proposal.estimated_days} Days
                                                </span>
                                            </div>
                                        </div>

                                        <div className="bg-zinc-950/40 border border-white/5 p-4 rounded-xl flex flex-col gap-1.5">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                                                <FaEnvelope className="text-zinc-600" /> Pitch Message Note
                                            </span>
                                            <p className="text-zinc-300 text-sm font-light leading-relaxed whitespace-pre-wrap italic">
                                                "{proposal.cover_note || "No message note submitted with this application."}"
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex sm:flex-row lg:flex-col justify-end lg:justify-center items-center gap-3 border-t lg:border-t-0 lg:border-l border-white/5 pt-4 lg:pt-0 lg:pl-6 min-w-[180px]">
                                        {isAccepted ? (
                                            <div className="w-full text-center py-2.5 px-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                                <FaCheck className="text-[10px]" /> Accepted
                                            </div>
                                        ) : (isRejected || isTaskAlreadyPaid) ? (
                                            <div className="w-full text-center py-2.5 px-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                                <FaTimes className="text-[10px]" /> Declined
                                            </div>
                                        ) : (
                                            <>
                                                <button onClick={() => handleAcceptClick(proposal)} className="w-full sm:w-auto lg:w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-zinc-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-teal-500/10">
                                                    <FaCheck className="text-[10px]" /> Accept Offer
                                                </button>
                                                <button onClick={() => handleRejectClick(proposal._id)} className="w-full sm:w-auto lg:w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/5 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors">
                                                    <FaTimes className="text-[10px]" /> Reject Offer
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientManageProposals;