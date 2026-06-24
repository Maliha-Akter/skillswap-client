"use client";
import React from 'react';

const FilterSection = ({ title, children }) => (
  <div className="mb-6 border-b border-white/5 pb-5 last:border-none last:pb-0">
    <h3 className="text-white text-sm font-bold mb-3">{title}</h3>
    <div className="space-y-2.5">{children}</div>
  </div>
);

const Checkbox = ({ label, name }) => (
  <label className="flex items-center gap-2 text-zinc-400 text-xs cursor-pointer hover:text-teal-400 transition-colors">
    <input 
      type="checkbox" 
      name={name}
      className="accent-teal-500 rounded border-white/10 bg-white/5 w-3.5 h-3.5" 
    />
    {label}
  </label>
);

const JobFilterSidebar = () => {
  return (
    <aside className="w-64 p-6 bg-zinc-950/80 backdrop-blur-xl border-r border-white/5 h-screen sticky top-0 overflow-y-auto hidden md:block">
      
      {/* Sidebar Header Row */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-white tracking-tight">Filters</h2>
        <button className="text-red-400 text-xs hover:underline bg-transparent border-none cursor-pointer">
          Reset All
        </button>
      </div>

      {/* Filter 1: Task Categories */}
      <FilterSection title="Category">
        {['Development', 'Marketing', 'Writing', 'Design', 'Other'].map((item) => (
          <Checkbox key={item} label={item} name="category" />
        ))}
      </FilterSection>

      {/* Filter 2: Live Status Tracks */}
      <FilterSection title="Status">
        {['Open', 'In Progress', 'Completed'].map((status) => (
          <label key={status} className="flex items-center gap-2 text-zinc-400 text-xs cursor-pointer hover:text-teal-400 transition-colors">
            <input 
              type="radio" 
              name="status-filter" 
              className="accent-teal-500 w-3.5 h-3.5" 
            />
            {status}
          </label>
        ))}
      </FilterSection>

      {/* Filter 3: Budget Range Tiers */}
      <FilterSection title="Budget Range">
        <Checkbox label="$0 - $100" name="budget-tier" />
        <Checkbox label="$100 - $500" name="budget-tier" />
        <Checkbox label="$500 - $1k" name="budget-tier" />
        
        {/* Custom Bounds Block */}
        <div className="pt-2 space-y-2">
          <span className="text-zinc-500 text-[11px] block font-medium">Custom Range:</span>
          <div className="flex gap-2 items-center">
            <input 
              type="text" 
              placeholder="Min" 
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-center text-xs text-white outline-none focus:border-teal-500/50 transition-colors placeholder:text-zinc-600" 
            />
            <span className="text-zinc-600 text-xs">-</span>
            <input 
              type="text" 
              placeholder="Max" 
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-center text-xs text-white outline-none focus:border-teal-500/50 transition-colors placeholder:text-zinc-600" 
            />
          </div>
        </div>
      </FilterSection>

    </aside>
  );
};

export default JobFilterSidebar;