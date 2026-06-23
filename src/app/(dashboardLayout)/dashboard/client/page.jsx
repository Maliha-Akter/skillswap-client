"use client";
import React, { useState } from "react";

import { Card, Button } from "@heroui/react";
import { FaCrown, FaCalendarAlt, FaClock, FaDollarSign, FaClipboardList, FaPlus } from "react-icons/fa";
import PageHeader from "@/components/PageHeader";

const ClientOverviewPage = () => {
    // Simulated state for UI presentation
    const [isPremium, setIsPremium] = useState(false);

    // Dynamic stats object matching layout requirements
    const stats = {
        totalTasks: 0,
        openTasks: 0,
        inProgressTasks: 0,
        totalSpent: 0,
    };

    // Array logic to dynamically show recent tasks or the clean "No Tasks" placeholder image layout
    const recentTasks = []; 

    return (
        <div className="space-y-8 mt-6">
            {/* TOP HEADER SECTION */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <PageHeader
                    title="Client Dashboard"
                    description="Manage your tasks and find talented freelancers"
                />
                <Button 
                    className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/5 text-sm transition-all"
                    radius="lg"
                >
                    <FaPlus size={12} /> Post New Task
                </Button>
            </div>

            {/* 4-COLUMN CARD METRICS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Metric 1: Total Tasks */}
                <Card className="glass border-white/5 bg-zinc-900/40" radius="lg">
                    <div className="p-5 flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Total Tasks</span>
                            <h2 className="text-3xl font-extrabold text-white">{stats.totalTasks}</h2>
                            <p className="text-[10px] text-zinc-500">All tasks created</p>
                        </div>
                        <div className="p-3 bg-zinc-800/60 text-zinc-400 rounded-xl border border-white/5">
                            <FaClipboardList size={20} />
                        </div>
                    </div>
                </Card>

                {/* Metric 2: Open Tasks */}
                <Card className="glass border-white/5 bg-zinc-900/40" radius="lg">
                    <div className="p-5 flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Open Tasks</span>
                            <h2 className="text-3xl font-extrabold text-white">{stats.openTasks}</h2>
                            <p className="text-[10px] text-zinc-500">Awaiting proposals</p>
                        </div>
                        <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                            <FaClock size={20} />
                        </div>
                    </div>
                </Card>

                {/* Metric 3: In Progress */}
                <Card className="glass border-white/5 bg-zinc-900/40" radius="lg">
                    <div className="p-5 flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">In Progress</span>
                            <h2 className="text-3xl font-extrabold text-white">{stats.inProgressTasks}</h2>
                            <p className="text-[10px] text-zinc-500">Currently being worked on</p>
                        </div>
                        <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                            <FaCalendarAlt size={20} />
                        </div>
                    </div>
                </Card>

                {/* Metric 4: Total Spent */}
                <Card className="glass border-white/5 bg-zinc-900/40" radius="lg">
                    <div className="p-5 flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider">Total Spent</span>
                            <h2 className="text-3xl font-extrabold text-white">{`$${stats.totalSpent}`}</h2>
                            <p className="text-[10px] text-zinc-500">Total money paid</p>
                        </div>
                        <div className="p-3 bg-green-500/10 text-green-400 rounded-xl border border-green-500/20">
                            <FaDollarSign size={20} />
                        </div>
                    </div>
                </Card>
            </div>

            {/* PREMIUM ACCOUNT WORKFLOW CARD */}
            {!isPremium ? (
                <Card className="border border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 via-amber-600/5 to-transparent relative overflow-hidden" radius="lg">
                    <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 z-10">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <FaCrown className="text-yellow-400" /> Unlock Unlimited Task Postings
                            </h3>
                            <p className="text-zinc-400 text-xs max-w-xl leading-relaxed">
                                Standard client accounts are limited to posting <strong>3 tasks</strong>. Upgrade to our Premium tier for <strong>$49.00</strong> to host unlimited job listings.
                            </p>
                        </div>
                        <Button 
                            onClick={() => setIsPremium(true)}
                            className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-zinc-950 font-bold px-6 h-11 shadow-lg shadow-amber-500/10 transition-all active:scale-95"
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
                                <FaCrown className="text-green-400" /> Welcome to your Premium Dashboard
                            </h3>
                            <p className="text-zinc-400 text-xs mt-1">You can now post unlimited tasks across our platform framework.</p>
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

            {/* RECENT TASKS DATA BOARD / NO TASKS PLACEHOLDER */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-white tracking-tight">Recent Tasks</h3>

                {recentTasks.length === 0 ? (
                    <Card className="bg-zinc-900/20 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center p-16 min-h-[320px]">
                        <div className="p-4 bg-zinc-900 border border-white/5 text-zinc-400 rounded-2xl mb-4 shadow-xl">
                            <FaClipboardList size={28} />
                        </div>
                        <h4 className="text-white font-bold text-lg">No tasks yet</h4>
                        <p className="text-zinc-400 text-xs mt-1 mb-6 max-w-xs">
                            Post your first task to find talented freelancers across our community network.
                        </p>
                        <Button 
                            className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-6 py-2 rounded-xl text-xs transition-all shadow-md shadow-amber-500/5"
                            radius="lg"
                        >
                            Post a Task
                        </Button>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Task items map row layout would go here when data exists */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientOverviewPage;