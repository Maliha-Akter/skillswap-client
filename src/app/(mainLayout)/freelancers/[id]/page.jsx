"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Avatar, Button } from "@heroui/react";
import { FaDollarSign, FaBriefcase, FaCode, FaEnvelope, FaArrowLeft, FaCalendarAlt, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const FreelancerProfileDetails = () => {
    const { id } = useParams();
    const router = useRouter();
    
    const [freelancer, setFreelancer] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;

        const fetchFullProfileDetails = async () => {
            try {
                setLoading(true);

                // 1. Fetch all freelancers to match target ID
                const usersResponse = await fetch("http://localhost:8080/freelancers");
                if (!usersResponse.ok) throw new Error("Could not load premium talent registry.");
                const freelancerList = await usersResponse.json();
                
                const targetFreelancer = freelancerList.find(f => f._id === id);
                if (!targetFreelancer) throw new Error("Freelancer profile record not found.");

                // 2. Fetch proposal history logs
                const proposalsResponse = await fetch("http://localhost:8080/all-proposals-summary");
                let matchingProposals = [];
                if (proposalsResponse.ok) {
                    const allProposals = await proposalsResponse.json();
                    matchingProposals = allProposals.filter(p => p.freelancer_email === targetFreelancer.email);
                }

                // 3. Apply conditional logic for performance history display
                const hasPending = matchingProposals.some(p => p.status === "pending");
                const completedCount = matchingProposals.filter(p => p.status === "completed").length;
                
                targetFreelancer.jobsDoneText = (!hasPending && matchingProposals.length > 0) 
                    ? `${completedCount} Jobs Completed` 
                    : "0 Jobs Completed";

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
                
                {/* Action Back Button Row */}
                <div>
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-zinc-400 hover:text-teal-400 text-sm font-medium transition-colors group"
                    >
                        <FaArrowLeft className="text-xs group-hover:-translate-x-0.5 transition-transform" /> Back to Freelancers
                    </button>
                </div>

                {/* Main Dashboard Workspace Layout Split */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    
                    {/* Left Panel Sidebar Layout Card */}
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

                        {/* Direct Hire / Message Button */}
                        <Button className="w-full bg-teal-500 hover:bg-teal-600 text-zinc-950 font-bold transition-all rounded-xl shadow-lg shadow-teal-500/10">
                            Initiate Collaboration Proposal
                        </Button>
                    </div>

                    {/* Right Panel Main Data Workspace Context */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        
                        {/* Summary Bio & Core Stats Block */}
                        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 shadow-xl">
                            <h2 className="text-lg font-bold text-white mb-4">Professional Overview</h2>
                            <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap italic">
                                "{freelancer.bio || "This professional development asset has not populated their biography portfolio documentation text nodes yet."}"
                            </p>

                            {/* Core Financial Metric Footprint Display Grid */}
                            <div className="grid grid-cols-2 gap-4 mt-6 border-t border-white/5 pt-6">
                                <div className="bg-zinc-950 border border-white/5 p-4 rounded-xl flex flex-col">
                                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Quoted Standard Bill-rate</span>
                                    <span className="text-xl font-bold text-teal-400 flex items-center mt-1">
                                        <FaDollarSign className="text-sm" />{freelancer.hourlyRate || 0}<span className="text-xs text-zinc-500 font-normal ml-0.5">/hr</span>
                                    </span>
                                </div>
                                <div className="bg-zinc-950 border border-white/5 p-4 rounded-xl flex flex-col">
                                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Escrow Performance Value</span>
                                    <span className="text-xl font-bold text-white flex items-center gap-2 mt-1">
                                        <FaBriefcase className="text-sm text-zinc-500" /> {freelancer.jobsDoneText}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Specialized Technical Capabilities */}
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
                                {!freelancer.skills && <span className="text-zinc-600 text-xs italic">No specific languages mapped.</span>}
                            </div>
                        </div>

                        {/* Recent Pitch Activity Summary Panel */}
                        {/* <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 shadow-xl">
                            <h2 className="text-lg font-bold text-white mb-4">Live Bid Activity Logs ({proposals.length})</h2>
                            <div className="flex flex-col gap-3">
                                {proposals.slice(0, 3).map((proposal) => (
                                    <div key={proposal._id} className="bg-zinc-950 border border-white/5 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                                        <div>
                                            <h4 className="text-sm font-bold text-white truncate max-w-xs">{proposal.taskTitle || "Target Project Node"}</h4>
                                            <p className="text-xs text-zinc-500 mt-0.5">Bid: <span className="text-zinc-300 font-medium">${proposal.proposed_budget}</span> over {proposal.estimated_days} days</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 self-start md:self-auto text-xs px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider">
                                            {proposal.status === 'pending' ? (
                                                <span className="text-amber-400 bg-amber-400/5 px-2 py-0.5 rounded border border-amber-400/10 flex items-center gap-1"><FaExclamationCircle /> Evaluation Pending</span>
                                            ) : proposal.status === 'completed' ? (
                                                <span className="text-teal-400 bg-teal-400/5 px-2 py-0.5 rounded border border-teal-400/10 flex items-center gap-1"><FaCheckCircle /> Completed</span>
                                            ) : (
                                                <span className="text-zinc-400 bg-zinc-400/5 px-2 py-0.5 rounded border border-zinc-400/10">{proposal.status}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {proposals.length === 0 && (
                                    <p className="text-zinc-600 text-xs italic py-4 text-center border border-dashed border-white/5 rounded-xl">This professional hasn't broadcasted workspace proposal matrices to tasks yet.</p>
                                )}
                            </div>
                        </div> */}

                    </div>
                </div>

            </div>
        </div>
    );
};

export default FreelancerProfileDetails;