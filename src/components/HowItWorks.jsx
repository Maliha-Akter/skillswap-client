"use client";

import React from 'react';
import { Card } from "@heroui/react";
import { FaEdit, FaFileInvoiceDollar, FaUserCheck } from 'react-icons/fa';

const HowItWorks = () => {
    const steps = [
        {
            id: 1,
            title: "Post a Task",
            description: "Clearly define your project requirements, timeline, and budget. It takes less than two minutes to get your task live in our marketplace.",
            icon: <FaEdit className="text-xl md:text-2xl text-teal-400 animate-pulse" />,
            badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/20"
        },
        {
            id: 2,
            title: "Get Proposals",
            description: "Receive competitive proposals from vetted, top-rated freelancers within minutes. Compare profiles, star ratings, portfolios, and reviews side-by-side.",
            icon: <FaFileInvoiceDollar className="text-xl md:text-2xl text-amber-400" />,
            badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20"
        },
        {
            id: 3,
            title: "Hire and Pay",
            description: "Select the absolute best expert for your criteria, formalize the contract, and release payments safely only when milestones are completely hit.",
            icon: <FaUserCheck className="text-xl md:text-2xl text-indigo-400" />,
            badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
        }
    ];

    return (
        <section className="bg-zinc-950 py-20 px-6 md:px-12 border-t border-b border-white/5 overflow-hidden">
            <div className="max-w-6xl mx-auto space-y-16 relative">
                
                {/* Subtle Ambient Background Glows */}
                <div className="absolute -top-20 -left-20 w-72 h-72 bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

                {/* Section Header */}
                <div className="text-center space-y-3 max-w-xl mx-auto">
                    <span className="text-xs uppercase font-extrabold tracking-widest text-teal-500 bg-teal-500/5 px-3 py-1 rounded-full border border-teal-500/10">
                        Workflow Process
                    </span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                        How It Works
                    </h2>
                    <p className="text-zinc-400 text-sm md:text-base">
                        Get your tasks completed efficiently with our simple, transparent 3-step guide designed for flawless collaboration.
                    </p>
                </div>

                {/* Steps Grid Interface */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative z-10">
                    {steps.map((step, idx) => (
                        <div key={step.id} className="relative group">
                            
                            {/* Visual Linking Vector Connectors (Hidden on Mobile) */}
                            {idx < 2 && (
                                <div className="hidden md:block absolute top-12 left-[calc(100%-16px)] w-[calc(100%-32px)] h-[2px] bg-gradient-to-r from-zinc-800 to-transparent z-0 pointer-events-none" />
                            )}

                            <Card className="bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col justify-between h-full shadow-2xl relative overflow-hidden group-hover:border-teal-500/20 group-hover:scale-[1.01] transition-all duration-300 z-10">
                                
                                {/* Top Radial Card Highlight Accent */}
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-zinc-700/50 to-transparent group-hover:via-teal-500/40 transition-all duration-500" />

                                <div className="space-y-6">
                                    {/* Icon & Badge Matrix Index Row */}
                                    <div className="flex items-center justify-between">
                                        <div className={`p-3.5 bg-zinc-950 border border-white/5 rounded-xl shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                                            {step.icon}
                                        </div>
                                        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${step.badgeColor}`}>
                                            Step 0{step.id}
                                        </span>
                                    </div>

                                    {/* Text Content Block */}
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-teal-400 transition-colors">
                                            {step.title}
                                        </h3>
                                        <p className="text-zinc-400 text-sm leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Step Sub-indicator Anchor */}
                                <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between text-zinc-600 group-hover:text-zinc-400 transition-colors">
                                    <span className="text-[10px] uppercase font-bold tracking-wider font-mono">
                                        {idx === 0 && "Initiate task"}
                                        {idx === 1 && "Evaluate talent"}
                                        {idx === 2 && "Secure milestone"}
                                    </span>
                                    <span className="text-xs font-bold font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-teal-400">
                                        &rarr;
                                    </span>
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;