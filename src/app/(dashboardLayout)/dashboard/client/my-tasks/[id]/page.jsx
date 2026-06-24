"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaDollarSign, FaCalendarAlt, FaTrashAlt, FaEdit, FaCheck, FaArrowLeft } from 'react-icons/fa';

// 1. Receive params directly as a prop from Next.js
const TaskDetailsPage = ({ params }) => {
    const router = useRouter();
    
    // 2. Unwrap the ID securely from the params promise wrapper
    const id = React.use(params).id;

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Edit states
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        title: '',
        description: '',
        category: '',
        budget: ''
    });

    useEffect(() => {
        if (!id) return;

        const fetchTaskDetails = async () => {
            try {
                setLoading(true);
                
                // Hits your direct backend endpoint safely
                const response = await fetch(await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${id}`));
                if (!response.ok) {
                    throw new Error("Could not find this task in the database.");
                }
                
                const matchedTask = await response.json();

                setTask(matchedTask);
                setEditData({
                    title: matchedTask.title,
                    description: matchedTask.description,
                    category: matchedTask.category,
                    budget: matchedTask.budget
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTaskDetails();
    }, [id]);

    // Handler to save text modifications (Only if status is "open")
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
            alert("Task updated successfully in the database!");
        } catch (err) {
            alert(`Update Error: ${err.message}`);
        }
    };

    // Handler to completely remove a task document (Only if proposals === 0)
    const handleDeleteTask = async () => {
        if (task.proposals && task.proposals > 0) {
            alert("Action Blocked: You cannot delete a task that already has active proposals submitted.");
            return;
        }

        const confirmDelete = window.confirm("Are you sure you want to permanently delete this task block?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:8080/tasks/${id}`, {
                method: "DELETE"
            });

            if (!response.ok) throw new Error("Server rejected deletion request.");

            alert("Task deleted cleanly from collection.");
            router.push('/my-tasks'); 
        } catch (err) {
            alert(`Delete Error: ${err.message}`);
        }
    };

    if (loading) return <div className="text-center py-20 bg-zinc-950 text-zinc-500 animate-pulse">Loading task schema fields...</div>;
    if (error) return <div className="text-center py-20 bg-zinc-950 text-red-400">⚠️ Error: {error}</div>;
    if (!task) return null;

    const isOpen = task.status?.toLowerCase() === 'open';
    const hasProposals = task.proposals > 0;

    return (
        <div className="bg-zinc-950 min-h-screen text-zinc-100 p-6 md:p-10">
            <div className="max-w-4xl mx-auto flex flex-col gap-6">
                
                {/* Back button Navigation */}
                <button 
                    onClick={() => router.back()} 
                    className="flex items-center gap-2 text-zinc-400 hover:text-teal-400 text-sm w-fit transition-colors"
                >
                    <FaArrowLeft /> Back to Tasks
                </button>

                {/* Main Task Profile View Grid */}
                <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 md:p-8 shadow-xl flex flex-col gap-6">
                    
                    {/* Top status banner info */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-full text-xs font-bold capitalize">
                                Status: {task.status || "open"}
                            </span>
                            <span className="text-zinc-500 text-xs">
                                Created: {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>

                        {/* Action controllers */}
                        <div className="flex items-center gap-2">
                            {isOpen && !isEditing && (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-1.5 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-3 py-2 rounded-xl border border-white/10 transition-colors"
                                >
                                    <FaEdit className="text-teal-400" /> Edit Content
                                </button>
                            )}

                            <button 
                                onClick={handleDeleteTask}
                                disabled={hasProposals}
                                className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border transition-all ${
                                    hasProposals 
                                    ? 'bg-zinc-800/50 text-zinc-600 border-white/5 cursor-not-allowed' 
                                    : 'bg-red-500/10 hover:bg-red-500 hover:text-black text-red-400 border-red-500/20'
                                }`}
                            >
                                <FaTrashAlt /> Delete Task
                            </button>
                        </div>
                    </div>

                    {/* Content Section Form */}
                    {isEditing ? (
                        <form onSubmit={handleUpdateTask} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-400 mb-1">Task Title</label>
                                <input 
                                    type="text" 
                                    value={editData.title}
                                    onChange={(e) => setEditData({...editData, title: e.target.value})}
                                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500/50"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-zinc-400 mb-1">Description</label>
                                <textarea 
                                    rows={5}
                                    value={editData.description}
                                    onChange={(e) => setEditData({...editData, description: e.target.value})}
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
                                        onChange={(e) => setEditData({...editData, category: e.target.value})}
                                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500/50"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-zinc-400 mb-1">Budget ($)</label>
                                    <input 
                                        type="number" 
                                        value={editData.budget}
                                        onChange={(e) => setEditData({...editData, budget: e.target.value})}
                                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-teal-500/50"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setIsEditing(false)}
                                    className="text-xs bg-transparent hover:bg-white/5 text-zinc-400 px-4 py-2 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="text-xs bg-teal-500 text-black font-semibold px-4 py-2 rounded-xl flex items-center gap-1 hover:bg-teal-400 transition-colors"
                                >
                                    <FaCheck /> Save Changes
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="flex flex-col gap-4">
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{task.title}</h1>
                                <p className="text-zinc-400 text-sm mt-3 leading-relaxed whitespace-pre-wrap">{task.description}</p>
                            </div>

                            {/* Info Meta Specs Area */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-950 p-4 rounded-xl border border-white/5 mt-4">
                                <div>
                                    <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Category</span>
                                    <span className="text-zinc-200 text-sm font-medium">{task.category}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Budget</span>
                                    <span className="text-teal-400 text-sm font-bold flex items-center gap-0.5">
                                        <FaDollarSign className="text-xs" /> {task.budget}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Deadline</span>
                                    <span className="text-zinc-300 text-xs flex items-center gap-1 mt-0.5">
                                        <FaCalendarAlt className="text-zinc-500" /> {task.deadline ? new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Proposals</span>
                                    <span className="text-zinc-300 text-sm font-medium">{task.proposals || 0} active</span>
                                </div>
                            </div>
                            
                            {!isOpen && (
                                <p className="text-zinc-500 text-xs italic mt-2">
                                    * Editing text content options are disabled because this task status is no longer set to 'Open'.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TaskDetailsPage;