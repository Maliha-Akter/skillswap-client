"use client";
import React from 'react';
import { FaMapMarkerAlt, FaBriefcase, FaClock, FaDollarSign, FaCalendarAlt, FaSearch } from 'react-icons/fa';

// Mock Data matching image_35cdc1.png using dark mode styling
const MOCK_TASKS = [
  {
    id: 1,
    title: "Rashed test 5",
    description: "This for the test",
    category: "Marketing",
    budget: "$300",
    deadline: "Jun 30, 2026",
    status: "Open",
    proposals: 1
  },
  {
    id: 2,
    title: "Rashed test 4",
    description: "This for the test",
    category: "Development",
    budget: "$300",
    deadline: "Jun 27, 2026",
    status: "Open",
    proposals: 1
  },
  {
    id: 3,
    title: "Rashed Test 3",
    description: "This for test",
    category: "Writing",
    budget: "$200",
    deadline: "Jun 30, 2026",
    status: "Open",
    proposals: 1
  },
  {
    id: 4,
    title: "Culpa nisi quisquam",
    description: "Consectetur vel fugi",
    category: "Marketing",
    budget: "$27",
    deadline: "Jun 23, 2026",
    status: "Open",
    proposals: 0
  }
];

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

// Elegant Individual Task Cards matching the layout details
const TaskCard = ({ task }) => (
  <div className="bg-zinc-900 border border-white/10 p-5 rounded-2xl hover:border-teal-500/50 transition-all flex flex-col justify-between">
    <div>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-white font-bold text-lg leading-tight">{task.title}</h3>
        <span className="px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-full text-[11px] font-medium">
          {task.status}
        </span>
      </div>
      <p className="text-zinc-400 text-sm mb-5 min-h-[20px]">{task.description}</p>
    </div>

    <div>
      {/* Meta Labels Area */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-400 border-t border-white/5 pt-4">
        <span className="px-2 py-1 bg-white/5 rounded text-[11px] text-zinc-300 font-medium">
          {task.category}
        </span>
        <span className="flex items-center gap-1">
          <FaDollarSign className="text-teal-400 text-xs" />
          <strong className="text-zinc-200">{task.budget.replace('$', '')}</strong>
        </span>
        <span className="flex items-center gap-1.5">
          <FaCalendarAlt className="text-zinc-500 text-xs" />
          {task.deadline}
        </span>
      </div>

      {/* Footer Details Action row */}
      <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5">
        <span className="text-zinc-500 text-xs">
          {task.proposals} {task.proposals === 1 ? 'proposal' : 'proposals'}
        </span>
        <button className="text-xs bg-teal-500/10 text-teal-400 px-4 py-1.5 rounded-xl hover:bg-teal-500 hover:text-black font-semibold transition-all active:scale-95">
          View Details
        </button>
      </div>
    </div>
  </div>
);

// Core Dashboard View
const MyTasksPage = () => {
  return (
    <div className="p-6 md:p-10 bg-zinc-950 min-h-screen text-zinc-100 flex flex-col gap-6 max-w-7xl mx-auto">
      
      {/* HEADER BAR: Title Summary & Action Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">My Tasks</h1>
          <p className="text-sm text-zinc-400 mt-1">Manage all your posted tasks</p>
        </div>
        <button className="bg-linear-to-br from-teal-400 to-yellow-400  text-zinc-950 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/5 text-sm transition-all active:scale-98">
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

      {/* FULL-WIDTH TASK CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-2">
        {MOCK_TASKS.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>

    </div>
  );
};

export default MyTasksPage;