// ClientMyTaskComponent.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { FaBriefcase, FaClock, FaDollarSign, FaCalendarAlt, FaSearch } from 'react-icons/fa';
import { authClient } from "@/lib/auth-client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';


// Reusable Top Filter Row Component
const TopFilterSection = ({ title, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-2 border-b border-white/5 last:border-none">
    <h3 className="text-zinc-400 text-xs font-bold min-w-[100px]">{title}:</h3>
    <div className="flex flex-wrap items-center gap-4">{children}</div>
  </div>
);

// Elegant Individual Task Cards reading live MongoDB structural items
const TaskCard = ({ task, currentPath }) => {
  const formattedDate = task.deadline
    ? new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'No deadline';

  return (
    <div className="bg-zinc-900 border border-white/10 p-5 rounded-2xl hover:border-teal-500/50 transition-all flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-white font-bold text-lg leading-tight truncate max-w-[180px]" title={task.title}>
            {task.title}
          </h3>
          <span className="px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-full text-[11px] font-medium capitalize shrink-0">
            {task.status || "open"}
          </span>
        </div>
        <p className="text-zinc-400 text-sm mb-5 min-h-[40px] line-clamp-2">{task.description}</p>
      </div>

      <div>
        {/* Meta Labels Area */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-400 border-t border-white/5 pt-4">
          <span className="px-2 py-1 bg-white/5 rounded text-[11px] text-zinc-300 font-medium">
            {task.category || "General"}
          </span>
          <span className="flex items-center gap-1">
            <FaDollarSign className="text-teal-400 text-xs" />
            <strong className="text-zinc-200">{task.budget || "Flexible"}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <FaCalendarAlt className="text-zinc-500 text-xs" />
            {formattedDate}
          </span>
        </div>

        {/* Footer Details Action row */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5">
          <span className="text-zinc-500 text-xs">
            {task.proposals || 0} {task.proposals === 1 ? 'proposal' : 'proposals'}
          </span>
          <Link href={`${currentPath}/${task._id}`}>
            <button className="text-xs bg-teal-500/10 text-teal-400 px-4 py-1.5 rounded-xl hover:bg-teal-500 hover:text-black font-semibold transition-all cursor-pointer">
              View Details
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Core Dashboard View
const ClientMyTaskComponent = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentPath = usePathname();

  // Reading active session context
  const { data: session } = authClient.useSession();
  const userEmail = session?.user?.email;

  // INTERACTIVE FILTER STATES
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [budgetRange, setBudgetRange] = useState({ min: "", max: "" });

  // Reset All Filters Hook
  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedStatus("");
    setBudgetRange({ min: "", max: "" });
  };

  // Category Checkbox Handlers
  const handleCategoryChange = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  // 1. Debouncing Text Filter String input changes
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // 2. Fetcher Effect Engine mapping matching query parameter logic
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Prevent loading screen flickering if typing a live search keyword
        if (!searchQuery) {
          setLoading(true);
        }
        setError(null);

        const params = new URLSearchParams();
        
        // STAGE A: Enforce client isolation so they don't accidentally pull global task lists
        if (userEmail) params.append("email", userEmail);
        
        // STAGE B: Chain dashboard filter vectors smoothly
        if (debouncedSearch) params.append("search", debouncedSearch);
        if (selectedCategories.length > 0) params.append("category", selectedCategories.join(","));
        if (selectedStatus) params.append("status", selectedStatus.toLowerCase());
        if (budgetRange.min) params.append("minBudget", budgetRange.min);
        if (budgetRange.max) params.append("maxBudget", budgetRange.max);

        const response = await fetch(`http://localhost:8080/tasks?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch tasks from the database.");
        }

        const data = await response.json();
        setTasks(data);
      } catch (err) {
        console.error("Fetch tasks client side error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Only fire if backend session user data structure resolves successfully
    if (userEmail) {
      fetchTasks();
    }
  }, [userEmail, debouncedSearch, selectedCategories, selectedStatus, budgetRange.min, budgetRange.max]);

  return (
    <div className="p-6 md:p-10 bg-zinc-950 min-h-screen text-zinc-100 flex flex-col gap-6 max-w-7xl mx-auto">

      {/* HEADER BAR: Title Summary & Action Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">My Tasks</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage all your posted tasks</p>
        </div>
        <Link href={'/dashboard/client/post-task'}>
          <button className="bg-linear-to-br from-teal-400 to-yellow-400 text-zinc-950 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/5 text-sm transition-all active:scale-98 cursor-pointer">
            <span className="text-base font-extrabold">+</span> Post New Task
          </button>
        </Link>
      </div>

      {/* SEARCH CONTROL BAR */}
      <div className="relative flex items-center w-full bg-zinc-900/40 p-2 rounded-2xl border border-white/5">
        <FaSearch className="absolute left-6 text-zinc-500 text-sm" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tasks..."
          className="w-full bg-zinc-950/80 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-teal-500/50 placeholder:text-zinc-600 transition-colors"
        />
      </div>

      {/* HORIZONTAL TOP FILTERS PANEL */}
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-5 flex flex-col gap-2 shadow-xl">
        <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-2">
          <h2 className="text-sm font-bold text-white tracking-wide">Filter Options</h2>
          <button 
            onClick={handleReset}
            className="text-red-400 text-xs hover:underline bg-transparent border-none cursor-pointer"
          >
            Reset All
          </button>
        </div>

        {/* CATEGORIES SELECTION FILTER */}
        <TopFilterSection title="Category">
          {['Development', 'Marketing', 'Writing', 'Design', 'Other'].map((item) => (
            <label key={item} className="flex items-center gap-2 text-zinc-300 text-xs cursor-pointer hover:text-teal-400 transition-colors">
              <input 
                type="checkbox" 
                checked={selectedCategories.includes(item)}
                onChange={() => handleCategoryChange(item)}
                className="accent-teal-500 rounded border-white/10 bg-white/5" 
              />
              {item}
            </label>
          ))}
        </TopFilterSection>

        {/* BUDGET SPAN SELECTOR BOUNDS */}
        <TopFilterSection title="Budget">
          <div className="flex items-center gap-2 border-white/10">
            <span className="text-zinc-500 text-xs">Custom Range:</span>
            <input 
              type="number" 
              value={budgetRange.min}
              onChange={(e) => setBudgetRange(prev => ({ ...prev, min: e.target.value }))}
              placeholder="Min" 
              className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-center text-xs text-white outline-none focus:border-teal-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
            />
            <span className="text-zinc-600 text-xs">-</span>
            <input 
              type="number" 
              value={budgetRange.max}
              onChange={(e) => setBudgetRange(prev => ({ ...prev, max: e.target.value }))}
              placeholder="Max" 
              className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-center text-xs text-white outline-none focus:border-teal-500/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
            />
          </div>
        </TopFilterSection>

        {/* RADIO METRICS FIELD FOR STATUS MATCHING */}
        <TopFilterSection title="Status">
          {['Open', 'in_progress', 'Completed'].map((status) => (
            <label key={status} className="flex items-center gap-2 text-zinc-300 text-xs cursor-pointer hover:text-teal-400">
              <input 
                type="radio" 
                name="status-filter" 
                checked={selectedStatus === status}
                onChange={() => setSelectedStatus(status)}
                className="accent-teal-500" 
              />
              {status}
            </label>
          ))}
        </TopFilterSection>
      </div>

      {/* LIVE DB TASKS GRID DISPLAY */}
      {!userEmail ? (
        <div className="text-center py-12 text-zinc-500 text-sm animate-pulse">
          Authenticating dashboard context data stream...
        </div>
      ) : loading ? (
        <div className="text-center py-12 text-zinc-500 text-sm animate-pulse">
          Loading live tasks from collection...
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-400 text-sm">
          ⚠️ Error Loading Data: {error}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 text-sm border border-dashed border-white/10 rounded-2xl">
          No tasks found in your database tracking layout.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-2">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} currentPath={currentPath} />
          ))}
        </div>
      )}

    </div>
  );
};

export default ClientMyTaskComponent;