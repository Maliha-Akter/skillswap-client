'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import {
    FaBriefcase, FaCalendarAlt, FaEnvelope, FaDollarSign,
    FaExternalLinkAlt, FaPaperPlane, FaCheckCircle, FaTimes, FaSpinner, FaClock,
    FaEye, FaTags, FaLink, FaListUl, FaStar, FaRegCommentDots
} from 'react-icons/fa';

const ActiveProjects = () => {
    const { data: session, status: sessionStatus } = useSession();

    // Core state managers
    const [projects, setProjects] = useState([]);
    const [isDataFetching, setIsDataFetching] = useState(false);
    const [error, setError] = useState(null);

    // Submission Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeProject, setActiveProject] = useState(null);
    const [deliverableUrl, setDeliverableUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // View Details Extended Metadata Modal states
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [detailsData, setDetailsData] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState(null);

    // Fetch matching projects from aggregate endpoint
    const fetchActiveProjects = async (email) => {
        try {
            setIsDataFetching(true);
            console.log("⚡ FRONTEND: Initiating fetch for active projects with email:", email);

            const url = `http://localhost:8080/freelancer-active-projects?email=${encodeURIComponent(email)}`;
            console.log("🔗 FRONTEND: Request URL is:", url);

            const res = await fetch(url);
            console.log("📡 FRONTEND: Response received status:", res.status, res.statusText);

            if (!res.ok) throw new Error("Could not parse dashboard data streams.");

            const data = await res.json();
            console.log("📦 FRONTEND: Received payload data successfully:", data);

            setProjects(data);
            setError(null);
        } catch (err) {
            console.error("❌ FRONTEND ERROR:", err.message);
            setError(err.message);
        } finally {
            setIsDataFetching(false);
        }
    };

    useEffect(() => {
        console.log("🔐 FRONTEND AUTH CHECK - Session Status:", sessionStatus, " | User Email:", session?.user?.email);

        if (session?.user?.email) {
            console.log("🎯 FE MATCH SUCCESS: Triggering database query for", session.user.email);
            fetchActiveProjects(session.user.email);
        } else if (sessionStatus === "unauthenticated") {
            console.warn("⚠️ FRONTEND: User is unauthenticated.");
            setError("Authentication required to review active work rooms.");
        }
    }, [session, sessionStatus]);

    // Secondary Trigger Effect: Fetches extended full schema metadata for single task selection
    // useEffect(() => {
    //     const fetchExtendedTaskProfile = async () => {
    //         if (!selectedTaskId) return;
    //         try {
    //             setDetailsLoading(true);
    //             setDetailsError(null);
    //             const res = await fetch(`http://localhost:8080/task-details/${selectedTaskId}`);
    //             if (!res.ok) throw new Error("Could not retrieve deep metadata specs for this task record.");

    //             const data = await res.json();
    //             setDetailsData(data);
    //         } catch (err) {
    //             console.error("❌ Details Error:", err.message);
    //             setDetailsError(err.message);
    //         } finally {
    //             setDetailsLoading(false);
    //         }
    //     };

    //     fetchExtendedTaskProfile();
    // }, [selectedTaskId]);
    // Secondary Trigger Effect: Fetches extended full schema metadata for single task selection
    useEffect(() => {
        const fetchExtendedTaskProfile = async () => {
            if (!selectedTaskId) return;
            try {
                setDetailsLoading(true);
                setDetailsError(null);

                console.log(`📡 FRONTEND: Fetching deep metadata for Task ID: ${selectedTaskId}`);
                const res = await fetch(`http://localhost:8080/task-details/${selectedTaskId}`);

                if (!res.ok) throw new Error("Could not retrieve deep metadata specs for this task record.");

                const data = await res.json();

                // 👇 ADDED DEBUG CONSOLE LOGS HERE
                console.log("📦 FRONTEND: Task payload data stream parsed successfully:", data);
                console.log("⭐ FRONTEND: Review field status check:", {
                    hasReviewField: 'review' in data,
                    reviewValue: data.review,
                    reviewType: typeof data.review
                });

                setDetailsData(data);
            } catch (err) {
                console.error("❌ Details Fetch Error:", err.message);
                setDetailsError(err.message);
            } finally {
                setDetailsLoading(false);
            }
        };

        fetchExtendedTaskProfile();
    }, [selectedTaskId]);

    const openSubmissionModal = (project) => {
        setActiveProject(project);
        setDeliverableUrl('');
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!deliverableUrl.trim()) return alert("Provide a valid work repository link.");

        try {
            setSubmitting(true);
            const response = await fetch(`http://localhost:8080/tasks/${activeProject.taskId}/submit-deliverable`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deliverableUrl: deliverableUrl.trim() })
            });

            if (response.ok) {
                // Refresh local tracking maps seamlessly 
                if (session?.user?.email) {
                    await fetchActiveProjects(session.user.email);
                }
                setIsModalOpen(false);
                setActiveProject(null);
            } else {
                const errData = await response.json();
                alert(errData.message || "Something went wrong.");
            }
        } catch (error) {
            console.error(error);
            alert("Network connection drop detected.");
        } finally {
            setSubmitting(false);
        }
    };

    const inProgressCount = projects.filter(p => p.status !== 'completed').length;
    const completedCount = projects.filter(p => p.status === 'completed').length;

    if (sessionStatus === "loading" || (isDataFetching && projects.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center py-40 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-400 gap-4 min-h-screen select-none">
                <div className="w-6 h-6 border-2 border-zinc-800 border-t-teal-400 rounded-full animate-spin" />
                <p className="font-mono tracking-widest text-xs uppercase text-zinc-500">Syncing engineering boards...</p>
            </div>
        );
    }

    if (error && projects.length === 0) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
                <div className="max-w-4xl mx-auto p-6 bg-yellow-500/5 border border-yellow-500/10 rounded-2xl text-center">
                    <p className="text-yellow-400 font-mono text-xs tracking-wide">⚠️ Workboard Sync Failure: {error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100 p-6 sm:p-10 font-sans relative overflow-hidden select-none">
            {/* Ambient Core Brand Blurs */}
            <div className="absolute top-1/4 left-1/12 w-[500px] h-[500px] bg-teal-400/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/12 w-[500px] h-[500px] bg-yellow-400/10 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">

                {/* Header section */}
                <div className="mb-10 pb-6 border-b border-white/5">
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2">Active Pipelines</h1>
                    <p className="text-zinc-400 text-xs font-mono uppercase tracking-widest">
                        {inProgressCount} in queue &middot; {completedCount} completed execution nodes
                    </p>
                </div>

                {/* Main operational card layout */}
                {projects.length === 0 ? (
                    <div className="text-center py-24 border border-dashed border-white/5 rounded-[28px] bg-zinc-900/10">
                        <FaBriefcase className="mx-auto text-zinc-700 text-4xl mb-4" />
                        <h3 className="text-sm font-bold text-zinc-300 font-mono uppercase tracking-wider">No active pipelines mapped</h3>
                        <p className="text-zinc-500 text-xs mt-2 max-w-sm mx-auto leading-relaxed">Proposals that clear validation testing stages automatically spin up workspace frames here.</p>
                    </div>
                ) : (
                    <div className="space-y-12">

                        {/* Section: In Progress */}
                        {inProgressCount > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/5">
                                    <FaClock className="text-yellow-400 text-sm" />
                                    <h2 className="text-sm font-bold uppercase font-mono tracking-widest text-zinc-300">In Progress Queue</h2>
                                    <span className="bg-white/5 backdrop-blur text-teal-300 border border-teal-400/20 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold">
                                        {inProgressCount}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {projects.filter(p => p.status !== 'completed').map((project, idx) => (
                                        <ProjectCard
                                            key={idx}
                                            project={project}
                                            onOpenSubmit={openSubmissionModal}
                                            onViewDetails={(id) => setSelectedTaskId(id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Section: Completed */}
                        {completedCount > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/5">
                                    <FaCheckCircle className="text-teal-400 text-sm" />
                                    <h2 className="text-sm font-bold uppercase font-mono tracking-widest text-zinc-300">Completed Archives</h2>
                                    <span className="bg-white/5 backdrop-blur text-yellow-300 border border-yellow-400/20 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold">
                                        {completedCount}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {projects.filter(p => p.status === 'completed').map((project, idx) => (
                                        <ProjectCard
                                            key={idx}
                                            project={project}
                                            onOpenSubmit={openSubmissionModal}
                                            onViewDetails={(id) => setSelectedTaskId(id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                )}

                {/* Deliverable Upload Dialog Modal */}
                {isModalOpen && activeProject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-white/10 w-full max-w-lg rounded-[28px] p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors"
                            >
                                <FaTimes className="text-base" />
                            </button>

                            <div className="mb-6">
                                <span className="text-[10px] font-bold font-mono tracking-widest uppercase text-teal-300 bg-teal-400/10 border border-teal-400/20 px-3 py-1 rounded-full">
                                    Pipeline Delivery
                                </span>
                                <h3 className="text-xl font-black text-white mt-4 mb-2">Submit Project Assets</h3>
                                <p className="text-zinc-400 text-xs leading-relaxed">
                                    Provide verified access parameters or repository linkage for project: <span className="text-zinc-200 font-bold">"{activeProject.title}"</span>.
                                </p>
                            </div>

                            <form onSubmit={handleFormSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] text-zinc-400 font-bold uppercase tracking-widest font-mono mb-2">
                                        Asset Hub / Deliverable URL
                                    </label>
                                    <input
                                        type="url"
                                        required
                                        placeholder="https://github.com/... or Google Drive workspace link"
                                        value={deliverableUrl}
                                        onChange={(e) => setDeliverableUrl(e.target.value)}
                                        className="w-full bg-zinc-950 border border-white/5 rounded-xl py-3.5 px-4 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-teal-400 font-mono transition-colors"
                                    />
                                </div>

                                <div className="bg-yellow-400/5 border border-yellow-400/10 rounded-xl p-4">
                                    <p className="text-[11px] text-yellow-300/90 leading-relaxed font-mono">
                                        [NOTICE]: Execution closure states push immutable variables downstream to main clearing boards. Review asset parameters before triggering build.
                                    </p>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="bg-white/5 hover:bg-white/10 text-zinc-300 font-medium text-xs px-6 py-3 rounded-xl border border-white/5 transition-colors"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="bg-gradient-to-br from-teal-400 to-yellow-400 text-zinc-950 font-black font-mono text-xs tracking-wider uppercase px-6 py-3 rounded-xl flex items-center gap-2 transition-all min-w-[170px] justify-center disabled:opacity-40"
                                    >
                                        {submitting ? <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" /> : "Deploy Assets"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ADVANCED TASK INSPECTION FULL OVERLAY MODAL WITH REVIEW EXTENSIONS */}
                {selectedTaskId && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-white/10 max-w-2xl w-full rounded-[28px] shadow-2xl overflow-hidden my-auto transform transition-all animate-in fade-in zoom-in-95 duration-150">

                            {/* Head Context Bar */}
                            <div className="px-6 py-4 bg-zinc-950/40 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FaListUl className="text-teal-400 text-xs" />
                                    <span className="font-mono text-[10px] tracking-widest text-zinc-400 uppercase">Project Record Audit</span>
                                </div>
                                <button
                                    onClick={() => { setSelectedTaskId(null); setDetailsData(null); setDetailsError(null); }}
                                    className="p-1.5 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                >
                                    <FaTimes className="text-sm" />
                                </button>
                            </div>

                            {/* Inner Layout Content */}
                            <div className="p-6 space-y-6">
                                {detailsLoading && (
                                    <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-3">
                                        <div className="w-5 h-5 border-2 border-zinc-800 border-t-teal-400 rounded-full animate-spin" />
                                        <p className="text-[10px] font-mono uppercase tracking-wider">Synchronizing system registers...</p>
                                    </div>
                                )}

                                {detailsError && (
                                    <div className="p-4 bg-yellow-400/5 border border-yellow-400/10 rounded-xl text-center text-yellow-400 text-xs font-mono">
                                        ❌ Operational Fault: {detailsError}
                                    </div>
                                )}

                                {!detailsLoading && !detailsError && detailsData && (
                                    <div className="space-y-6">
                                        <div>
                                            <h2 className="text-2xl font-black text-white tracking-tight mb-3">{detailsData.title}</h2>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/5 text-teal-300 rounded-full text-[10px] font-mono border border-teal-400/10 uppercase tracking-wide">
                                                    <FaTags className="text-[9px] opacity-70" /> {detailsData.category || 'General'}
                                                </span>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${detailsData.status === 'completed'
                                                        ? 'bg-yellow-400/10 text-yellow-300 border border-yellow-400/20'
                                                        : 'bg-teal-400/10 text-teal-300 border border-teal-400/20'
                                                    }`}>
                                                    {detailsData.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Full Text Description */}
                                        <div className="bg-zinc-950/40 rounded-2xl p-5 border border-white/5 space-y-2">
                                            <h4 className="text-[9px] font-bold font-mono text-zinc-500 uppercase tracking-widest">Project Specification</h4>
                                            <p className="text-zinc-300 text-xs leading-relaxed whitespace-pre-wrap font-light">{detailsData.description}</p>
                                        </div>

                                        {/* Key Data Points */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                                            <div className="bg-zinc-950/20 p-4 rounded-xl border border-white/5 space-y-1">
                                                <span className="text-zinc-500 block text-[9px] font-sans uppercase font-medium tracking-wide">Allocated Budget</span>
                                                <span className="text-yellow-300 font-bold text-sm">${detailsData.budget}</span>
                                            </div>
                                            <div className="bg-zinc-950/20 p-4 rounded-xl border border-white/5 space-y-1">
                                                <span className="text-zinc-500 block text-[9px] font-sans uppercase font-medium tracking-wide">Target Deadline Window</span>
                                                <span className="text-zinc-300 flex items-center gap-1 text-xs">
                                                    <FaClock className="text-zinc-600 text-[10px]" />
                                                    {detailsData.deadline ? new Date(detailsData.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "Open Timeline"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* 🎯 NEW: Premium Client Review Dashboard Frame Component Container */}
                                        {/* 🎯 NEW: Premium Client Review Dashboard Frame Component Container */}
                                        {detailsData.review ? (
                                            <div className="bg-gradient-to-br from-zinc-950 to-zinc-900 border border-yellow-400/10 rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden">
                                                {/* Visual brand flare marker accent inside review card */}
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-yellow-400/10 to-transparent pointer-events-none rounded-bl-full" />

                                                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                                    <div className="flex items-center gap-2">
                                                        <FaStar className="text-yellow-400 text-xs" />
                                                        <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-400 uppercase">
                                                            Client Evaluation Feed
                                                        </span>
                                                    </div>
                                                    {detailsData.review.createdAt && (
                                                        <span className="text-[9px] font-mono text-zinc-600">
                                                            {new Date(detailsData.review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-3">
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <span className="text-[10px] px-2.5 py-0.5 font-mono font-bold rounded bg-yellow-400/10 text-yellow-300 border border-yellow-400/20">
                                                            Rating: {detailsData.review.rating}
                                                        </span>
                                                        <span className="text-[11px] font-mono text-zinc-500 truncate max-w-[240px]">
                                                            by {detailsData.review.reviewerEmail}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-start gap-2.5 bg-zinc-900/40 p-3.5 rounded-xl border border-white/5">
                                                        <FaRegCommentDots className="text-zinc-600 text-xs shrink-0 mt-0.5" />
                                                        <p className="text-zinc-300 text-xs italic font-light leading-relaxed">
                                                            "{detailsData.review.comment || 'No contextual evaluation commentary attached.'}"
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : detailsData.status?.toLowerCase() === 'completed' ? (
                                            <div className="bg-zinc-950/20 border border-dashed border-white/5 rounded-2xl p-4 text-center">
                                                <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-wider">
                                                    ⏳ Awaiting client evaluation submission index log.
                                                </p>
                                            </div>
                                        ) : null}

                                        {/* Deliverable Assets Links */}
                                        {detailsData.deliverable_url && (
                                            <div className="bg-zinc-950/60 border border-white/5 p-4 rounded-xl flex items-center justify-between text-xs">
                                                <div className="space-y-1 max-w-[65%]">
                                                    <span className="text-[9px] text-zinc-500 block font-mono uppercase tracking-widest">Submitted System Asset</span>
                                                    <span className="text-teal-300 font-mono truncate block text-xs">{detailsData.deliverable_url}</span>
                                                </div>
                                                <a
                                                    href={detailsData.deliverable_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-zinc-200 rounded-xl border border-white/10 font-mono font-bold text-[10px] uppercase tracking-wider transition-colors"
                                                >
                                                    <FaLink className="text-[9px]" /> Open Build
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

// Refactored Sub-Component Card Module with Integrated Review Node Indicators
const ProjectCard = ({ project, onOpenSubmit, onViewDetails }) => {
    const isCompleted = project.status === 'completed';

    return (
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-white/5 rounded-[22px] p-6 shadow-2xl flex flex-col justify-between hover:border-white/10 hover:shadow-teal-950/20 transition-all duration-300 group">
            <div>
                <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-lg font-bold text-white tracking-tight leading-snug group-hover:text-teal-300 transition duration-200">
                        {project.title}
                    </h3>

                    {isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-yellow-400/10 text-yellow-300 border border-yellow-400/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                            Completed
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-teal-400/10 text-teal-300 border border-teal-400/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                            In Progress
                        </span>
                    )}
                </div>

                <p className="text-zinc-400 text-xs line-clamp-2 mb-5 font-light leading-relaxed">
                    {project.description || "No project documentation framework provided."}
                </p>

                <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
                    <span className="bg-white/5 text-zinc-400 border border-white/5 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wide">
                        {project.category || "General"}
                    </span>

                    <div className="flex items-center gap-1 text-yellow-300 font-mono font-bold bg-yellow-400/10 px-2.5 py-0.5 rounded-full border border-yellow-400/20 text-[10px]">
                        <FaDollarSign className="text-[9px]" />
                        <span>{project.amountPaid}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-zinc-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5 text-[10px] font-mono">
                        <FaCalendarAlt className="text-zinc-600 text-[9px]" />
                        <span>
                            {project.deadline ? new Date(project.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Flexible'}
                        </span>
                    </div>

                    {/* 🆕 Context marker icon notifying that a client review is indexed and ready to see inside the modal */}
                    {isCompleted && project.review && (
                        <div className="flex items-center gap-1 text-yellow-400 font-mono font-bold bg-white/5 px-2.5 py-0.5 rounded-full border border-yellow-400/20 text-[9px] uppercase tracking-wider animate-pulse">
                            <FaStar className="text-[8px]" /> Reviewed
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Card Action Footer Options Grid */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 text-zinc-500 truncate max-w-[45%]">
                    <FaEnvelope className="text-[10px] text-zinc-600 shrink-0" />
                    <span className="text-[11px] truncate font-mono">Client: {project.clientEmail?.split('@')[0] || 'Unresolved'}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => onViewDetails(project.taskId || project._id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/5 rounded-xl font-mono text-[10px] uppercase tracking-wider font-bold transition-colors"
                    >
                        <FaEye className="text-zinc-500 text-[10px]" />
                        <span>Details</span>
                    </button>

                    {isCompleted ? (
                        <a
                            href={project.deliverableUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold text-yellow-300 hover:text-white transition-colors bg-yellow-400/10 hover:bg-gradient-to-br hover:from-teal-400 hover:to-yellow-400 hover:text-zinc-950 border border-yellow-400/20 px-3 py-2 rounded-xl"
                        >
                            <span>Work</span>
                            <FaExternalLinkAlt className="text-[9px]" />
                        </a>
                    ) : (
                        <button
                            onClick={() => onOpenSubmit(project)}
                            className="bg-gradient-to-br from-teal-400 to-yellow-400 text-zinc-950 font-black font-mono text-[10px] uppercase tracking-wider py-2 px-3 rounded-xl flex items-center gap-1.5 transition-all duration-150 active:scale-[0.98]"
                        >
                            <FaPaperPlane className="text-[9px]" />
                            Submit
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActiveProjects;