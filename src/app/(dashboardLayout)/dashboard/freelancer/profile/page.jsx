"use client";

import React, { useState, useEffect } from 'react';
import { Input, Button, Card, Avatar } from "@heroui/react";
import {
    FaUser, FaCode, FaDollarSign, FaFileAlt,
    FaCheckCircle, FaExclamationTriangle, FaBriefcase, FaIdCard
} from 'react-icons/fa';
import { authClient } from "@/lib/auth-client";

const EditProfilePage = () => {
    const { data: session, isPending } = authClient.useSession();

    const [name, setName] = useState("");
    const [skills, setSkills] = useState("");
    const [hourlyRate, setHourlyRate] = useState("");
    const [bio, setBio] = useState("");

    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    useEffect(() => {
        if (session?.user) {
            setName(session.user.name || "");
            setSkills(session.user.skills || "");
            setHourlyRate(session.user.hourlyRate ? String(session.user.hourlyRate) : "");
            setBio(session.user.bio || "");
        }
    }, [session]);

    if (isPending) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-500 gap-3">
                <div className="w-8 h-8 border-2 border-t-teal-500 border-zinc-800 rounded-full animate-spin" />
                <span className="text-xs font-medium tracking-wider uppercase text-zinc-400">Syncing Profile Metrics...</span>
            </div>
        );
    }

    const user = session?.user;
    const isFreelancer = user?.role?.toLowerCase() === 'freelancer';

    if (!user || !isFreelancer) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
                <Card className="bg-zinc-900/50 backdrop-blur-md border border-red-500/10 max-w-md w-full p-6 shadow-2xl">
                    <div className="flex flex-col items-center text-center gap-4 p-2">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                            <FaExclamationTriangle className="text-red-400 text-xl" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg tracking-tight">Access Prohibited</h3>
                            <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
                                This control terminal is reserved exclusively for validated <strong>Freelancer</strong> configurations.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    // const handleUpdateProfile = async (e) => {
    //     e.preventDefault();
    //     setIsSaving(true);
    //     setMessage({ type: "", text: "" });

    //     try {
    //         const { error } = await authClient.user.update({
    //             name,
    //             skills,
    //             hourlyRate: hourlyRate ? Number(hourlyRate) : 0,
    //             bio
    //         });

    //         if (error) {
    //             setMessage({ type: "error", text: error.message || "Failed to update professional registry details." });
    //         } else {
    //             setMessage({ type: "success", text: "Professional parameters synchronized successfully!" });
    //         }
    //     } catch (err) {
    //         console.error(err);
    //         setMessage({ type: "error", text: "An unexpected network sequence fault occurred." });
    //     } finally {
    //         setIsSaving(false);
    //     }
    // };
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: "", text: "" });

        try {
            // CHANGED: Swapped authClient.user.update to authClient.updateUser
            const { error } = await authClient.updateUser({
                name: name,
                skills: skills,
                hourlyRate: hourlyRate ? Number(hourlyRate) : 0,
                bio: bio
            });

            if (error) {
                setMessage({ type: "error", text: error.message || "Failed to update professional registry details." });
            } else {
                setMessage({ type: "success", text: "Professional parameters synchronized successfully!" });
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "An unexpected network sequence fault occurred." });
        } finally {
            setIsSaving(false);
        }
    };
    return (
        <div className="bg-zinc-950 min-h-screen text-zinc-100 py-10 px-4 sm:px-6 lg:px-8 flex justify-center items-start">
            <div className="w-full max-w-4xl space-y-8">

                {/* Header Context Action Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-zinc-900 to-zinc-900/40 p-6 rounded-2xl border border-zinc-800/60 shadow-xl">
                    <div className="flex items-center gap-4">
                        {/* Bulletproof image avatar fallback */}
                        {user.image ? (
                            // <Avatar 
                            //     src={user.image} 
                            //     className="w-16 h-16 rounded-xl border border-teal-500/20 object-cover"
                            // />
                            <Avatar className="h-28 w-28 rounded-full border-3 border-teal-500/30 shadow-inner">
                                {user.image && user.image.startsWith("http") && (
                                    <Avatar.Image src={user.image} alt={user.name} />
                                )}
                                <Avatar.Fallback className="bg-teal-500/10 text-teal-400 text-4xl font-black">
                                    {user.name?.charAt(0).toUpperCase() || "?"}
                                </Avatar.Fallback>
                            </Avatar>
                        ) : (
                            <div className="w-16 h-16 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 font-bold flex items-center justify-center text-xl shrink-0">
                                {name ? name.charAt(0).toUpperCase() : <FaUser className="text-lg" />}
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight text-white">{name || "Contractor"}</h1>
                                <span className="bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border border-teal-500/20">
                                    {user.role}
                                </span>
                            </div>
                            <p className="text-zinc-400 text-xs mt-0.5">{user.email}</p>
                        </div>
                    </div>
                </div>

                {/* Main Configuration Interface */}
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <Card className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden p-4 sm:p-8">
                        <div className="space-y-8">

                            {/* Section 1: Basic Registry Profile */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <FaIdCard className="text-teal-500 text-xs" />
                                    <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">Identity Details</h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Display Profile Name"
                                        placeholder="e.g., Alex Rivera"
                                        labelplacement="outside"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)} // Fixed handler
                                        variant="bordered"
                                        className="text-white"
                                        classnames={{
                                            inputWrapper: "bg-zinc-950 border-zinc-800 hover:border-zinc-700 focus-within:!border-teal-500/50 h-12 rounded-xl transition-all"
                                        }}
                                        startcontent={<FaUser className="text-zinc-500 text-xs mr-1 shrink-0" />}
                                        required // Fixed attribute
                                    />
                                    <Input
                                        label="Service Rate (USD / hr)"
                                        placeholder="e.g., 45"
                                        type="number"
                                        labelplacement="outside"
                                        value={hourlyRate}
                                        onChange={(e) => setHourlyRate(e.target.value)} // Fixed handler
                                        variant="bordered"
                                        classnames={{
                                            inputWrapper: "bg-zinc-950 border-zinc-800 hover:border-zinc-700 focus-within:!border-teal-500/50 h-12 rounded-xl transition-all"
                                        }}
                                        startcontent={<FaDollarSign className="text-zinc-500 text-xs mr-1 shrink-0" />}
                                    />
                                </div>
                            </div>

                            <hr className="border-zinc-800/60" />

                            {/* Section 2: Technical Professional Profile */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <FaBriefcase className="text-teal-500 text-xs" />
                                    <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">Professional Summary</h2>
                                </div>

                                <Input
                                    label="Capabilities / Skill Stack"
                                    placeholder="React, Next.js, Tailwind CSS, Node.js, MongoDB"
                                    description="Separate each technology with an explicit comma notation format."
                                    labelplacement="outside"
                                    value={skills}
                                    onChange={(e) => setSkills(e.target.value)} // Fixed handler
                                    variant="bordered"
                                    classnames={{
                                        inputWrapper: "bg-zinc-950 border-zinc-800 hover:border-zinc-700 focus-within:!border-teal-500/50 h-12 rounded-xl transition-all",
                                        description: "text-zinc-500 text-[10px] mt-1.5"
                                    }}
                                    startcontent={<FaCode className="text-zinc-500 text-xs mr-1 shrink-0" />}
                                />

                                {/* Bio Textarea */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-zinc-200 flex items-center gap-2">
                                        <FaFileAlt className="text-zinc-500 text-xs" />
                                        Professional Biography
                                    </label>
                                    <textarea
                                        placeholder="Outline your engineering experiences, domain expertise, structural focus fields, or notable project history logs..."
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        rows={5}
                                        className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-teal-500/50 focus:outline-none rounded-xl transition-all p-4 text-sm text-zinc-100 placeholder-zinc-600 resize-none"
                                    />
                                </div>
                            </div>

                        </div>
                    </Card>

                    {/* Notification Alerts */}
                    {message.text && (
                        <div className={`p-4 rounded-xl border text-xs font-medium flex items-center gap-3 transition-all ${message.type === 'success'
                            ? "bg-teal-500/5 border-teal-500/20 text-teal-400"
                            : "bg-red-500/5 border-red-500/20 text-red-400"
                            }`}>
                            {message.type === 'success' ? <FaCheckCircle className="shrink-0 text-sm" /> : <FaExclamationTriangle className="shrink-0 text-sm" />}
                            <span>{message.text}</span>
                        </div>
                    )}

                    {/* Submit Action Button */}
                    <div className="flex justify-end pt-2">
                        <Button
                            type="submit"
                            isLoading={isSaving}
                            className="w-full sm:w-56 h-12 rounded-xl bg-teal-500 font-bold text-zinc-950 hover:bg-teal-400 transition-all shadow-lg shadow-teal-500/10 hover:shadow-teal-500/20"
                        >
                            {isSaving ? "Saving Profiles..." : "Save Modifications"}
                        </Button>
                    </div>

                </form>

            </div>
        </div>
    );
};

export default EditProfilePage;