"use client";
import React, { useState, useEffect } from 'react';
import { FaSearch, FaTrashAlt, FaFolderOpen, FaSlidersH, FaExclamationTriangle } from 'react-icons/fa';
import { authClient } from "@/lib/auth-client";
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

// ─── REUSABLE DELETE MODAL COMPONENT ──────────────────────────────────────
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, taskTitle, isDeleting }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-zinc-900 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4">
                <div className="flex items-center gap-3 text-red-400">
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <FaExclamationTriangle size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Safety Violation Dropping</h3>
                        <p className="text-xs text-zinc-400">This action cannot be undone.</p>
                    </div>
                </div>

                <p className="text-sm text-zinc-300 leading-relaxed">
                    Are you sure you want to permanently delete <span className="text-white font-semibold">"{taskTitle}"</span> from the global matrices for safety guideline breaches?
                </p>

                <div className="flex justify-end items-center gap-3 mt-2">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-800 border border-white/5 text-zinc-300 hover:bg-zinc-700 transition-all cursor-pointer disabled:opacity-40"
                    >
                        Cancel Actions
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-500 text-black font-bold hover:bg-red-400 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-40"
                    >
                        {isDeleting ? "Dropping Item..." : "Confirm Deletion"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Reusable Top Filter Row Wrapper
const TopFilterSection = ({ title, children }) => (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 py-1.5">
        <h3 className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider min-w-[90px]">{title}:</h3>
        <div className="flex flex-wrap items-center gap-3.5">{children}</div>
    </div>
);

// Individual Row Component
const TaskTableRow = ({ task, onDeleteRequest }) => {
    return (
        <tr className="border-b border-white/5 hover:bg-zinc-900/40 transition-colors duration-150">
            <td className="px-6 py-4 max-w-[220px]">
                <span className="text-white font-medium text-sm block truncate" title={task.title}>{task.title}</span>
            </td>
            <td className="px-6 py-4 text-sm text-zinc-400 capitalize">{task.category}</td>
            <td className="px-6 py-4 text-sm text-zinc-300 font-mono truncate max-w-[160px]" title={task.clientEmail || task.client}>
                {task.client_email || task.client || "N/A"}
            </td>
            <td className="px-6 py-4 text-sm font-semibold text-emerald-400 font-mono">${task.budget}</td>
            <td className="px-6 py-4">
                <span className={`px-2 py-0.5 border rounded-full text-[10px] font-mono tracking-wider font-bold inline-block uppercase ${
                    task.status?.toLowerCase() === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                    task.status?.toLowerCase() === 'in_progress' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                    'bg-teal-500/10 border-teal-500/20 text-teal-400'
                }`}>
                    {task.status === "in_progress" ? "In Progress" : task.status || "Open"}
                </span>
            </td>
            <td className="px-6 py-4 text-sm text-zinc-400 font-mono text-center">{task.proposalsCount || task.proposals || 0}</td>
            <td className="px-6 py-4 text-sm text-zinc-500 font-mono">
                {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : "Recent"}
            </td>
            <td className="px-6 py-4 text-right">
                <button
                    onClick={() => onDeleteRequest(task)}
                    className="p-2 rounded-xl text-red-400 border border-red-500/10 bg-red-500/5 hover:bg-red-500 hover:text-black transition-all cursor-pointer"
                    title="Delete task row due to safety guideline breach"
                >
                    <FaTrashAlt size={13} />
                </button>
            </td>
        </tr>
    );
};

export default function ManageTaskPage() {
    const router = useRouter();
    const { data: session } = authClient.useSession();
    const currentUser = session?.user;

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Modal Control Pipeline States
    const [modalConfig, setModalConfig] = useState({ isOpen: false, activeTask: null });
    const [isDeleting, setIsDeleting] = useState(false);

    // Filter parameters states
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [budgetRange, setBudgetRange] = useState({ min: "", max: "" });

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedSearch(searchQuery), 400);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    const handleReset = () => {
        setSearchQuery("");
        setSelectedCategories([]);
        setSelectedStatus("all");
        setBudgetRange({ min: "", max: "" });
    };

    const handleCategoryChange = (category) => {
        setSelectedCategories(prev =>
            prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
        );
    };

    const fetchTasksMatrix = async () => {
        if (!currentUser?.email) {
            console.log("==> [FRONTEND FETCH] Deferred: Awaiting user session context...");
            return; 
        }

        try {
            if (!searchQuery && tasks.length === 0) setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (debouncedSearch) params.append("search", debouncedSearch);
            if (selectedCategories.length > 0) params.append("categories", selectedCategories.join(","));
            if (selectedStatus && selectedStatus !== "all") params.append("status", selectedStatus);
            if (budgetRange.min) params.append("minBudget", budgetRange.min);
            if (budgetRange.max) params.append("maxBudget", budgetRange.max);

            const requestUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/tasks?${params.toString()}`;

            const tokenData = await authClient.token();
            const actualToken = tokenData?.token || tokenData?.data?.token || tokenData?.token?.token;

            if (!actualToken) {
                console.warn("⚠️ ==> Authorization token string missing for tasks fetch pipeline.");
                return;
            }

            const res = await fetch(requestUrl, {
                method: "GET",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${actualToken}`
                }
            });

            const result = await res.json();

            if (res.ok && result.success) {
                setTasks(result.data || []);
            } else {
                throw new Error(result.message || "Could not retrieve current tasks list.");
            }
        } catch (err) {
            console.error("❌ ==> [FRONTEND EXCEPTION CAUGHT]:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Open Modal Callback Anchor
    const triggerDeleteModal = (task) => {
        setModalConfig({ isOpen: true, activeTask: task });
    };

    const closeDeleteModal = () => {
        setModalConfig({ isOpen: false, activeTask: null });
    };

    const handleExecuteDelete = async () => {
        const taskId = modalConfig.activeTask?._id;
        if (!taskId) return;

        try {
            setIsDeleting(true);
            console.log(`==> [FRONTEND DELETE] Triggered termination pipeline for ID: ${taskId}`);
            
            const tokenData = await authClient.token();
            const actualToken = tokenData?.token || tokenData?.data?.token || tokenData?.token?.token;

            if (!actualToken) {
                toast.error("Session verification failed. Authentication missing.");
                setIsDeleting(false);
                return;
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/tasks/${taskId}`, { 
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${actualToken}`
                }
            });
            const result = await res.json();

            if (res.ok && result.success) {
                toast.success(result.message || "Task item dropped cleanly.");
                setTasks(prev => prev.filter(task => task._id !== taskId));
                closeDeleteModal();
            } else {
                toast.error(result.message || "Failed to alter task safety matrix.");
              }
        } catch (err) {
            console.error("❌ ==> [FRONTEND DELETE FAULT]:", err);
            toast.error("Internal connection exception during content removal.");
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        console.log("==> [LIFECYCLE TRIGGER] Current User Evaluation State:", { 
            email: currentUser?.email, 
            role: currentUser?.role 
        });

        if (currentUser && currentUser.role !== 'admin') {
            console.warn("⚠️ [AUTH BLOCK] Access denied. User is not admin. Redirecting to /unauthorized");
            router.push('/unauthorized');
            return;
        }
        if (currentUser?.email) {
            fetchTasksMatrix();
        } else {
            console.warn("⚠️ [FETCH SUSPENDED] Awaiting explicit validation context from authentication hook.");
        }
    }, [currentUser, debouncedSearch, selectedCategories, selectedStatus, budgetRange.min, budgetRange.max, router]);

    return (
        <div className="p-6 md:p-10 bg-zinc-950 min-h-screen text-zinc-100 flex flex-col gap-6 max-w-7xl mx-auto">
            {/* Inject Modal Interface */}
            <DeleteConfirmationModal 
                isOpen={modalConfig.isOpen}
                onClose={closeDeleteModal}
                onConfirm={handleExecuteDelete}
                taskTitle={modalConfig.activeTask?.title || ""}
                isDeleting={isDeleting}
            />

            {/* Title Block */}
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                    <FaFolderOpen className="text-teal-400" /> Manage Tasks Ledger
                </h1>
                <p className="text-sm text-zinc-400 mt-1">Audit public task postings, clean bad string texts, or drop violation items</p>
            </div>

            {/* Input Filter Bar */}
            <div className="relative flex items-center w-full bg-zinc-900/20 p-1.5 rounded-2xl border border-white/5 shadow-2xl">
                <FaSearch className="absolute left-6 text-zinc-500 text-sm" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter task objects using unique project dynamic title characters..."
                    className="w-full bg-zinc-950/80 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-teal-500/50 placeholder:text-zinc-600 transition-colors"
                />
            </div>

            {/* HORIZONTAL TOP FILTER PANEL BLOCK */}
            <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex flex-col gap-3.5 shadow-2xl">
                <div className="flex justify-between items-center mb-1 border-b border-white/5 pb-3">
                    <h2 className="text-sm font-bold text-white tracking-wider uppercase flex items-center gap-2">
                        <FaSlidersH className="text-zinc-400" /> Dynamic Filtering Pipeline
                    </h2>
                    <button 
                        onClick={handleReset}
                        className="text-red-400 text-xs font-semibold hover:text-red-300 transition-colors bg-transparent border-none cursor-pointer"
                    >
                        Reset All
                    </button>
                </div>

                {/* Filter 1: Task Categories Checklist */}
                <TopFilterSection title="Categories">
                    {['Development', 'Marketing', 'Writing', 'Design', 'Other'].map((cat) => (
                        <label key={cat} className="flex items-center gap-2 text-zinc-400 text-xs cursor-pointer hover:text-teal-400 select-none transition-colors">
                            <input 
                                type="checkbox" 
                                checked={selectedCategories.includes(cat)}
                                onChange={() => handleCategoryChange(cat)}
                                className="accent-teal-500 rounded border-white/10 bg-white/5 w-3.5 h-3.5" 
                            />
                            {cat}
                        </label>
                    ))}
                </TopFilterSection>

                {/* Filter 2: Live Status Tracks */}
                <TopFilterSection title="Track Status">
                    {['All', 'Open', 'in_progress', 'Completed'].map((status) => (
                        <label key={status} className="flex items-center gap-2 text-zinc-400 text-xs cursor-pointer hover:text-teal-400 select-none transition-colors">
                            <input 
                                type="radio" 
                                name="status-filter"
                                checked={selectedStatus.toLowerCase() === status.toLowerCase()}
                                onChange={() => setSelectedStatus(status)}
                                className="accent-teal-500 w-3.5 h-3.5" 
                            />
                            {status === 'in_progress' ? 'In Progress' : status}
                        </label>
                    ))}
                </TopFilterSection>

                {/* Filter 3: Budget Tiers & Custom Range inputs unified */}
                <TopFilterSection title="Budget Range">
                    <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                        <div className="flex items-center gap-3.5">
                            <label className="flex items-center gap-2 text-zinc-400 text-xs cursor-pointer hover:text-teal-400 select-none transition-colors">
                                <input 
                                    type="radio" 
                                    name="budget-preset"
                                    checked={budgetRange.min === "0" && budgetRange.max === "100"}
                                    onChange={() => setBudgetRange({ min: "0", max: "100" })}
                                    className="accent-teal-500 w-3.5 h-3.5"
                                />
                                $0 - $100
                            </label>
                            <label className="flex items-center gap-2 text-zinc-400 text-xs cursor-pointer hover:text-teal-400 select-none transition-colors">
                                <input 
                                    type="radio" 
                                    name="budget-preset"
                                    checked={budgetRange.min === "100" && budgetRange.max === "500"}
                                    onChange={() => setBudgetRange({ min: "100", max: "500" })}
                                    className="accent-teal-500 w-3.5 h-3.5"
                                />
                                $100 - $500
                            </label>
                            <label className="flex items-center gap-2 text-zinc-400 text-xs cursor-pointer hover:text-teal-400 select-none transition-colors">
                                <input 
                                    type="radio" 
                                    name="budget-preset"
                                    checked={budgetRange.min === "500" && budgetRange.max === "1000"}
                                    onChange={() => setBudgetRange({ min: "500", max: "1000" })}
                                    className="accent-teal-500 w-3.5 h-3.5"
                                />
                                $500 - $1k
                            </label>
                        </div>
                        
                        <div className="flex gap-1.5 items-center pl-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-white/5 pt-2 sm:pt-0">
                            <span className="text-zinc-500 text-[11px] font-medium mr-1">Custom:</span>
                            <input 
                                type="number" 
                                placeholder="Min" 
                                value={budgetRange.min}
                                onChange={(e) => setBudgetRange({ ...budgetRange, min: e.target.value })}
                                className="w-16 bg-zinc-950 border border-white/10 rounded-lg px-2 py-1 text-center text-xs text-white outline-none focus:border-teal-500/50 transition-colors placeholder:text-zinc-600" 
                            />
                            <span className="text-zinc-600 text-xs">-</span>
                            <input 
                                type="number" 
                                placeholder="Max" 
                                value={budgetRange.max}
                                onChange={(e) => setBudgetRange({ ...budgetRange, max: e.target.value })}
                                className="w-16 bg-zinc-950 border border-white/10 rounded-lg px-2 py-1 text-center text-xs text-white outline-none focus:border-teal-500/50 transition-colors placeholder:text-zinc-600" 
                            />
                        </div>
                    </div>
                </TopFilterSection>
            </div>

            {/* FULL WIDTH INTERACTIVE TABLE SECTION */}
            <div className="w-full overflow-x-auto rounded-2xl border border-white/10 bg-zinc-900/30 backdrop-blur-md shadow-2xl">
                {!currentUser?.email || loading ? (
                    <div className="text-center py-20 text-zinc-500 text-sm animate-pulse tracking-wide font-mono">
                        Syncing data cluster repositories...
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-red-400 text-sm font-mono bg-red-950/10 border border-red-500/10 rounded-2xl m-4">
                        ⚠️ Exception caught: {error}
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="text-center py-20 text-zinc-500 text-sm border border-dashed border-white/10 rounded-2xl m-4 font-mono">
                        No matched data items recorded inside database query matrices.
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 bg-zinc-900/80 text-zinc-400 text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Client</th>
                                <th className="px-6 py-4">Budget</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Proposals</th>
                                <th className="px-6 py-4">Created</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map((task) => (
                                <TaskTableRow 
                                    key={task._id} 
                                    task={task} 
                                    onDeleteRequest={triggerDeleteModal} 
                                />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}