"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation'; 
import { Avatar, Spinner } from "@heroui/react";
import { FaCode, FaEnvelope, FaArrowRight } from 'react-icons/fa';
// 🎯 Import directly from your local frontend utility file
import { calculateAverageRating, renderStars } from '@/lib/review';
import { useSession } from '@/lib/auth-client';

// --- 3D PARALLAX TILT & REFRACTIVE GLOSS CARD WRAPPER ---
function TiltCard({ children, onClick }) { // 🛠️ Added onClick prop
    const cardRef = useRef(null);
    const glassRef = useRef(null);

    const handleMouseMove = (e) => {
        const card = cardRef.current;
        const glass = glassRef.current;
        if (!card || !glass) return;

        const rect = card.getBoundingClientRect();
        const pointerX = e.clientX;
        const pointerY = e.clientY;

        const halfWidth = rect.width / 2;
        const halfHeight = rect.height / 2;
        const cardCenterX = rect.left + halfWidth;
        const cardCenterY = rect.top + halfHeight;

        const deltaX = pointerX - cardCenterX;
        const deltaY = pointerY - cardCenterY;

        const rx = deltaY / halfHeight;
        const ry = deltaX / halfWidth;

        const distanceToCenter = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
        const maxDistance = Math.max(halfWidth, halfHeight);
        
        const dynamicDegree = (distanceToCenter / maxDistance) * 10; 

        card.style.transform = `perspective(1000px) rotate3d(${-rx}, ${ry}, 0, ${dynamicDegree}deg)`;

        const glassX = -ry * 80;
        const glassY = -rx * 80;
        glass.style.transform = `translate(${glassX}%, ${glassY}%) scale(2.4)`;
        glass.style.opacity = (distanceToCenter / maxDistance) * 0.6; 
    };

    const handleMouseLeave = () => {
        const card = cardRef.current;
        const glass = glassRef.current;
        if (!card || !glass) return;

        card.style.transform = "perspective(1000px) rotate3d(0, 0, 0, 0deg)";
        glass.style.transform = "translate(0%, 0%) scale(2.4)";
        glass.style.opacity = "0";
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={onClick} // 🛠️ Executing route handler on container click
            className="group relative flex flex-col justify-between bg-zinc-900 border border-white/10 rounded-2xl shadow-xl transition-all duration-500 ease-out preserve-3d will-change-transform hover:shadow-teal-500/10 w-[360px] shrink-0 overflow-hidden cursor-pointer"
            style={{ transformStyle: "preserve-3d" }}
        >
            {/* ⚡️ NEON BORDER BEAM MOTION EFFECT */}
            <div className="absolute inset-0 rounded-2xl border border-teal-500/40 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30" />
            {/* 💡 REFRACTIVE HIGH-GLOSS REFLECTION OVERLAY */}
            <div 
                ref={glassRef}
                className="absolute inset-0 pointer-events-none rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.22)_0%,rgba(45,212,191,0.05)_50%,transparent_100%)] opacity-0 mix-blend-screen transition-opacity duration-300 ease-out z-20"
                style={{ width: '100%', height: '100%', top: 0, left: 0 }}
            />
            {/* Accent Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-teal-500/5 to-transparent pointer-events-none rounded-bl-full group-hover:from-teal-500/10 transition-all duration-300 z-10" />
            
            <div className="relative z-10 flex flex-col justify-between h-full min-h-[340px]">
                {children}
            </div>
        </div>
    );
}

// --- MAIN TALENT MODULE SECTION ---
const TopFreelancers = () => {
    const router = useRouter();
    const currentPath = usePathname(); // 🔑 Tracking current location path
    const { data: session } = useSession(); // 🔑 Checking session presence
    const [topFreelancers, setTopFreelancers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAndRankTopFreelancers = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log("🚀 [TOP FREELANCERS] Starting to fetch directory profiles...");

                const usersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/freelancers`);
                if (!usersResponse.ok) throw new Error("Failed to pull freelancer account database records.");
                const freelancerList = await usersResponse.json();
                console.log(`📦 [TOP FREELANCERS] Loaded ${freelancerList.length} total profiles for calculation processing.`);

                const computedFreelancers = await Promise.all(
                    freelancerList.map(async (freelancer) => {
                        let matchingReviews = [];
                        try {
                            const reviewResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/freelancer-reviews?email=${encodeURIComponent(freelancer.email)}`);
                            if (reviewResponse.ok) {
                                matchingReviews = await reviewResponse.json();
                            }
                        } catch (err) {
                            console.warn(`⚠️ [TOP FREELANCERS] Could not fetch reviews for ${freelancer.email}:`, err.message);
                        }

                        const averageScore = calculateAverageRating(matchingReviews);
                        console.log(`📊 [TOP FREELANCERS DATA] Freelancer: ${freelancer.name} | Reviews Found: ${matchingReviews.length} | Computed Avg: ${averageScore}`);

                        return {
                            ...freelancer,
                            avgRating: averageScore
                        };
                    })
                );

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

    // 🛡️ Safe Routing Interceptor Function with dynamic redirect parameter
    const handleNavigation = (targetUrl) => {
        if (session) {
            router.push(targetUrl);
        } else {
            // 🔑 Encodes current path location to redirect the user back effortlessly after login
            const encodedCallback = encodeURIComponent(currentPath);
            router.push(`/auth/signin?callbackUrl=${encodedCallback}`);
        }
    };

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

    // Triple duplication array configuration to power fluid infinite loop mechanics seamlessly
    const marqueeFreelancers = [...topFreelancers, ...topFreelancers, ...topFreelancers];

    return (
        <section className="bg-zinc-950 py-16 border-t border-white/5 relative overflow-hidden group-container">
            <div className="max-w-6xl mx-auto px-6 md:px-12 space-y-10">
                {/* Section Title */}
                <div className="text-center md:text-left space-y-2">
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">
                        Top Rated Elite Talent
                    </h2>
                    <p className="text-zinc-400 text-sm max-w-md">
                        The highest performing technical experts on our platform sorted by strict rating evaluations.
                    </p>
                </div>
            </div>

            {/* INFINITE MARQUEE SLIDING INTERACTIVE RIG TRACK */}
            <div className="w-full mt-10 relative overflow-hidden">
                <div className="flex gap-6 w-max px-6 animate-marquee py-4">
                    {marqueeFreelancers.map((freelancer, index) => {
                        const fallBackInitial = freelancer.name?.charAt(0).toUpperCase() || "?";
                        
                        return (
                            <div key={`${freelancer._id}-${index}`} className="h-full">
                                {/* 🛠️ Hooked up authentication wrapper to individual profiles */}
                                <TiltCard onClick={() => handleNavigation(`/freelancers/${freelancer._id}`)}>
                                    
                                    {/* Core Upper Card Body */}
                                    <div className="p-6 pb-0 space-y-5 select-none pointer-events-none">
                                        {/* Header Core Profiling Row */}
                                        <div className="flex items-start gap-4">
                                            <Avatar className="h-14 w-14 rounded-full border-2 border-teal-500/20 shrink-0">
                                                {freelancer.image && freelancer.image.startsWith("http") && (
                                                    <Avatar.Image src={freelancer.image} alt={freelancer.name} />
                                                )}
                                                <Avatar.Fallback className="bg-teal-500/10 text-teal-400 font-bold">
                                                    {fallBackInitial}
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
                                                    freelancer.skills.split(',').slice(0, 3).map((skill, sIdx) => (
                                                        <span 
                                                            key={sIdx}
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

                                    {/* 🛠 Interactive Action Bottom Row (See Details Button) */}
                                    <div className="mt-5 border-t border-white/5 bg-zinc-950/20 p-4 px-6 flex items-center justify-between select-none pointer-events-none transition-all duration-500 group-hover:bg-gradient-to-r group-hover:from-teal-500/5 group-hover:to-cyan-500/5">
                                        <span className="text-sm font-bold text-zinc-400 group-hover:text-teal-400 transition-colors duration-300 tracking-wide">
                                            See Details
                                        </span>
                                        
                                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-zinc-950 shadow-md transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 group-hover:shadow-teal-500/20">
                                            <FaArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-0.5" />
                                        </div>
                                    </div>
                                </TiltCard>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default TopFreelancers;