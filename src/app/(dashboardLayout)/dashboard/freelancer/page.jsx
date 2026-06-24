"use client";
import React, { useState } from "react";
import { Card, Button } from "@heroui/react";
import { FaCrown, FaCalendarAlt, FaClock, FaDollarSign, FaClipboardList, FaSearch } from "react-icons/fa";
import PageHeader from "@/components/PageHeader";

const FreelancerOverviewPage = () => {
    // Simulated state for UI presentation
    const [isPremium, setIsPremium] = useState(false);

    // Dynamic stats object matching freelancer requirements
    const stats = {
        totalProposals: 0,
        pendingProposals: 0,
        acceptedProposals: 0,
        totalEarnings: 0,
    };

    // Array logic to dynamically show recent submissions or the clean "No Proposals" placeholder layout
    const recentProposals = []; 

    return (
        <div className="space-y-8 mt-6">
            {/* TOP HEADER SECTION */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <PageHeader
                    title="Freelancer Dashboard"
                    description="Track your active proposals, monitor earnings, and find open tasks"
                />
                <Button 
                    className="bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-teal-500/5 text-sm transition-all"
                    radius="lg"
                >
                    <FaSearch size={12} /> Explore Tasks
                </Button>
            </div>

            {/* 4-COLUMN CARD METRICS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Metric 1: Total Proposals */}
                <Card className="glass border-white/5 bg-zinc-900/40" radius="lg">
                    <div className="p-5 flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Total Proposals</span>
                            <h2 className="text-3xl font-extrabold text-white">{stats.totalProposals}</h2>
                            <p className="text-[10px] text-zinc-500">All submitted applications</p>
                        </div>
                        <div className="p-3 bg-zinc-800/60 text-zinc-400 rounded-xl border border-white/5">
                            <FaClipboardList size={20} />
                        </div>
                    </div>
                </Card>

                {/* Metric 2: Pending Proposals */}
                <Card className="glass border-white/5 bg-zinc-900/40" radius="lg">
                    <div className="p-5 flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Pending Proposals</span>
                            <h2 className="text-3xl font-extrabold text-white">{stats.pendingProposals}</h2>
                            <p className="text-[10px] text-zinc-500">Awaiting client review</p>
                        </div>
                        <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                            <FaClock size={20} />
                        </div>
                    </div>
                </Card>

                {/* Metric 3: Accepted Proposals */}
                <Card className="glass border-white/5 bg-zinc-900/40" radius="lg">
                    <div className="p-5 flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Accepted Proposals</span>
                            <h2 className="text-3xl font-extrabold text-white">{stats.acceptedProposals}</h2>
                            <p className="text-[10px] text-zinc-500">Active milestones or contracts</p>
                        </div>
                        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                            <FaCalendarAlt size={20} />
                        </div>
                    </div>
                </Card>

                {/* Metric 4: Total Earnings */}
                <Card className="glass border-white/5 bg-zinc-900/40" radius="lg">
                    <div className="p-5 flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Total Earnings (USD)</span>
                            <h2 className="text-3xl font-extrabold text-white">{`$${stats.totalEarnings.toFixed(2)}`}</h2>
                            <p className="text-[10px] text-zinc-500">Total revenue generated</p>
                        </div>
                        <div className="p-3 bg-green-500/10 text-green-400 rounded-xl border border-green-500/20">
                            <FaDollarSign size={20} />
                        </div>
                    </div>
                </Card>
            </div>

            {/* PREMIUM ACCOUNT WORKFLOW CARD */}
            {!isPremium ? (
                <Card className="border border-teal-500/20 bg-gradient-to-r from-teal-500/5 via-emerald-600/5 to-transparent relative overflow-hidden" radius="lg">
                    <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 z-10">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <FaCrown className="text-teal-400" /> Upgrade to Freelancer Pro
                            </h3>
                            <p className="text-zinc-400 text-xs max-w-xl leading-relaxed">
                                Standard freelancer profiles are limited to <strong>10 active proposals</strong> per month. Upgrade to Pro for <strong>$19.00/mo</strong> for unlimited submissions, custom profile badges, and higher search exposure.
                            </p>
                        </div>
                        <Button 
                            onClick={() => setIsPremium(true)}
                            className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-zinc-950 font-bold px-6 h-11 shadow-lg shadow-teal-500/10 transition-all active:scale-95"
                            radius="xl"
                        >
                            Upgrade Now
                        </Button>
                    </div>
                </Card>
            ) : (
                <Card className="border border-green-500/20 bg-gradient-to-r from-green-500/5 via-teal-600/5 to-transparent relative overflow-hidden" radius="lg">
                    <div className="p-6 z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <FaCrown className="text-green-400" /> Welcome to your Freelancer Pro Dashboard
                            </h3>
                            <p className="text-zinc-400 text-xs mt-1">You enjoy unlimited layout applications and priority processing privileges.</p>
                        </div>
                        <Button 
                            onClick={() => setIsPremium(false)} 
                            variant="light" 
                            className="text-zinc-500 hover:text-zinc-400 text-xs min-w-0 p-0 h-auto underline bg-transparent"
                        >
                            Simulate Standard Account
                        </Button>
                    </div>
                </Card>
            )}

            {/* RECENT PROPOSALS DATA BOARD / NO PROPOSALS PLACEHOLDER */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-white tracking-tight">Recent Proposals</h3>

                {recentProposals.length === 0 ? (
                    <Card className="bg-zinc-900/20 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center p-16 min-h-[320px]">
                        <div className="p-4 bg-zinc-900 border border-white/5 text-zinc-400 rounded-2xl mb-4 shadow-xl">
                            <FaClipboardList size={28} />
                        </div>
                        <h4 className="text-white font-bold text-lg">No proposals submitted yet</h4>
                        <p className="text-zinc-400 text-xs mt-1 mb-6 max-w-xs">
                            Find available tasks in your niche and pitch your services to clients across our community network.
                        </p>
                        <Button 
                            className="bg-teal-500 hover:bg-teal-400 text-zinc-950 font-bold px-6 py-2 rounded-xl text-xs transition-all shadow-md shadow-teal-500/5"
                            radius="lg"
                        >
                            Find Work
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Proposal collection items mapping loop row layout would go here when data exists */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FreelancerOverviewPage;