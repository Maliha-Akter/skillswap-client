"use client";

import React, { useState, useEffect } from 'react';
import { Avatar } from "@heroui/react";
import { FaDollarSign, FaBriefcase, FaCode, FaEnvelope } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

// Inside your BrowseFreelancerPage component, instantiate the router:


const BrowseFreelancerPage = () => {
    const [freelancers, setFreelancers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const router = useRouter();
    useEffect(() => {
        const fetchFreelancerDirectory = async () => {
            try {
                setLoading(true);

                // 1. Fetch filtered freelancer list directly from backend
                const usersResponse = await fetch("http://localhost:8080/freelancers");
                if (!usersResponse.ok) throw new Error("Failed to fetch freelancer profiles.");
                const freelancerList = await usersResponse.json();

                // 2. Fetch proposal array data to parse logic
                const proposalsResponse = await fetch("http://localhost:8080/all-proposals-summary");
                if (!proposalsResponse.ok) throw new Error("Failed to fetch proposal references.");
                const allProposals = await proposalsResponse.json();

                // 3. Map status condition algorithms to card displays
                const computedFreelancers = freelancerList.map(freelancer => {
                    // Match using your exact database key formatting: freelancer_email
                    const matchingProposals = allProposals.filter(p => p.freelancer_email === freelancer.email);

                    // Check if any submitted proposal has status === "pending"
                    const hasPending = matchingProposals.some(p => p.status === "pending");

                    let jobsDoneText = "0 Jobs Done";

                    if (!hasPending && matchingProposals.length > 0) {
                        // Otherwise, sum up all completed jobs
                        const completedCount = matchingProposals.filter(p => p.status === "completed").length;
                        jobsDoneText = `${completedCount} Jobs Done`;
                    }

                    return {
                        ...freelancer,
                        jobsDone: jobsDoneText
                    };
                });

                setFreelancers(computedFreelancers);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFreelancerDirectory();
    }, []);

    if (loading) {
        return <div className="text-center py-20 bg-zinc-950 text-zinc-500 animate-pulse">Syncing user directory matching keys...</div>;
    }

    if (error) {
        return <div className="text-center py-20 bg-zinc-950 text-red-400">⚠️ Error: {error}</div>;
    }

    return (
        <div className="bg-zinc-950 min-h-screen text-zinc-100 p-6 md:p-10">
            <div className="max-w-7xl mx-auto flex flex-col gap-8">

                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Browse Talent</h1>
                    <p className="text-zinc-400 text-sm mt-1">Find expert freelancers ready to collaborate on your tasks.</p>
                </div>

                {/* Grid Deck */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {freelancers.map((freelancer) => (
                        <div
                            key={freelancer._id}
                            onClick={() => router.push(`/freelancers/${freelancer._id}`)} // Redirects dynamically
                            className="bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-teal-500/30 hover:scale-[1.01] cursor-pointer transition-all duration-300 group"
                        >
                            <div>
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-14 w-14 rounded-full border-2 border-teal-500/20">
                                        {/* Only try to render the image if it exists and looks like a valid URL link */}
                                        {freelancer.image && freelancer.image.startsWith("http") && (
                                            <Avatar.Image src={freelancer.image} alt={freelancer.name} />
                                        )}
                                        <Avatar.Fallback className="bg-teal-500/10 text-teal-400 font-bold">
                                            {freelancer.name?.charAt(0).toUpperCase() || "?"}
                                        </Avatar.Fallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-lg font-bold text-white truncate group-hover:text-teal-400 transition-colors">
                                            {freelancer.name}
                                        </h2>
                                        <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5 truncate">
                                            <FaEnvelope className="text-zinc-600 shrink-0" /> {freelancer.email}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-zinc-400 text-sm mt-4 line-clamp-2 italic min-h-[40px]">
                                    "{freelancer.bio || "Hard working professional building premium software paths."}"
                                </p>

                                <div className="flex flex-wrap gap-1.5 mt-4">
                                    {freelancer.skills?.split(',').map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-2.5 py-1 bg-zinc-950 border border-white/5 text-zinc-300 rounded-lg text-xs font-medium flex items-center gap-1"
                                        >
                                            <FaCode className="text-teal-500/70 text-[10px]" /> {skill.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-white/5 pt-4 mt-6 flex items-center justify-between gap-2">
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Hourly Rate</span>
                                    <span className="text-teal-400 font-bold text-base flex items-center">
                                        <FaDollarSign className="text-xs" />{freelancer.hourlyRate || 0}<span className="text-xs text-zinc-500 font-normal">/hr</span>
                                    </span>
                                </div>

                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Performance</span>
                                    <span className="text-zinc-300 text-sm font-semibold flex items-center gap-1.5 mt-0.5">
                                        <FaBriefcase className="text-zinc-500 text-xs" /> {freelancer.jobsDone}
                                    </span>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>

                {freelancers.length === 0 && (
                    <div className="text-center py-16 text-zinc-600 border border-dashed border-white/5 rounded-2xl">
                        No active technical freelancers found matching records.
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrowseFreelancerPage;