'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import {
    FaBriefcase, FaCalendarAlt, FaEnvelope, FaDollarSign,
    FaExternalLinkAlt, FaPaperPlane, FaCheckCircle, FaTimes, FaSpinner, FaClock
} from 'react-icons/fa';

const ActiveProjects = () => {
    const { data: session, status: sessionStatus } = useSession();

    // Core state managers
    const [projects, setProjects] = useState([]);
    const [isDataFetching, setIsDataFetching] = useState(false);
    const [error, setError] = useState(null);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeProject, setActiveProject] = useState(null);
    const [deliverableUrl, setDeliverableUrl] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Fetch matching projects from aggregate endpoint
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

    // Keep auth check separate from internal data loaders to prevent infinite spinner traps
    // Keep auth check separate from internal data loaders to prevent infinite spinner traps
    useEffect(() => {
        console.log("🔐 FRONTEND AUTH CHECK - Session Status:", sessionStatus, " | User Email:", session?.user?.email);

        // FIX: Fallback to checking if the email exists directly even if sessionStatus is wonky or undefined
        if (session?.user?.email) {
            console.log("🎯 FE MATCH SUCCESS: Triggering database query for", session.user.email);
            fetchActiveProjects(session.user.email);
        } else if (sessionStatus === "unauthenticated") {
            console.warn("⚠️ FRONTEND: User is unauthenticated.");
            setError("Authentication required to review active work rooms.");
        }
    }, [session, sessionStatus]);

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
                // Mutate state instantly in UI
                setProjects(prev => prev.map(p =>
                    p.taskId === activeProject.taskId
                        ? { ...p, status: 'completed', deliverableUrl: deliverableUrl.trim() }
                        : p
                ));
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

    // Compute metric balances
    const inProgressCount = projects.filter(p => p.status !== 'completed').length;
    const completedCount = projects.filter(p => p.status === 'completed').length;

    // Show loading wrapper only if session is spinning up OR background fetch is initial running
    if (sessionStatus === "loading" || (isDataFetching && projects.length === 0)) {
        return (
            <div className="flex flex-col items-center justify-center py-40 bg-zinc-950 text-zinc-400 gap-4">
                <FaSpinner className="animate-spin text-emerald-500 text-3xl" />
                <p className="font-medium tracking-wide text-sm">Syncing engineering boards...</p>
            </div>
        );
    }

    if (error && projects.length === 0) {
        return (
            <div className="max-w-4xl mx-auto my-12 p-6 bg-red-950/20 border border-red-900/40 rounded-xl text-center">
                <p className="text-red-400 font-mono text-sm">⚠️ Workboard Sync Failure: {error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 sm:p-10 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* Header section */}
                <div className="mb-8">
                    <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Fa Active Projects</h1>
                    <p className="text-zinc-400 text-sm">
                        {inProgressCount} in progress &middot; {completedCount} completed
                    </p>
                </div>

                {/* Main operational card layout context */}
                {projects.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
                        <FaBriefcase className="mx-auto text-zinc-600 text-4xl mb-4" />
                        <h3 className="text-base font-semibold text-zinc-300">No active pipelines found</h3>
                        <p className="text-zinc-500 text-xs mt-1">Proposals that pass client clearing stages will automatically map here.</p>
                    </div>
                ) : (
                    <div className="space-y-10">

                        {/* Section: In Progress */}
                        {inProgressCount > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-zinc-900">
                                    <FaClock className="text-amber-400 text-lg" />
                                    <h2 className="text-lg font-bold text-zinc-200">In Progress</h2>
                                    <span className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded-full font-mono">
                                        {inProgressCount}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {projects.filter(p => p.status !== 'completed').map((project, idx) => (
                                        <ProjectCard key={idx} project={project} onOpenSubmit={openSubmissionModal} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Section: Completed */}
                        {completedCount > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-zinc-900">
                                    <FaCheckCircle className="text-emerald-500 text-lg" />
                                    <h2 className="text-lg font-bold text-zinc-200">Completed</h2>
                                    <span className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded-full font-mono">
                                        {completedCount}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {projects.filter(p => p.status === 'completed').map((project, idx) => (
                                        <ProjectCard key={idx} project={project} onOpenSubmit={openSubmissionModal} />
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>
                )}

                {/* Deliverable Upload Dialog Modal */}
                {isModalOpen && activeProject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-xl p-6 shadow-2xl relative">

                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-200 transition-colors"
                            >
                                <FaTimes className="text-lg" />
                            </button>

                            {/* Modal Header */}
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-white mb-2">Submit Deliverable</h3>
                                <p className="text-zinc-400 text-xs leading-relaxed">
                                    Provide a link to your completed work for <span className="text-zinc-200 font-semibold">"{activeProject.title}"</span>. This can be a Google Docs link, GitHub repo, Figma board, or any public asset URL.
                                </p>
                            </div>

                            {/* Modal Input Form */}
                            <form onSubmit={handleFormSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-xs text-zinc-400 font-semibold mb-2 uppercase tracking-wider">
                                        Deliverable URL
                                    </label>
                                    <input
                                        type="url"
                                        required
                                        placeholder="https://docs.google.com/document/d/... or GitHub link"
                                        value={deliverableUrl}
                                        onChange={(e) => setDeliverableUrl(e.target.value)}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                                    />
                                    <p className="text-[11px] text-zinc-500 mt-2">
                                        Paste a link to Google Docs, GitHub, Figma, or any deliverable
                                    </p>
                                </div>

                                {/* Warning Note Banner Layout matched directly to reference specification image */}
                                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                                    <p className="text-xs text-amber-500/90 leading-relaxed">
                                        <span className="font-bold">Note:</span> Once you mark this task as completed, the status cannot be reverted. Make sure your work is ready for client review.
                                    </p>
                                </div>

                                {/* Actions Group */}
                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="bg-zinc-800 hover:bg-zinc-700/80 text-zinc-200 font-medium text-xs px-6 py-3 rounded-lg transition-colors border border-zinc-700/40"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-bold text-xs px-6 py-3 rounded-lg flex items-center gap-2 transition-colors min-w-[150px] justify-center"
                                    >
                                        {submitting ? (
                                            <>
                                                <FaSpinner className="animate-spin text-zinc-950" /> Processing...
                                            </>
                                        ) : (
                                            <>
                                                <FaCheckCircle className="text-sm" /> Mark as Completed
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

// Sub-Component: Clean, Premium Project Card Module
const ProjectCard = ({ project, onOpenSubmit }) => {
    const isCompleted = project.status === 'completed';

    return (
        <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl p-6 shadow-xl flex flex-col justify-between hover:border-zinc-700/40 transition-all duration-200">
            <div>
                {/* Row Header */}
                <div className="flex items-center justify-between gap-4 mb-3">
                    <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
                        {project.title}
                    </h3>

                    {isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-md font-medium shrink-0">
                            Completed
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-md font-medium shrink-0">
                            In Progress
                        </span>
                    )}
                </div>

                {/* Sub-text description box */}
                <p className="text-zinc-400 text-xs line-clamp-2 mb-5 font-light">
                    {project.description || "No project documentation framework provided."}
                </p>

                {/* Metadata tags line-up matching original inline designs */}
                <div className="flex flex-wrap items-center gap-3 mb-6 text-xs">
                    <span className="bg-zinc-950 text-zinc-400 border border-zinc-800 px-2.5 py-1 rounded-md text-[11px]">
                        {project.category || "General"}
                    </span>

                    <div className="flex items-center gap-1 text-emerald-400 font-mono font-medium bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                        <FaDollarSign className="text-[10px]" />
                        <span>{project.amountPaid}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-zinc-400 bg-zinc-950/40 px-2 py-0.5 rounded border border-zinc-800/40">
                        <FaCalendarAlt className="text-zinc-500 text-[10px]" />
                        <span>
                            {project.deadline ? new Date(project.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Flexible'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom Card Row */}
            <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 text-zinc-500 truncate max-w-[55%]">
                    <FaEnvelope className="text-[10px] text-zinc-600 shrink-0" />
                    <span className="text-[11px] truncate font-mono">Client: {project.clientEmail}</span>
                </div>

                <div className="shrink-0">
                    {isCompleted ? (
                        <a
                            href={project.deliverableUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl"
                        >
                            <span>View Work</span>
                            <FaExternalLinkAlt className="text-[10px]" />
                        </a>
                    ) : (
                        <button
                            onClick={() => onOpenSubmit(project)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 px-4 rounded-xl flex items-center gap-2 transition-all duration-150 active:scale-[0.98]"
                        >
                            <FaPaperPlane className="text-[10px]" />
                            Submit Deliverable
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActiveProjects;