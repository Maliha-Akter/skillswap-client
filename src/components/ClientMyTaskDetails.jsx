"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaDollarSign, FaCalendarAlt, FaTrashAlt, FaEdit, FaCheck, FaArrowLeft, FaSpinner, FaStar, FaFileInvoiceDollar, FaExclamationTriangle } from 'react-icons/fa';
import { authClient, useSession } from '@/lib/auth-client';
import { toast } from 'react-toastify';
import { Spinner } from "@heroui/react";

// --- Reusable Custom Confirmation Modal ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, isDanger }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Overlay */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal Body */}
            <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 p-6 text-left shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                    <FaExclamationTriangle className={isDanger ? "text-red-500 text-xl" : "text-emerald-400 text-xl"} />
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                </div>

                <p className="mt-4 text-sm text-zinc-400 leading-relaxed">
                    {message}
                </p>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`rounded-xl px-4 py-2 text-xs font-bold transition-colors ${isDanger
                                ? "bg-red-600 text-white hover:bg-red-500"
                                : "bg-emerald-600 text-black hover:bg-emerald-500"
                            }`}
                    >
                        {confirmText || 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ClientMyTaskDetails = ({ params }) => {
    const router = useRouter();

    // Safely unwrap params using React.use() for Next.js App Router compliance
    const unwrappedParams = React.use(params);
    const id = unwrappedParams?.id;

    // --- SESSION ASSIGNMENT ---
    const { data: session } = useSession();
    const clientEmail = session?.user?.email;

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- MODAL STATE CONFIGURATION ---
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: '',
        isDanger: false,
        onConfirm: () => { }
    });

    const openModal = (config) => setModalConfig({ ...config, isOpen: true });
    const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

    // Proposals Pipeline State
    const [proposalsData, setProposalsData] = useState({ total: 0, proposals: [] });
    const [loadingProposals, setLoadingProposals] = useState(true);

    // Review Persistent State
    const [existingReview, setExistingReview] = useState(null);

    // Edit states
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        title: '',
        description: '',
        category: '',
        budget: ''
    });

    // Review Component Form State
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewData, setReviewData] = useState({
        rating: 'Good',
        comment: '',
        reviewerEmail: clientEmail,
        revieweeEmail: ''
    });

    useEffect(() => {
        if (clientEmail) {
            setReviewData(prev => ({ ...prev, reviewerEmail: clientEmail }));
        }
    }, [clientEmail]);

    useEffect(() => {
        if (!id) return;

        const fetchTaskDetailsAndProposals = async () => {
            try {
                setLoading(true);

                // Fetch the client token dynamically first
                const { data: tokenData } = await authClient.token();
                const token = tokenData?.token;

                // Prepare common headers for authenticated requests
                const authHeaders = {
                    "Content-Type": "application/json",
                    ...(token && { "authorization": `Bearer ${token}` })
                };

                // 1. Fetch main task payload (PUBLIC)
                const taskResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${id}`,
                    {
                        headers: {
                            // Safe check: Only passes bearer token if it actually exists
                            ...(token && { "Authorization": `Bearer ${token}` })
                        }
                    }
                );
                if (!taskResponse.ok) {
                    throw new Error("Could not find this task in the database.");
                }
                const matchedTask = await taskResponse.json();
                setTask(matchedTask);
                console.log("=== Debug: Task Status ===", matchedTask.status);

                setEditData({
                    title: matchedTask.title || '',
                    description: matchedTask.description || '',
                    category: matchedTask.category || '',
                    budget: matchedTask.budget || ''
                });

                // 2. Fetch associated proposals data pipeline (PRIVATE - Token Applied)
                try {
                    const propResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${id}/proposals`, {
                        headers: authHeaders
                    });
                    if (propResponse.ok) {
                        const propsJson = await propResponse.json();
                        setProposalsData(propsJson);
                    }
                } catch (propErr) {
                    console.error("Failed to load proposals dynamically:", propErr);
                }

                // 3. Fetch Review Configuration & Accepted Freelancer Match (PRIVATE - Token Applied)
                if (matchedTask.status?.toLowerCase() === 'completed') {
                    try {
                        const reviewResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews?taskId=${id}`, {
                            headers: authHeaders
                        });
                        if (reviewResponse.ok) {
                            const reviewContainer = await reviewResponse.json();

                            if (reviewContainer) {
                                if (reviewContainer.review) {
                                    setExistingReview(reviewContainer.review);
                                }
                                if (reviewContainer.revieweeEmail) {
                                    setReviewData(prev => ({
                                        ...prev,
                                        revieweeEmail: reviewContainer.revieweeEmail
                                    }));
                                }
                            }
                        }
                    } catch (reviewErr) {
                        console.error("Failed to fetch existing review setup:", reviewErr);
                    }
                }

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
                setLoadingProposals(false);
            }
        };

        fetchTaskDetailsAndProposals();
    }, [id]);

    const handleUpdateTask = async (e) => {
        e.preventDefault();
        if (task.status?.toLowerCase() !== 'open') {
            toast.error("Action Blocked: You can only edit task details while the listing status is still 'Open'.");
            return;
        }

        try {
            setIsSubmitting(true);

            // Fetch Token dynamically
            const { data: tokenData } = await authClient.token();
            const token = tokenData?.token;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${id}/edit`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { "authorization": `Bearer ${token}` })
                },
                body: JSON.stringify(editData),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Failed to update task.");

            setTask(prev => ({ ...prev, ...editData }));
            setIsEditing(false);
            toast.success("Task updated successfully!");
        } catch (err) {
            toast.error(`Update Error: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Refactored to execute AFTER custom modal validation approval
    const executeDeleteTask = async () => {
        try {
            setIsSubmitting(true);

            const { data: tokenData } = await authClient.token();
            const token = tokenData?.token;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { "authorization": `Bearer ${token}` })
                },
            });

            if (!response.ok) throw new Error("Server rejected deletion request.");
            router.push('/dashboard/client/my-tasks');
            toast("Task deleted cleanly from collection.");

        } catch (err) {
            toast.error(`Delete Error: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTask = () => {
        const currentStatus = task.status?.toLowerCase();
        if (currentStatus !== 'open' && currentStatus !== 'pending') {
            toast.error("Action Blocked: You cannot delete a task after a freelancer's proposal has already been accepted.");
            return;
        }

        openModal({
            title: 'Delete Task Listing',
            message: 'Are you sure you want to permanently delete this task listing? This action cannot be undone.',
            confirmText: 'Delete Permanently',
            isDanger: true,
            onConfirm: executeDeleteTask
        });
    };

    // Refactored to execute AFTER custom modal validation approval
    const executeStatusSubmit = async () => {
        try {
            setIsSubmitting(true);

            const { data: tokenData } = await authClient.token();
            const token = tokenData?.token;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${id}/complete`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { "authorization": `Bearer ${token}` })
                },
                body: JSON.stringify({ email: clientEmail }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Failed to update status.");

            setTask(prev => ({ ...prev, status: 'completed' }));
            toast.success("Task marked as completed successfully!");

            // Next.js refresh to synchronize data
            // router.refresh();
            window.location.reload();
        } catch (err) {
            toast.error(`Status Update Error: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusSubmit = () => {
        openModal({
            title: 'Complete Project Listing',
            message: 'Are you sure you want to mark this task as completed? This transfers milestones configurations forward into evaluations processes.',
            confirmText: 'Mark Completed',
            isDanger: false,
            onConfirm: executeStatusSubmit
        });
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!reviewData.revieweeEmail) {
            toast.error("Error: No accepted freelancer was found for this task to leave a review for.");
            return;
        }

        try {
            setReviewLoading(true);

            // Fetch Token dynamically
            const { data: tokenData } = await authClient.token();
            const token = tokenData?.token;

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { "authorization": `Bearer ${token}` })
                },
                body: JSON.stringify({
                    taskId: id,
                    ...reviewData
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Could not save review.");

            toast.success("Review recorded successfully!");
            setExistingReview({
                rating: reviewData.rating,
                comment: reviewData.comment,
                reviewerEmail: reviewData.reviewerEmail,
                revieweeEmail: reviewData.revieweeEmail
            });
        } catch (err) {
            toast.success(`Review Error: ${err.message}`);
        } finally {
            setReviewLoading(false);
        }
    };

    if (loading) return <div className="text-center py-20 bg-zinc-950 text-zinc-500 animate-pulse">Loading task fields...</div>;
    if (error) return <div className="text-center py-20 bg-zinc-950 text-red-400">⚠️ Error: {error}</div>;
    if (!task) return null;

    const isOpen = task.status?.toLowerCase() === 'open';
    const isInProgress = task.status === 'in_progress';
    const isCompleted = task.status?.toLowerCase() === 'completed';
    const isDeletable = task.status?.toLowerCase() === 'open' || task.status?.toLowerCase() === 'pending';
    const shouldDisableDelete = !isDeletable || isSubmitting;

    const getStars = (rating) => {
        switch (rating?.toLowerCase()) {
            case 'excellent': return '⭐⭐⭐⭐⭐';
            case 'good': return '⭐⭐⭐⭐';
            case 'average': return '⭐⭐⭐';
            case 'poor': return '⭐⭐';
            case 'very poor': return '⭐';
            default: return rating || '⭐⭐⭐⭐';
        }
    };

    return (
        <div className="bg-zinc-950 min-h-screen text-zinc-100 p-6 md:p-10">
            {/* Modal Injection */}
            <ConfirmationModal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
                confirmText={modalConfig.confirmText}
                isDanger={modalConfig.isDanger}
            />

            <div className="max-w-4xl mx-auto flex flex-col gap-6">

                {/* Back Link */}
                <button
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 text-zinc-400 hover:text-teal-400 text-sm w-fit transition-colors disabled:opacity-50"
                >
                    <FaArrowLeft /> Back to Tasks
                </button>

                {/* Main Content Info Block */}
                <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl flex flex-col gap-6">

                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 border rounded-full text-xs font-bold capitalize ${isCompleted ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-teal-500/10 border-teal-500/20 text-teal-400'
                                }`}>
                                Status: {task.status || "open"}
                            </span>
                            <span className="text-zinc-500 text-xs">
                                Created: {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            {isOpen && !isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    disabled={isSubmitting}
                                    className="flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-2 rounded-xl border border-white/10 transition-colors"
                                >
                                    <FaEdit className="text-teal-400" /> Edit Content
                                </button>
                            )}
                            {isInProgress && (
                                <button
                                    onClick={handleStatusSubmit}
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 text-xs bg-emerald-600 hover:bg-emerald-500 text-black font-bold px-3 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Spinner size="sm" color="current" />
                                            <span>Completing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FaCheck />
                                            <span>Mark as Complete</span>
                                        </>
                                    )}
                                </button>
                            )}

                            <button
                                onClick={handleDeleteTask}
                                disabled={shouldDisableDelete}
                                className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border transition-all ${shouldDisableDelete
                                    ? 'bg-zinc-800/50 text-zinc-600 border-white/5 cursor-not-allowed'
                                    : 'bg-red-500/10 hover:bg-red-500 hover:text-black text-red-400 border-red-500/20'
                                    }`}
                            >
                                {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaTrashAlt />} Delete Task
                            </button>
                        </div>
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleUpdateTask} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 mb-1">Task Title</label>
                                <input
                                    type="text"
                                    value={editData.title}
                                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500/50"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 mb-1">Description</label>
                                <textarea
                                    rows={5}
                                    value={editData.description}
                                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500/50"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 mb-1">Category</label>
                                    <input
                                        type="text"
                                        value={editData.category}
                                        onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500/50"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 mb-1">Budget ($)</label>
                                    <input
                                        type="number"
                                        value={editData.budget}
                                        onChange={(e) => setEditData({ ...editData, budget: e.target.value ? Number(e.target.value) : '' })}
                                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500/50"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-2">
                                <button type="button" onClick={() => setIsEditing(false)} className="text-xs bg-transparent text-zinc-400 px-4 py-2 rounded-xl">Cancel</button>
                                <button type="submit" className="text-xs bg-teal-500 text-black font-semibold px-4 py-2 rounded-xl flex items-center gap-1"><FaCheck /> Save Changes</button>
                            </div>
                        </form>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{task.title}</h1>
                                <p className="text-zinc-400 text-sm mt-3 leading-relaxed whitespace-pre-wrap">{task.description}</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-950 p-4 rounded-xl border border-white/5 mt-4">
                                <div>
                                    <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Category</span>
                                    <span className="text-zinc-200 text-sm font-medium">{task.category}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Budget</span>
                                    <span className="text-teal-400 text-sm font-bold flex items-center gap-0.5">
                                        <FaDollarSign className="text-xs" /> {task.budget}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Deadline</span>
                                    <span className="text-zinc-300 text-xs flex items-center gap-1 mt-0.5">
                                        <FaCalendarAlt className="text-zinc-500" /> {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Proposals</span>
                                    <span className="text-zinc-300 text-sm font-medium">{proposalsData.total} submitted</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Evaluation Review Panel */}
                {isCompleted && (
                    <div className="bg-zinc-900 border border-emerald-500/20 rounded-2xl p-6 md:p-8 shadow-xl flex flex-col gap-4">
                        <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                            <FaStar className="text-emerald-400 text-lg" />
                            <h2 className="text-lg font-bold text-white">Project Completion Feedback</h2>
                        </div>

                        {existingReview ? (
                            <div className="bg-zinc-950 border border-white/5 p-5 rounded-xl flex flex-col gap-3">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex flex-col gap-1">
                                        <div>
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block">Reviewer (Client)</span>
                                            <span className="text-xs text-zinc-300 font-mono">{existingReview.reviewerEmail || 'N/A'}</span>
                                        </div>
                                        <div className="mt-1">
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block">Reviewee (Freelancer)</span>
                                            <span className="text-xs text-teal-400 font-mono">{existingReview.revieweeEmail || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-xl text-xs text-emerald-400 font-bold self-start">
                                        {getStars(existingReview.rating)}
                                    </div>
                                </div>
                                <div className="border-t border-white/5 pt-3 mt-1">
                                    <span className="block text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-1">Performance Comments</span>
                                    <p className="text-zinc-300 text-sm leading-relaxed italic">
                                        "{existingReview.comment || 'No structural notes shared.'}"
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                                {reviewData.revieweeEmail && (
                                    <div className="bg-zinc-950 p-3 rounded-xl border border-white/5 text-xs text-zinc-400">
                                        Leaving a review for assigned freelancer:{' '}
                                        <span className="text-teal-400 font-mono font-bold">{reviewData.revieweeEmail}</span>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 mb-1.5">Rating Metric Selection</label>
                                    <select
                                        value={reviewData.rating}
                                        onChange={(e) => setReviewData({ ...reviewData, rating: e.target.value })}
                                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-zinc-200 outline-none focus:border-emerald-500/50"
                                    >
                                        <option value="Excellent">Excellent ⭐⭐⭐⭐⭐</option>
                                        <option value="Good">Good ⭐⭐⭐⭐</option>
                                        <option value="Average">Average ⭐⭐⭐</option>
                                        <option value="Poor">Poor ⭐⭐</option>
                                        <option value="Very Poor">Very Poor ⭐</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 mb-1.5">Review Commentary</label>
                                    <textarea
                                        rows={3}
                                        value={reviewData.comment}
                                        onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                        placeholder="Add written performance assessment details..."
                                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500/50"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="text-xs bg-emerald-500 text-black font-bold px-5 py-2.5 rounded-xl w-fit flex items-center gap-1.5 hover:bg-emerald-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {reviewLoading ? <FaSpinner className="animate-spin" /> : "Submit Review"}
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {/* Proposals Data Module */}
                <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                            <FaFileInvoiceDollar className="text-teal-400 text-lg" />
                            <h2 className="text-lg font-bold text-white">Incoming Proposals</h2>
                        </div>
                        <span className="text-xs px-2.5 py-1 bg-zinc-950 border border-white/5 text-zinc-400 rounded-lg font-mono">
                            Total: {proposalsData.total}
                        </span>
                    </div>

                    {loadingProposals ? (
                        <div className="text-center py-6 text-xs text-zinc-500 animate-pulse">Filtering relevant items...</div>
                    ) : proposalsData.proposals.length === 0 ? (
                        <p className="text-zinc-500 text-xs italic py-2">No custom layout proposals have targeted this listing parameters yet.</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {proposalsData.proposals.map((prop, idx) => (
                                <div key={prop._id || idx} className="bg-zinc-950 p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex flex-col gap-1">
                                        <div className="text-sm font-semibold text-zinc-200">
                                            {prop.freelancer_email || `Freelancer Profile Row ${idx + 1}`}
                                        </div>
                                        <p className="text-zinc-400 text-xs line-clamp-2 pr-4">{prop.cover_note || "No proposal summary provided."}</p>
                                        <span className="text-[10px] text-zinc-600">
                                            Submitted: {prop.submitted_at ? new Date(prop.submitted_at).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 min-w-[120px]">
                                        <div className="text-teal-400 text-sm font-bold flex items-center">
                                            <FaDollarSign className="text-xs" />{prop.proposed_budget || "0"}
                                        </div>
                                        <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border ${prop.status?.toLowerCase() === 'approved' || prop.status?.toLowerCase() === 'accepted'
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                            : prop.status?.toLowerCase() === 'rejected'
                                                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                                : 'bg-zinc-800 border-white/10 text-zinc-400'
                                            }`}>
                                            {prop.status || 'pending'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ClientMyTaskDetails;