"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import {
    FaDollarSign, FaCalendarAlt, FaTrashAlt, FaEdit, FaCheck,
    FaArrowLeft, FaPaperPlane, FaClock, FaEnvelope,
    FaFileAlt, FaTag, FaBriefcase, FaCircle, FaTimes
} from 'react-icons/fa';
import { useSession } from '@/lib/auth-client';

const TaskDetailsPage = ({ params }) => {
    const router = useRouter();
    const id = React.use(params).id;

    const { data: session } = useSession();
    const userRole = session?.user?.role;
    
    const isClientOrAdmin = userRole === 'client' || userRole === 'admin';

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // 🎯 NEW STATE: Tracks if the current freelancer has already submitted a proposal
    const [hasApplied, setHasApplied] = useState(false);

    const [proposalForm, setProposalForm] = useState({
        taskId: id || '',
        freelancerEmail: '',
        proposedBudget: '',
        estimatedDays: '',
        coverNote: ''
    });
    const [submittingProposal, setSubmittingProposal] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        title: '',
        description: '',
        category: '',
        budget: ''
    });

    useEffect(() => {
        if (!id) return;

        const activeUserEmail = session?.user?.email || '';

        setProposalForm(prev => ({
            ...prev,
            taskId: id,
            freelancerEmail: activeUserEmail
        }));

        const fetchTaskDetails = async () => {
            try {
                setLoading(true);
                
                // 1. Fetch Task Details
                const response = await fetch(`http://localhost:8080/tasks/${id}`);
                if (!response.ok) {
                    throw new Error("Could not find this task.");
                }
                const matchedTask = await response.json();
                setTask(matchedTask);
                setEditData({
                    title: matchedTask.title,
                    description: matchedTask.description,
                    category: matchedTask.category,
                    budget: matchedTask.budget
                });

                // 2. Fetch Proposals and check if the active freelancer already applied
                if (activeUserEmail && !isClientOrAdmin) {
                    const proposalsRes = await fetch(`http://localhost:8080/tasks/${id}/proposals`);
                    if (proposalsRes.ok) {
                        const proposalsData = await proposalsRes.json();
                        // Adjust condition matching based on your DB field (e.g., freelancerEmail or freelancer_email)
                        const alreadyApplied = proposalsData.proposals?.some(
                            p => p.freelancerEmail === activeUserEmail || p.freelancer_email === activeUserEmail
                        );
                        setHasApplied(!!alreadyApplied);
                    }
                }

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTaskDetails();
    }, [id, session, isClientOrAdmin]);

    const handleSubmitProposal = async (e) => {
        e.preventDefault();
        if (isClientOrAdmin || hasApplied) return;

        try {
            setSubmittingProposal(true);

            const proposalPayload = {
                taskId: proposalForm.taskId,
                freelancerEmail: proposalForm.freelancerEmail,
                proposedBudget: Number(proposalForm.proposedBudget),
                estimatedDays: Number(proposalForm.estimatedDays),
                coverNote: proposalForm.coverNote,
                status: "pending"
            };

            const response = await fetch("http://localhost:8080/proposals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(proposalPayload)
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || "Failed to submit proposal.");
            }

            alert("Proposal submitted successfully!");

            setProposalForm(prev => ({
                ...prev,
                proposedBudget: '',
                estimatedDays: '',
                coverNote: ''
            }));
            setHasApplied(true); // Prevent re-submission right away
            setIsModalOpen(false);
            router.refresh();

        } catch (err) {
            alert(`Error: ${err.message}`);
        } finally {
            setSubmittingProposal(false);
        }
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:8080/api/tasks/${id}/edit`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editData),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to update task.");

            setTask(prev => ({ ...prev, ...editData }));
            setIsEditing(false);
        } catch (err) {
            alert(`Update Error: ${err.message}`);
        }
    };

    const handleDeleteTask = async () => {
        if (task.proposals && task.proposals > 0) {
            alert("Cannot delete: This task already has active proposals.");
            return;
        }

        const confirmDelete = window.confirm("Are you sure you want to delete this task?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:8080/tasks/${id}`, {
                method: "DELETE"
            });

            if (!response.ok) throw new Error("Server error while deleting task.");

            router.push('/my-tasks');
        } catch (err) {
            alert(`Delete Error: ${err.message}`);
        }
    };

    if (loading) return <div className="text-center py-32 bg-zinc-950 text-zinc-500 font-medium tracking-wide animate-pulse">Loading task details...</div>;
    if (error) return <div className="text-center py-32 bg-zinc-950 text-red-400 font-mono tracking-tight">⚠️ Error: {error}</div>;
    if (!task) return null;

    const isOpen = task.status?.toLowerCase() === 'open';

    return (
        <div className="bg-zinc-950 min-h-screen text-zinc-100 p-4 md:p-12 selection:bg-teal-500/30 selection:text-teal-200 relative">
            <div className="max-w-5xl mx-auto flex flex-col gap-8">

                {/* Top Navigation */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-zinc-500 hover:text-zinc-200 text-xs font-semibold uppercase tracking-wider transition-colors group"
                    >
                        <FaArrowLeft className="transform group-hover:-translate-x-0.5 transition-transform" /> Back to Tasks
                    </button>

                    {isClientOrAdmin && !isEditing && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-3 py-1.5 bg-zinc-900 border border-white/10 text-zinc-300 rounded-xl text-xs font-medium flex items-center gap-1.5 hover:text-teal-400 hover:border-teal-500/20 transition-all"
                            >
                                <FaEdit className="text-[10px]" /> Edit
                            </button>
                            <button
                                onClick={handleDeleteTask}
                                className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-medium flex items-center gap-1.5 hover:bg-red-500 hover:text-white transition-all"
                            >
                                <FaTrashAlt className="text-[10px]" /> Delete
                            </button>
                        </div>
                    )}
                </div>

                {/* Edit Form Interface */}
                {isEditing ? (
                    <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 md:p-8">
                        <form onSubmit={handleUpdateTask} className="flex flex-col gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Task Title</label>
                                <input
                                    type="text"
                                    value={editData.title}
                                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-teal-500/50 transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Task Description</label>
                                <textarea
                                    rows={6}
                                    value={editData.description}
                                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-teal-500/50 transition-colors"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Category</label>
                                    <input
                                        type="text"
                                        value={editData.category}
                                        onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-teal-500/50 transition-colors"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Budget ($)</label>
                                    <input
                                        type="number"
                                        value={editData.budget}
                                        onChange={(e) => setEditData({ ...editData, budget: e.target.value })}
                                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-teal-500/50 transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-2 border-t border-white/5 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="text-xs font-medium text-zinc-400 hover:text-white px-4 py-2 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="text-xs bg-teal-500 text-black font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5 hover:bg-teal-400 transition-colors"
                                >
                                    <FaCheck /> Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    /* Main Dashboard Split Layout */
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                        {/* Left Side: Task Main Details */}
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 md:p-8 flex flex-col gap-4 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-teal-500/40" />

                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-teal-400/10 border border-teal-400/20 text-teal-400 rounded-md text-[11px] font-bold uppercase tracking-wider">
                                        <FaCircle className="text-[6px] animate-pulse" /> {task.status || "Open"}
                                    </span>
                                    <span className="text-zinc-500 text-xs font-medium">
                                        Posted: {task.createdAt ? new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                    </span>
                                </div>

                                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-tight">
                                    {task.title}
                                </h1>

                                <div className="h-px bg-white/5 my-2" />

                                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                    <FaBriefcase className="text-zinc-500" /> Description
                                </h3>
                                <p className="text-zinc-300 text-[15px] leading-relaxed whitespace-pre-wrap font-normal">
                                    {task.description}
                                </p>
                            </div>
                        </div>

                        {/* Right Side: Quick Specs Sidebar & Dynamic Button */}
                        <div className="flex flex-col gap-4">
                            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3">Task Overview</h2>

                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-zinc-500 font-medium flex items-center gap-2"><FaTag /> Category</span>
                                        <span className="text-xs font-semibold text-zinc-200 bg-zinc-950 px-3 py-1 border border-white/5 rounded-lg">{task.category}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-zinc-500 font-medium flex items-center gap-2"><FaDollarSign /> Budget</span>
                                        <span className="text-sm font-extrabold text-teal-400">${task.budget}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-zinc-500 font-medium flex items-center gap-2"><FaCalendarAlt /> Deadline</span>
                                        <span className="text-xs font-mono text-zinc-300">
                                            {task.deadline ? new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Deadline'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-zinc-500 font-medium flex items-center gap-2"><FaPaperPlane /> Proposals</span>
                                        <span className="text-xs font-semibold text-zinc-400">{task.proposals || 0} active proposals</span>
                                    </div>
                                </div>

                                {isOpen ? (
                                    hasApplied ? (
                                        /* 🛠️ Dynamic applied state conditional view */
                                        <div className="text-center py-3 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-xl text-xs font-semibold tracking-wide uppercase">
                                            ✓ You have already applied
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => !isClientOrAdmin && setIsModalOpen(true)}
                                            disabled={isClientOrAdmin}
                                            title={isClientOrAdmin ? "To apply for this job you have to login as a freelancer" : ""}
                                            className={`w-full text-center py-3 font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${isClientOrAdmin
                                                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
                                                    : 'bg-teal-500 text-black hover:bg-teal-400 shadow-lg shadow-teal-500/10'
                                                }`}
                                        >
                                            <FaPaperPlane className="text-[10px]" /> Submit a Proposal
                                        </button>
                                    )
                                ) : (
                                    <div className="text-center py-3 bg-zinc-950 text-zinc-500 border border-dashed border-white/5 rounded-xl text-xs italic">
                                        This task is closed for new proposals.
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                )}
            </div>

            {/* POPUP MODAL OVERLAY FOR PROPOSAL SUBMISSION */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all animate-fadeIn">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">

                        {/* Modal Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-900 sticky top-0 z-10">
                            <div>
                                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                                    <FaPaperPlane className="text-teal-400 text-xs" /> Send a Proposal
                                </h2>
                                <p className="text-zinc-500 text-xs mt-0.5">
                                    Logged in as: <span className="text-zinc-400 font-mono">{proposalForm.freelancerEmail || "Loading..."}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-zinc-500 hover:text-white p-2 rounded-lg bg-zinc-950/40 border border-white/5 transition-colors"
                            >
                                <FaTimes className="text-xs" />
                            </button>
                        </div>

                        {/* Modal Body Container */}
                        <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4 custom-scrollbar">
                            <form onSubmit={handleSubmitProposal} className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Task ID</label>
                                        <input
                                            type="text"
                                            value={proposalForm.taskId}
                                            readOnly
                                            className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-500 outline-none cursor-not-allowed"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Freelancer Email</label>
                                        <div className="relative flex items-center">
                                            <FaEnvelope className="absolute left-4 text-zinc-500 text-xs" />
                                            <input
                                                type="email"
                                                value={proposalForm.freelancerEmail}
                                                onChange={(e) => setProposalForm({ ...proposalForm, freelancerEmail: e.target.value })}
                                                className="w-full bg-zinc-950 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-teal-500/50 transition-colors"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Proposed Budget (USD)</label>
                                        <div className="relative flex items-center">
                                            <FaDollarSign className="absolute left-4 text-zinc-500 text-xs" />
                                            <input
                                                type="number"
                                                placeholder="e.g. 500"
                                                min="1"
                                                value={proposalForm.proposedBudget}
                                                onChange={(e) => setProposalForm({ ...proposalForm, proposedBudget: e.target.value })}
                                                className="w-full bg-zinc-950 border border-white/5 rounded-xl pl-9 pr-4 py-3 text-sm text-white outline-none focus:border-teal-500/50 transition-colors"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Estimated Days</label>
                                        <div className="relative flex items-center">
                                            <FaClock className="absolute left-4 text-zinc-500 text-xs" />
                                            <input
                                                type="number"
                                                placeholder="e.g. 7"
                                                min="1"
                                                value={proposalForm.estimatedDays}
                                                onChange={(e) => setProposalForm({ ...proposalForm, estimatedDays: e.target.value })}
                                                className="w-full bg-zinc-950 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-teal-500/50 transition-colors"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Cover Note Message</label>
                                    <div className="relative flex">
                                        <FaFileAlt className="absolute left-4 top-4 text-zinc-500 text-xs" />
                                        <textarea
                                            rows={5}
                                            placeholder="Describe your setup, workflows, and timelines clearly..."
                                            value={proposalForm.coverNote}
                                            onChange={(e) => setProposalForm({ ...proposalForm, coverNote: e.target.value })}
                                            className="w-full bg-zinc-950 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-teal-500/50 transition-colors resize-none leading-relaxed"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-white/5 bg-zinc-900 sticky bottom-0 z-10">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="text-xs font-semibold text-zinc-400 hover:text-white px-4 py-2 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="text-xs bg-teal-500 text-black font-bold px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-teal-400 transition-colors"
                                        disabled={submittingProposal}
                                    >
                                        {submittingProposal ? "Submitting..." : "Submit Proposal"}
                                    </button>
                                </div>
                            </form>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskDetailsPage;