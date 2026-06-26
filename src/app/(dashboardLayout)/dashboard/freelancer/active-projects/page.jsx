'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import {
    FaBriefcase, FaCalendarAlt, FaEnvelope, FaDollarSign,
    FaExternalLinkAlt, FaPaperPlane, FaCheckCircle, FaTimes, FaSpinner, FaClock,
    FaEye, FaTags, FaLink, FaListUl
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
    useEffect(() => {
        const fetchExtendedTaskProfile = async () => {
            if (!selectedTaskId) return;
            try {
                setDetailsLoading(true);
                setDetailsError(null);
                const res = await fetch(`http://localhost:8080/task-details/${selectedTaskId}`);
                if (!res.ok) throw new Error("Could not retrieve deep metadata specs for this task record.");
                
                const data = await res.json();
                setDetailsData(data);
            } catch (err) {
                console.error("❌ Details Error:", err.message);
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

    const inProgressCount = projects.filter(p => p.status !== 'completed').length;
    const completedCount = projects.filter(p => p.status === 'completed').length;

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
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 sm:p-10 font-sans relative">
            <div className="max-w-7xl mx-auto">

                {/* Header section */}
                <div className="mb-8">
                    <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Active Projects</h1>
                    <p className="text-zinc-400 text-sm">
                        {inProgressCount} in progress &middot; {completedCount} completed
                    </p>
                </div>

                {/* Main operational card layout */}
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
                                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-zinc-900">
                                    <FaCheckCircle className="text-emerald-500 text-lg" />
                                    <h2 className="text-lg font-bold text-zinc-200">Completed</h2>
                                    <span className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded-full font-mono">
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                        <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-200 transition-colors"
                            >
                                <FaTimes className="text-lg" />
                            </button>

                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-white mb-2">Submit Deliverable</h3>
                                <p className="text-zinc-400 text-xs leading-relaxed">
                                    Provide a link to your completed work for <span className="text-zinc-200 font-semibold">"{activeProject.title}"</span>.
                                </p>
                            </div>

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
                                </div>

                                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                                    <p className="text-xs text-amber-500/90 leading-relaxed">
                                        <span className="font-bold">Note:</span> Once marked as complete, status updates pass permanently to client clearing boards.
                                    </p>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="bg-zinc-800 hover:bg-zinc-700/80 text-zinc-200 font-medium text-xs px-6 py-3 rounded-lg border border-zinc-700/40"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-bold text-xs px-6 py-3 rounded-lg flex items-center gap-2 transition-colors min-w-[150px] justify-center"
                                    >
                                        {submitting ? <FaSpinner className="animate-spin" /> : "Mark as Completed"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ADVANCED TASK INSPECTION FULL OVERLAY MODAL */}
                {selectedTaskId && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <div className="bg-zinc-900 border border-zinc-800 max-w-2xl w-full rounded-xl shadow-2xl overflow-hidden my-auto transform transition-all animate-in fade-in zoom-in-95 duration-150">
                            
                            {/* Head Context Bar */}
                            <div className="px-6 py-4 bg-zinc-950 border-b border-zinc-800/80 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FaListUl className="text-emerald-500 text-xs" />
                                    <span className="font-mono text-[10px] tracking-widest text-zinc-400 uppercase">Project Record Audit</span>
                                </div>
                                <button 
                                    onClick={() => { setSelectedTaskId(null); setDetailsData(null); setDetailsError(null); }}
                                    className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                >
                                    <FaTimes className="text-sm" />
                                </button>
                            </div>

                            {/* Inner Layout Content */}
                            <div className="p-6 space-y-6">
                                {detailsLoading && (
                                    <div className="flex flex-col items-center justify-center py-16 text-zinc-400 gap-3">
                                        <FaSpinner className="animate-spin text-emerald-400 text-2xl" />
                                        <p className="text-xs font-mono">Syncing complete data registers...</p>
                                    </div>
                                )}

                                {detailsError && (
                                    <div className="p-4 bg-red-950/20 border border-red-900/30 rounded-lg text-center text-red-400 text-xs font-mono">
                                        ❌ Operational Fault: {detailsError}
                                    </div>
                                )}

                                {!detailsLoading && !detailsError && detailsData && (
                                    <div className="space-y-5">
                                        <div>
                                            <h2 className="text-xl font-bold text-white tracking-tight mb-2">{detailsData.title}</h2>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-zinc-800 text-zinc-300 rounded text-[10px] font-medium border border-zinc-700/50">
                                                    <FaTags className="text-[9px] text-zinc-500" /> {detailsData.category}
                                                </span>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                                    detailsData.status === 'completed'
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                }`}>
                                                    {detailsData.status}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Full Text Description */}
                                        <div className="bg-zinc-950/60 rounded-lg p-4 border border-zinc-800/40 space-y-1.5">
                                            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Project Specification</h4>
                                            <p className="text-zinc-300 text-xs leading-relaxed whitespace-pre-wrap">{detailsData.description}</p>
                                        </div>

                                        {/* Key Data Point Configuration Values */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                                            <div className="bg-zinc-950/30 p-3 rounded-lg border border-zinc-800/50 space-y-1">
                                                <span className="text-zinc-500 block text-[10px] font-sans">Budget Locked</span>
                                                <span className="text-emerald-400 font-bold text-sm">${detailsData.budget}</span>
                                            </div>
                                            <div className="bg-zinc-950/30 p-3 rounded-lg border border-zinc-800/50 space-y-1">
                                                <span className="text-zinc-500 block text-[10px] font-sans">Target Window Deadline</span>
                                                <span className="text-zinc-300 flex items-center gap-1">
                                                    <FaClock className="text-zinc-600 text-[10px]" /> 
                                                    {detailsData.deadline ? new Date(detailsData.deadline).toLocaleDateString(undefined, { dateStyle: 'medium' }) : "Open Pipeline"}
                                                </span>
                                            </div>
                                            <div className="bg-zinc-950/30 p-3 rounded-lg border border-zinc-800/50 space-y-1">
                                                <span className="text-zinc-500 block text-[10px] font-sans">Client Email Profile</span>
                                                <span className="text-zinc-300 flex items-center gap-1 truncate"><FaEnvelope className="text-zinc-600 text-[10px]" /> {detailsData.client_email}</span>
                                            </div>
                                            <div className="bg-zinc-950/30 p-3 rounded-lg border border-zinc-800/50 space-y-1">
                                                <span className="text-zinc-500 block text-[10px] font-sans">Creation Logged</span>
                                                <span className="text-zinc-400">{new Date(detailsData.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                                            </div>
                                        </div>

                                        {/* Deliverable Assets Submission Link Row */}
                                        {detailsData.deliverable_url && (
                                            <div className="bg-emerald-950/10 border border-emerald-900/20 p-3.5 rounded-lg flex items-center justify-between text-xs">
                                                <div className="space-y-0.5 max-w-[70%]">
                                                    <span className="text-[10px] text-zinc-500 block font-semibold uppercase tracking-wider">Submitted Work Asset Link</span>
                                                    <span className="text-emerald-400 font-mono truncate block text-xs">{detailsData.deliverable_url}</span>
                                                </div>
                                                <a 
                                                    href={detailsData.deliverable_url} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg border border-emerald-500/20 font-medium transition-colors text-xs"
                                                >
                                                    <FaLink className="text-[10px]" /> Open Asset
                                                </a>
                                            </div>
                                        )}

                                        {/* Footer Meta */}
                                        <div className="pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-zinc-500">
                                            <span>Database _id: <span className="text-zinc-400">{detailsData._id}</span></span>
                                            <span>Proposals Registered: <span className="text-zinc-400">{detailsData.proposals?.length || 0} applications</span></span>
                                        </div>
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

// Sub-Component Module with "View Details" button wired directly
const ProjectCard = ({ project, onOpenSubmit, onViewDetails }) => {
    const isCompleted = project.status === 'completed';

    return (
        <div className="bg-zinc-900 border border-zinc-800/60 rounded-xl p-6 shadow-xl flex flex-col justify-between hover:border-zinc-700/40 transition-all duration-200">
            <div>
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

                <p className="text-zinc-400 text-xs line-clamp-2 mb-5 font-light">
                    {project.description || "No project documentation framework provided."}
                </p>

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

            {/* Bottom Card Action Footer Options Grid */}
            <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5 text-zinc-500 truncate max-w-[45%]">
                    <FaEnvelope className="text-[10px] text-zinc-600 shrink-0" />
                    <span className="text-[11px] truncate font-mono">Client: {project.clientEmail}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {/* View Details API trigger */}
                    <button
                        onClick={() => onViewDetails(project.taskId || project._id)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-xl font-medium text-xs transition-colors"
                    >
                        <FaEye className="text-zinc-500 text-[11px]" />
                        <span>Details</span>
                    </button>

                    {isCompleted ? (
                        <a
                            href={project.deliverableUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl"
                        >
                            <span>View Work</span>
                            <FaExternalLinkAlt className="text-[10px]" />
                        </a>
                    ) : (
                        <button
                            onClick={() => onOpenSubmit(project)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 transition-all duration-150 active:scale-[0.98]"
                        >
                            <FaPaperPlane className="text-[9px]" />
                            Submit Work
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActiveProjects;