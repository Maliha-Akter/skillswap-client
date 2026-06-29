"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Avatar, Button } from "@heroui/react";
import {
    FaDollarSign, FaCode, FaEnvelope, FaArrowLeft,
    FaCalendarAlt, FaStar
} from 'react-icons/fa';
// 🎯 Import from the new lib utility path
import { calculateAverageRating, renderStars } from '@/lib/review';

const PublicFreelancerDetails = () => {
    const { id } = useParams();
    const router = useRouter();

    const [freelancer, setFreelancer] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;

        const fetchFullProfileDetails = async () => {
            try {
                setLoading(true);

                // 1. Fetch Freelancer details
                const usersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/freelancers`);
                if (!usersResponse.ok) throw new Error("Could not load premium talent registry.");
                const freelancerList = await usersResponse.json();

                const targetFreelancer = freelancerList.find(f => f._id === id);
                if (!targetFreelancer) throw new Error("Freelancer profile record not found.");

                console.log("👤 [DIAGNOSTIC 1] Target Freelancer Loaded:", targetFreelancer);
                const targetEmail = targetFreelancer.email?.trim().toLowerCase();

                // 2. Fetch Proposals Summary
                const proposalsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/all-proposals-summary`);
                let matchingProposals = [];

                if (proposalsResponse.ok) {
                    const allProposals = await proposalsResponse.json();
                    console.log("📊 [DIAGNOSTIC 2] Total proposals fetched from DB:", allProposals.length);

                    // Robust case-insensitive filtering
                    matchingProposals = allProposals.filter(p => 
                        p.freelancer_email?.trim().toLowerCase() === targetEmail
                    );

                    console.log("🎯 [DIAGNOSTIC 3] Proposals matching this freelancer email:", matchingProposals.length);
                } else {
                    console.error("⚠️ [DIAGNOSTIC ERROR] Failed to fetch proposals summary. Status:", proposalsResponse.status);
                }

                // 3. Fetch Reviews
                try {
                    const reviewResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/freelancer-reviews?email=${encodeURIComponent(targetFreelancer.email)}`);

                    if (reviewResponse.ok) {
                        const freelancerReviews = await reviewResponse.json();
                        console.log("📦 [DIAGNOSTIC 4] Received Reviews Array:", freelancerReviews);
                        setReviews(freelancerReviews || []);
                    } else {
                        console.warn(`⚠️ [DIAGNOSTIC] Failed to pull reviews. Status: ${reviewResponse.status}`);
                    }
                } catch (reviewErr) {
                    console.error("⚠️ [DIAGNOSTIC] Review fetch error:", reviewErr.message);
                }

                setFreelancer(targetFreelancer);
                setProposals(matchingProposals);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFullProfileDetails();
    }, [id]);

    const averageRating = calculateAverageRating(reviews);

    if (loading) {
        return <div className="text-center py-40 bg-zinc-950 text-zinc-500 animate-pulse text-sm">Compiling technical asset profile metadata...</div>;
    }

    if (error || !freelancer) {
        return (
            <div className="text-center py-40 bg-zinc-950 text-zinc-400 flex flex-col items-center gap-4">
                <p className="text-red-400 font-medium">⚠️ profile error: {error || "Profile unavailable"}</p>
                <Button size="sm" variant="flat" className="bg-zinc-900 text-zinc-300" onClick={() => router.back()}>Return to Directory</Button>
            </div>
        );
    }

    return (
        <div className="bg-zinc-950 min-h-screen text-zinc-100 p-6 md:p-12">
            <div className="max-w-6xl mx-auto flex flex-col gap-8">

                <div>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-zinc-400 hover:text-teal-400 text-sm font-medium transition-colors group"
                    >
                        <FaArrowLeft className="text-xs group-hover:-translate-x-0.5 transition-transform" /> Back to Freelancers
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* Left Column Profile Summary */}
                    <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center shadow-xl">
                        <Avatar className="h-24 w-24 rounded-full border-3 border-teal-500/30 shadow-inner">
                            {freelancer.image && freelancer.image.startsWith("http") && (
                                <Avatar.Image src={freelancer.image} alt={freelancer.name} />
                            )}
                            <Avatar.Fallback className="bg-teal-500/10 text-teal-400 text-3xl font-black">
                                {freelancer.name?.charAt(0).toUpperCase()}
                            </Avatar.Fallback>
                        </Avatar>

                        <h1 className="text-2xl font-bold text-white mt-4 tracking-tight">{freelancer.name}</h1>
                        <span className="px-3 py-0.5 bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-semibold rounded-full uppercase tracking-wider mt-1.5">
                            {freelancer.role || "Freelancer"}
                        </span>

                        <div className="mt-4 flex flex-col items-center gap-1.5 bg-zinc-950/40 border border-white/5 w-full py-3 px-4 rounded-xl">
                            {renderStars(averageRating)}
                            <p className="text-xs font-mono font-bold text-zinc-300">
                                {averageRating > 0 ? `${averageRating} / 5.0 Rating` : "No Ratings Yet"}
                            </p>
                            <span className="text-[10px] text-zinc-500 font-mono">
                                (Based on {reviews.length} client evaluations)
                            </span>
                        </div>

                        <div className="w-full border-t border-white/5 my-6 pt-4 flex flex-col gap-3 text-left">
                            <div className="flex items-center gap-3 text-xs text-zinc-400">
                                <FaEnvelope className="text-zinc-600 text-sm shrink-0" />
                                <span className="truncate">{freelancer.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-zinc-400">
                                <FaCalendarAlt className="text-zinc-600 text-sm shrink-0" />
                                <span>Joined {new Date(freelancer.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>

                        {/* <Button className="w-full bg-teal-500 hover:bg-teal-600 text-zinc-950 font-bold transition-all rounded-xl shadow-lg shadow-teal-500/10">
                            Initiate Collaboration Proposal
                        </Button> */}
                    </div>

                    {/* Right Column Details */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 shadow-xl">
                            <h2 className="text-lg font-bold text-white mb-4">Professional Overview</h2>
                            <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap italic">
                                "{freelancer.bio || "This professional development asset has not populated their biography portfolio documentation text nodes yet."}"
                            </p>

                            <div className="mt-6 border-t border-white/5 pt-6">
                                <div className="bg-zinc-950 border border-white/5 p-4 rounded-xl flex flex-col max-w-xs">
                                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Quoted Standard Bill-rate</span>
                                    <span className="text-xl font-bold text-teal-400 flex items-center mt-1">
                                        <FaDollarSign className="text-sm" />{freelancer.hourlyRate || 0}<span className="text-xs text-zinc-500 font-normal ml-0.5">/hr</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Reviews Section */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-white tracking-tight">Client Endorsements History ({reviews.length})</h2>

                            {reviews.length > 0 ? (
                                reviews.map((rev) => (
                                    <div
                                        key={rev._id}
                                        className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-teal-500/5 to-transparent pointer-events-none rounded-bl-full" />

                                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                            <div className="flex items-center gap-2">
                                                <FaStar className="text-yellow-400 text-xs animate-pulse" />
                                                <h3 className="text-sm font-bold font-mono tracking-wide text-white">Client Feedback</h3>
                                            </div>
                                            {rev.createdAt && (
                                                <span className="text-[10px] font-mono text-zinc-500">
                                                    {new Date(rev.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className="text-[10px] px-2.5 py-0.5 font-mono font-bold rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                                                    Evaluation Rating: {rev.rating || 'N/A'}
                                                </span>
                                                <span className="text-xs font-mono text-zinc-500 truncate max-w-[300px]">
                                                    Contract owner: {rev.reviewerEmail}
                                                </span>
                                            </div>

                                            <div className="flex items-start gap-2.5 bg-zinc-950/50 p-4 rounded-xl border border-white/5">
                                                <p className="text-zinc-300 text-xs italic font-light leading-relaxed">
                                                    "{rev.comment || 'No textual description was appended to this performance ledger record.'}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="bg-zinc-900/40 border border-dashed border-white/5 rounded-2xl p-5 text-center">
                                    <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                                        🔒 No public client validation ledger registered for this user node.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Skills Stack */}
                        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 shadow-xl">
                            <h2 className="text-lg font-bold text-white mb-3">Verified Skills Stack</h2>
                            <div className="flex flex-wrap gap-2">
                                {freelancer.skills?.split(',').map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1.5 bg-zinc-950 border border-white/5 text-zinc-200 rounded-xl text-xs font-semibold flex items-center gap-2 hover:border-teal-500/20 transition-colors"
                                    >
                                        <FaCode className="text-teal-400 text-xs" /> {skill.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default PublicFreelancerDetails;