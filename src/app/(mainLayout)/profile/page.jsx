"use client";

import React from 'react';
import { Avatar, Button } from "@heroui/react";
import {
    FaDollarSign, FaCode, FaEnvelope, FaCalendarAlt,
    FaUserTie, FaBuilding, FaUserCheck, FaQuoteLeft, FaUserShield
} from 'react-icons/fa';
// Import your Better-Auth client instance here
import { authClient } from "@/lib/auth-client";
import Link from 'next/link';

const ProfilePage = () => {
    // Read the active session data directly using Better-Auth's hook
    const { data: session, isPending } = authClient.useSession();
    const user = session?.user;

    if (isPending) {
        return <div className="text-center py-40 bg-zinc-950 text-zinc-500 animate-pulse text-sm">Loading session hooks...</div>;
    }

    if (!user) {
        return (
            <div className="text-center py-40 bg-zinc-950 text-zinc-400">
                <p className="text-red-400">⚠️ No active session found. Please log in.</p>
            </div>
        );
    }

    // Checking existence of dynamic profile attributes
    const isClient = user.role?.toLowerCase() === 'client';
    const isAdmin = user.role?.toLowerCase() === 'admin';
    const hasSkills = user.skills && user.skills.trim() !== "";
    const hasHourlyRate = user.hourlyRate && Number(user.hourlyRate) > 0;

    // Both Clients and Admins should use the centered single-column layout
    const useCenteredLayout = isClient || isAdmin;

    return (
        <div className="bg-zinc-950 min-h-screen text-zinc-100 p-6 md:p-12 flex items-center justify-center">
            <div className="w-full max-w-4xl mx-auto">

                {/* Dynamically adjust structural grid layout if the profile is a client or an admin */}
                <div className={useCenteredLayout ? "max-w-md mx-auto" : "grid grid-cols-1 md:grid-cols-3 gap-8 items-start"}>

                    {/* IDENTITY CARD (Centered if client/admin, column item if freelancer) */}
                    <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8 flex flex-col items-center text-center shadow-xl w-full">
                        <div className="relative">
                            <Avatar className="h-28 w-28 rounded-full border-3 border-teal-500/30 shadow-inner">
                                {user.image && user.image.startsWith("http") && (
                                    <Avatar.Image src={user.image} alt={user.name} />
                                )}
                                <Avatar.Fallback className="bg-teal-500/10 text-teal-400 text-4xl font-black">
                                    {user.name?.charAt(0).toUpperCase() || "?"}
                                </Avatar.Fallback>
                            </Avatar>
                            {user.emailVerified && (
                                <div className="absolute bottom-1 right-1 bg-teal-500 text-zinc-950 p-1.5 rounded-full text-xs" title="Verified Account">
                                    <FaUserCheck />
                                </div>
                            )}
                        </div>

                        <h1 className="text-2xl font-bold text-white mt-5 tracking-tight truncate w-full">{user.name}</h1>

                        {/* Dynamic Role Designation Badge */}
                        <span className={`px-4 py-1 mt-3 text-xs font-semibold rounded-full uppercase tracking-wider border flex items-center gap-1.5 ${isAdmin
                            ? "bg-red-500/10 text-red-400 border-red-500/20"
                            : isClient
                                ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                                : "bg-teal-500/10 text-teal-400 border-teal-500/20"
                            }`}>
                            {isAdmin ? (
                                <>
                                    <FaUserShield className="text-[11px]" />
                                    <span>Admin</span>
                                </>
                            ) : isClient ? (
                                <>
                                    <FaBuilding className="text-[11px]" />
                                    <span>Client</span>
                                </>
                            ) : (
                                <>
                                    <FaUserTie className="text-[11px]" />
                                    <span>Freelancer</span>
                                </>
                            )}
                        </span>

                        <div className="w-full border-t border-white/5 mt-8 pt-6 flex flex-col gap-4 text-left text-sm text-zinc-400">
                            <div className="flex items-center gap-3">
                                <FaEnvelope className="text-zinc-500 text-base shrink-0" />
                                <span className="truncate w-full">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <FaCalendarAlt className="text-zinc-500 text-base shrink-0" />
                                <span>Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>

                        {user?.role?.toLowerCase() === "freelancer" && (
                            <Link href={`/dashboard/${user?.role?.toLowerCase()}/profile`} passHref legacyBehavior>
                                <Button
                                    size="lg"
                                    variant="flat"
                                    className="w-full mt-8 bg-zinc-950 border border-white/5 text-zinc-200 rounded-xl hover:border-white/10 transition-colors font-medium"
                                >
                                    Account Management
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* FREELANCER WORKSPACE DETAILS (Hidden completely if user is a client or an admin) */}
                    {!useCenteredLayout && (
                        <div className="md:col-span-2 flex flex-col gap-6">

                            {/* Biography Block */}
                            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 shadow-xl">
                                <h2 className="text-base font-bold text-zinc-400 mb-3 flex items-center gap-2">
                                    <FaQuoteLeft className="text-xs text-teal-500" /> Professional Summary
                                </h2>
                                <p className="text-zinc-200 text-sm leading-relaxed italic">
                                    {user.bio ? `"${user.bio}"` : "No summary overview has been specified yet on this profile registry."}
                                </p>
                            </div>

                            {/* Hourly Rate Box */}
                            {hasHourlyRate && (
                                <div className="bg-zinc-900 border border-white/5 p-5 rounded-2xl flex flex-col justify-between shadow-xl">
                                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Service Billing Rate</span>
                                    <span className="text-3xl font-black text-teal-400 mt-1 flex items-center">
                                        <FaDollarSign className="text-xl" />{user.hourlyRate}
                                        <span className="text-xs text-zinc-500 font-normal ml-1">/ hr</span>
                                    </span>
                                </div>
                            )}

                            {/* Technical Skills Stack */}
                            {hasSkills && (
                                <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 shadow-xl">
                                    <h2 className="text-sm font-bold text-zinc-400 mb-3">Core Capabilities Stack</h2>
                                    <div className="flex flex-wrap gap-1.5">
                                        {user.skills.split(',').map((skill, i) => (
                                            <span key={i} className="px-2.5 py-1 bg-zinc-950 border border-white/5 text-zinc-300 rounded-lg text-xs font-medium flex items-center gap-1.5">
                                                <FaCode className="text-teal-400 text-[10px]" /> {skill.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    )}

                </div>

            </div>
        </div>
    );
};

export default ProfilePage;
