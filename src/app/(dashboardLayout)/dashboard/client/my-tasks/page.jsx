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

const Checkbox = ({ label }) => (
  <label className="flex items-center gap-2 text-zinc-300 text-xs cursor-pointer hover:text-teal-400 transition-colors">
    <input type="checkbox" className="accent-teal-500 rounded border-white/10 bg-white/5" />
    {label}
  </label>
);

// Elegant Individual Task Cards reading live MongoDB structural items
const TaskCard = ({ task, currentPath }) => {
  // Gracefully format dates coming from the database collection
  const formattedDate = task.deadline
    ? new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'No deadline';

    // console.log(task._id);

  return (
    <div className="bg-zinc-900 border border-white/10 p-5 rounded-2xl hover:border-teal-500/50 transition-all flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-white font-bold text-lg leading-tight">{task.title}</h3>
          <span className="px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-full text-[11px] font-medium capitalize">
            {task.status || "open"}
          </span>
        </div>
        <p className="text-zinc-400 text-sm mb-5 min-h-[20px] line-clamp-2">{task.description}</p>
      </div>

      <div>
        {/* Meta Labels Area */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-400 border-t border-white/5 pt-4">
          <span className="px-2 py-1 bg-white/5 rounded text-[11px] text-zinc-300 font-medium">
            {task.category}
          </span>
          <span className="flex items-center gap-1">
            <FaDollarSign className="text-teal-400 text-xs" />
            <strong className="text-zinc-200">{task.budget}</strong>
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
            <button className="text-xs bg-teal-500/10 text-teal-400 px-4 py-1.5 rounded-xl hover:bg-teal-500 hover:text-black font-semibold transition-all">
              View Details
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Core Dashboard View
const MyTasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentPath = usePathname(); 
  // console.log("I am currently at the route path:", currentPath);

  // Reading current active authenticated tracking session data
  const { data: session } = authClient.useSession();
  const userEmail = session?.user?.email;

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);

        // Construct API URL pointing to your running Express backend.
        // It passes userEmail query param if you only want tasks posted by this client.
        // If you want to see all system wide tasks, simply remove `?email=${userEmail}`
        let url = "http://localhost:8080/tasks";
        if (userEmail) {
          url += `?email=${userEmail}`;
        }

        const response = await fetch(url);
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

    fetchTasks();
  }, [userEmail]); // Re-fetches dynamically if tracking user context assignments adjust

  return (
    <div className="p-6 md:p-10 bg-zinc-950 min-h-screen text-zinc-100 flex flex-col gap-6 max-w-7xl mx-auto">

      {/* HEADER BAR: Title Summary & Action Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">My Tasks</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage all your posted tasks</p>
        </div>
        <button className="bg-linear-to-br from-teal-400 to-yellow-400 text-zinc-950 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/5 text-sm transition-all active:scale-98">
          <span className="text-base font-extrabold">+</span> Post New Task
        </button>
      </div>

      {/* SEARCH CONTROL BAR */}
      <div className="relative flex items-center w-full bg-zinc-900/40 p-2 rounded-2xl border border-white/5">
        <FaSearch className="absolute left-6 text-zinc-500 text-sm" />
        <input
          type="text"
          placeholder="Search tasks..."
          className="w-full bg-zinc-950/80 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-teal-500/50 placeholder:text-zinc-600 transition-colors"
        />
      </div>

      {/* HORIZONTAL TOP FILTERS PANEL */}
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-5 flex flex-col gap-2 shadow-xl">
        <div className="flex justify-between items-center mb-2 border-b border-white/10 pb-2">
          <h2 className="text-sm font-bold text-white tracking-wide">Filter Options</h2>
          <button className="text-red-400 text-xs hover:underline bg-transparent border-none cursor-pointer">Reset All</button>
        </div>

        <TopFilterSection title="Category">
          {['Development', 'Marketing', 'Writing', 'Design', 'Other'].map((item) => (
            <Checkbox key={item} label={item} />
          ))}
        </TopFilterSection>

        <TopFilterSection title="Budget">
          <Checkbox label="$0 - $100" />
          <Checkbox label="$100 - $500" />
          <Checkbox label="$500 - $1k" />
          <div className="flex items-center gap-2 sm:ml-4 border-l border-white/10 sm:pl-4">
            <span className="text-zinc-500 text-xs">Custom:</span>
            <input type="text" placeholder="Min" className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-center text-xs text-white outline-none focus:border-teal-500/50" />
            <span className="text-zinc-600 text-xs">-</span>
            <input type="text" placeholder="Max" className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-center text-xs text-white outline-none focus:border-teal-500/50" />
          </div>
        </TopFilterSection>

        <TopFilterSection title="Status">
          {['Open', 'In Progress', 'Completed'].map((status) => (
            <label key={status} className="flex items-center gap-2 text-zinc-300 text-xs cursor-pointer hover:text-teal-400">
              <input type="radio" name="status-filter" className="accent-teal-500" />
              {status}
            </label>
          ))}
        </TopFilterSection>
      </div>

      {/* LIVE DB TASKS GRID DISPLAY */}
      {loading ? (
        <div className="text-center py-12 text-zinc-500 text-sm animate-pulse">
          Loading live tasks from collection...
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-400 text-sm">
          ⚠️ Error Loading Data: {error}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 text-sm border border-dashed border-white/10 rounded-2xl">
          No tasks found in the database.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-2">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} currentPath= {currentPath} />
          ))}
        </div>
      )}

    </div>
  );
};

export default MyTasksPage;