"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Card, Avatar, Label, InputGroup } from "@heroui/react";
import {
    FaUser, FaCode, FaDollarSign, FaFileAlt,
    FaCheckCircle, FaExclamationTriangle, FaBriefcase, FaIdCard, FaCamera, FaLink
} from 'react-icons/fa';
import { authClient } from "@/lib/auth-client";
import { FiImage } from 'react-icons/fi';

const EditProfilePage = () => {
    const { data: session, isPending } = authClient.useSession();

    const [name, setName] = useState("");
    const [skills, setSkills] = useState("");
    const [hourlyRate, setHourlyRate] = useState("");
    const [bio, setBio] = useState("");
    const [image, setImage] = useState("");
    const [fileName, setFileName] = useState("");

    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const fileInputRef = useRef(null);

    useEffect(() => {
        if (session?.user) {
            setName(session.user.name || "");
            setSkills(session.user.skills || "");
            setHourlyRate(session.user.hourlyRate ? String(session.user.hourlyRate) : "");
            setBio(session.user.bio || "");
            setImage(session.user.image || "");
        }
    }, [session]);

    // Loading State
    if (isPending) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-500 gap-3">
                <div className="w-8 h-8 border-2 border-t-emerald-500 border-zinc-900 rounded-full animate-spin" />
                <span className="text-xs font-mono tracking-wider uppercase text-zinc-400">Loading your profile info...</span>
            </div>
        );
    }

    const user = session?.user;
    const isFreelancer = user?.role?.toLowerCase() === 'freelancer';

    // Access Denied State
    if (!user || !isFreelancer) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
                <Card className="bg-zinc-900 border border-red-500/10 max-w-md w-full p-6 shadow-2xl">
                    <div className="flex flex-col items-center text-center gap-4 p-2">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                            <FaExclamationTriangle className="text-red-400 text-xl" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg tracking-tight">Access Denied</h3>
                            <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
                                Only accounts registered as a <strong>Freelancer</strong> can access this edit profile page.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileName(file.name);
        setIsLoading(true);
        const formData = new FormData();
        formData.append("image", file);

        try {
            const response = await fetch("/api/upload", { method: "POST", body: formData });
            const data = await response.json();

            if (data.success) {
                setImage(data.data.url);
                toast.success("File uploaded!");
            } else {
                toast.error("Upload failed");
                setFileName("");
            }
        } catch (err) {
            toast.error("Failed to upload the image.");
            setFileName("");
        } finally {
            setIsLoading(false);
        }
    };
    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setMessage({ type: "", text: "" });

        try {
            const { error } = await authClient.updateUser({
                name: name,
                skills: skills,
                hourlyRate: hourlyRate ? Number(hourlyRate) : 0,
                bio: bio,
                image: image
            });

            if (error) {
                setMessage({ type: "error", text: error.message || "Could not save profile changes." });
            } else {
                setMessage({ type: "success", text: "Your profile updates have been successfully saved!" });
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "A network error occurred. Please try again." });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-zinc-950 min-h-screen text-zinc-100 py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-start">
            <div className="w-full max-w-3xl space-y-8">

                {/* Top Profile Card Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-xl">
                    <div className="flex items-center gap-5">

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />

                        <div
                            onClick={triggerFileSelect}
                            className="relative group h-24 w-24 rounded-full cursor-pointer overflow-hidden transition-all select-none active:scale-95 shrink-0"
                        >
                            {image ? (
                                <Avatar className="h-24 w-24 rounded-full border-2 border-emerald-500/40">
                                    {image.startsWith("http") || image.startsWith("data:image") ? (
                                        <Avatar.Image src={image} alt={name} />
                                    ) : null}
                                    <Avatar.Fallback className="bg-emerald-500/10 text-emerald-400 text-3xl font-bold">
                                        {name?.charAt(0).toUpperCase() || "?"}
                                    </Avatar.Fallback>
                                </Avatar>
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-3xl shrink-0">
                                    {name ? name.charAt(0).toUpperCase() : <FaUser className="text-xl" />}
                                </div>
                            )}

                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-emerald-400 font-mono text-[9px] uppercase font-bold">
                                <FaCamera className="text-sm text-white" />
                                <span>Upload</span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-xl font-bold tracking-tight text-white">{name || "Your Profile"}</h1>
                                <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider border border-emerald-500/20">
                                    {user.role}
                                </span>
                            </div>
                            <p className="text-zinc-500 text-xs font-mono">{user.email}</p>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <Card className="bg-zinc-900/50 border border-zinc-800 rounded-2xl shadow-xl p-6 sm:p-8 space-y-8">

                        <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
                            <FaIdCard className="text-emerald-500 text-xs" />
                            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">Profile Configuration Fields</h2>
                        </div>

                        {/* 1. Name Input Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wide block">
                                Full Name
                            </label>
                            <Input
                                placeholder="Enter your full name"
                                labelplacement="outside"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                variant="bordered"
                                className="text-white"
                                classnames={{
                                    inputWrapper: "bg-zinc-950 border-zinc-800 hover:border-zinc-700 focus-within:!border-emerald-500/40 h-12 rounded-xl transition-all"
                                }}
                                startcontent={<FaUser className="text-zinc-500 text-xs mr-1 shrink-0" />}
                                required
                            />
                        </div>

                        {/* 2. Photo Link Input Field */}
                        <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center">
                                <Label className="text-xs font-medium text-zinc-300">Avatar</Label>
                                <span className="text-[9px] text-zinc-500">Paste URL or upload a file</span>
                            </div>
                            <InputGroup className="flex items-center gap-2 border border-white/10 rounded-xl px-3 bg-white/5">
                                <FiImage className="text-zinc-500" size={16} />
                                <Input
                                    placeholder="https://example.com/avatar.png"
                                    value={fileName || image}
                                    onChange={(e) => {
                                        setImage(e.target.value);
                                        setFileName("");
                                    }}
                                    className="w-full bg-transparent py-2 text-sm text-white outline-none border-none"
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="cursor-pointer text-teal-400 text-xs font-medium whitespace-nowrap hover:underline"
                                >
                                    Upload
                                </label>
                            </InputGroup>
                        </div>

                        {/* 3. Skills Input Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wide block">
                                Professional Skills
                            </label>
                            <Input
                                placeholder="React, Next.js, Tailwind CSS, Node.js"
                                labelplacement="outside"
                                value={skills}
                                onChange={(e) => setSkills(e.target.value)}
                                variant="bordered"
                                classnames={{
                                    inputWrapper: "bg-zinc-950 border-zinc-800 hover:border-zinc-700 focus-within:!border-emerald-500/40 h-12 rounded-xl transition-all"
                                }}
                                startcontent={<FaCode className="text-zinc-500 text-xs mr-1 shrink-0" />}
                            />
                            <p className="text-zinc-500 text-[10px] font-mono mt-1">Please separate your skills using commas.</p>
                        </div>

                        {/* 4. Bio Textarea Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wide block flex items-center gap-2">
                                Short Biography
                            </label>
                            <div className="relative">
                                <textarea
                                    placeholder="Write a brief description about your work experience, skill specialties, and projects..."
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    rows={5}
                                    className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-emerald-500/40 focus:outline-none rounded-xl transition-all p-4 text-sm text-zinc-100 placeholder-zinc-600 resize-none"
                                />
                            </div>
                        </div>

                        {/* 5. Hourly Rate Input Field */}
                        <div className="space-y-2">
                            <label className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wide block">
                                Hourly Rate (USD)
                            </label>
                            <Input
                                placeholder="e.g., 50"
                                type="number"
                                labelplacement="outside"
                                value={hourlyRate}
                                onChange={(e) => setHourlyRate(e.target.value)}
                                variant="bordered"
                                classnames={{
                                    inputWrapper: "bg-zinc-950 border-zinc-800 hover:border-zinc-700 focus-within:!border-emerald-500/40 h-12 rounded-xl transition-all"
                                }}
                                startcontent={<FaDollarSign className="text-zinc-500 text-xs mr-1 shrink-0" />}
                            />
                        </div>

                    </Card>

                    {/* Notification Banner Alerts */}
                    {message.text && (
                        <div className={`p-4 rounded-xl border text-xs font-mono flex items-center gap-3 transition-all ${message.type === 'success'
                            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                            : "bg-red-500/5 border-red-500/20 text-red-400"
                            }`}>
                            {message.type === 'success' ? <FaCheckCircle className="shrink-0 text-sm" /> : <FaExclamationTriangle className="shrink-0 text-sm" />}
                            <span>{message.text}</span>
                        </div>
                    )}

                    {/* Save Button */}
                    <div className="flex justify-end pt-2">
                        <Button
                            type="submit"
                            isLoading={isSaving}
                            className="w-full sm:w-52 h-12 rounded-xl bg-emerald-500 font-mono font-bold text-zinc-950 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/10"
                        >
                            {isSaving ? "Saving Updates..." : "Save Modifications"}
                        </Button>
                    </div>

                </form>

            </div>
        </div>
    );
};

export default EditProfilePage;
