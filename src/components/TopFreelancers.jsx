"use client";

import React, { useState, useEffect } from 'react';
import { Avatar, Card, Spinner } from "@heroui/react";
import { FaCode, FaEnvelope } from 'react-icons/fa';
// 🎯 Import directly from your local frontend utility file
import { calculateAverageRating, renderStars } from '@/lib/review';

const TopFreelancers = () => {
    const [topFreelancers, setTopFreelancers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAndRankTopFreelancers = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log("🚀 [TOP FREELANCERS] Starting to fetch directory profiles...");

                // 1. Fetch all freelancers
                const usersResponse = await fetch("http://localhost:8080/freelancers");
                if (!usersResponse.ok) throw new Error("Failed to pull freelancer account database records.");
                const freelancerList = await usersResponse.json();
                console.log(`📦 [TOP FREELANCERS] Loaded ${freelancerList.length} total profiles for calculation processing.`);

                // 2. Concurrently fetch and calculate rating matrix arrays per user
                const computedFreelancers = await Promise.all(
                    freelancerList.map(async (freelancer) => {
                        let matchingReviews = [];
                        try {
                            // Query the specific reviews endpoint using email query strings
                            const reviewResponse = await fetch(`http://localhost:8080/api/freelancer-reviews?email=${encodeURIComponent(freelancer.email)}`);
                            if (reviewResponse.ok) {
                                matchingReviews = await reviewResponse.json();
                            }
                        } catch (err) {
                            console.warn(`⚠️ [TOP FREELANCERS] Could not fetch reviews for ${freelancer.email}:`, err.message);
                        }

                        // Use your custom calculation utility rule
                        const averageScore = calculateAverageRating(matchingReviews);

                        console.log(`📊 [TOP FREELANCERS DATA] Freelancer: ${freelancer.name} | Reviews Found: ${matchingReviews.length} | Computed Avg: ${averageScore}`);

                        return {
                            ...freelancer,
                            avgRating: averageScore
                        };
                    })
                );

                // 3. Sort freelancers descending by rating and grab only the top 3
                const sortedTopThree = computedFreelancers
                    .sort((a, b) => b.avgRating - a.avgRating)
                    .slice(0, 3);

                console.log("🏆 [TOP FREELANCERS WINNERS] Filtered down to top 3 highest rated:", sortedTopThree);
                setTopFreelancers(sortedTopThree);

            } catch (err) {
                console.error("❌ [TOP FREELANCERS FATAL ERROR]", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAndRankTopFreelancers();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 bg-zinc-950">
                <Spinner color="teal" label="Calculating and filtering premium talent matrix..." labelcolor="teal" />
            </div>
        );
    }

    if (error) {
        return <div className="text-center py-20 bg-zinc-950 text-red-400">⚠️ Error loading top freelancers: {error}</div>;
    }

    if (topFreelancers.length === 0) return null;

    return (
        <section className="bg-zinc-950 py-16 px-6 md:px-12 border-t border-white/5">
            <div className="max-w-6xl mx-auto space-y-10">
                
                {/* Section Title */}
                <div className="text-center md:text-left space-y-2">
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">
                        Top Rated Elite Talent
                    </h2>
                    <p className="text-zinc-400 text-sm max-w-md">
                        The highest performing technical experts on our platform sorted by strict rating evaluations.
                    </p>
                </div>

                {/* 3-Card Grid System */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topFreelancers.map((freelancer) => (
                        <Card 
                            key={freelancer._id}
                            className="bg-zinc-900 border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-teal-500/30 transition-all duration-300"
                        >
                            {/* Accent Ambient Glow */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-teal-500/5 to-transparent pointer-events-none rounded-bl-full group-hover:from-teal-500/10 transition-all duration-300" />

                            <div className="space-y-5">
                                {/* Header Core Profiling Row */}
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-14 w-14 rounded-full border-2 border-teal-500/20 shrink-0">
                                        {freelancer.image && freelancer.image.startsWith("http") && (
                                            <Avatar.Image src={freelancer.image} alt={freelancer.name} />
                                        )}
                                        <Avatar.Fallback className="bg-teal-500/10 text-teal-400 font-bold">
                                            {freelancer.name?.charAt(0).toUpperCase() || "?"}
                                        </Avatar.Fallback>
                                    </Avatar>
                                    
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-white truncate group-hover:text-teal-400 transition-colors">
                                            {freelancer.name}
                                        </h3>
                                        <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5 truncate">
                                            <FaEnvelope className="text-zinc-600 shrink-0" /> {freelancer.email}
                                        </p>
                                    </div>
                                </div>

                                {/* Custom Rating Star Presentation Component Block */}
                                <div className="bg-zinc-950/60 border border-white/5 px-4 py-3 rounded-xl flex flex-col items-center justify-center text-center">
                                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">Platform Performance</span>
                                    {renderStars(freelancer.avgRating, "text-xs")}
                                </div>

                                {/* Skills Catalog Array Row */}
                                <div className="space-y-2">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Core Competencies</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {freelancer.skills ? (
                                            freelancer.skills.split(',').slice(0, 3).map((skill, index) => (
                                                <span 
                                                    key={index}
                                                    className="px-2.5 py-1 bg-zinc-950 border border-white/5 text-zinc-300 rounded-lg text-xs font-medium flex items-center gap-1"
                                                >
                                                    <FaCode className="text-[10px] text-teal-500/70" /> {skill.trim()}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-zinc-600 italic">No technical tags listed</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TopFreelancers;