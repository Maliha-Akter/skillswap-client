"use client";
import React from 'react';

const FilterSection = ({ title, children }) => (
  <div className="mb-6 border-b border-white/5 pb-5 last:border-none last:pb-0">
    <h3 className="text-white text-sm font-bold mb-3">{title}</h3>
    <div className="space-y-2.5">{children}</div>
  </div>
);

const JobFilterSidebar = ({
  selectedCategories,
  setSelectedCategories,
  selectedStatus,
  setSelectedStatus,
  budgetRange,
  setBudgetRange
}) => {

  const handleCategoryChange = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setSelectedStatus("");
    setBudgetRange({ min: "", max: "" });
  };

  return (
    <aside className="w-64 p-6 bg-zinc-950/80 backdrop-blur-xl border-r border-white/5 h-screen sticky top-0 overflow-y-auto hidden md:block">
      
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-white tracking-tight">Filters</h2>
        <button 
          onClick={handleReset}
          className="text-red-400 text-xs hover:underline bg-transparent border-none cursor-pointer"
        >
          Reset All
        </button>
      </div>

      {/* Filter 1: Task Categories */}
      <FilterSection title="Category">
        {['Development', 'Marketing', 'Writing', 'Design', 'Other'].map((cat) => (
          <label key={cat} className="flex items-center gap-2 text-zinc-400 text-xs cursor-pointer hover:text-teal-400 transition-colors">
            <input 
              type="checkbox" 
              checked={selectedCategories.includes(cat)}
              onChange={() => handleCategoryChange(cat)}
              className="accent-teal-500 rounded border-white/10 bg-white/5 w-3.5 h-3.5" 
            />
            {cat}
          </label>
        ))}
      </FilterSection>

      {/* Filter 2: Live Status Tracks */}
      <FilterSection title="Status">
        {['Open', 'in_progress', 'Completed'].map((status) => (
          <label key={status} className="flex items-center gap-2 text-zinc-400 text-xs cursor-pointer hover:text-teal-400 transition-colors">
            <input 
              type="radio" 
              name="status-filter"
              checked={selectedStatus.toLowerCase() === status.toLowerCase()}
              onChange={() => setSelectedStatus(status)}
              className="accent-teal-500 w-3.5 h-3.5" 
            />
            {status}
          </label>
        ))}
      </FilterSection>

      {/* Filter 3: Budget Range Tiers */}
      <FilterSection title="Budget Range">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-zinc-400 text-xs cursor-pointer hover:text-teal-400 transition-colors">
            <input 
              type="radio" 
              name="budget-preset"
              checked={budgetRange.min === "0" && budgetRange.max === "100"}
              onChange={() => setBudgetRange({ min: "0", max: "100" })}
              className="accent-teal-500 w-3.5 h-3.5"
            />
            $0 - $100
          </label>
          <label className="flex items-center gap-2 text-zinc-400 text-xs cursor-pointer hover:text-teal-400 transition-colors">
            <input 
              type="radio" 
              name="budget-preset"
              checked={budgetRange.min === "100" && budgetRange.max === "500"}
              onChange={() => setBudgetRange({ min: "100", max: "500" })}
              className="accent-teal-500 w-3.5 h-3.5"
            />
            $100 - $500
          </label>
          <label className="flex items-center gap-2 text-zinc-400 text-xs cursor-pointer hover:text-teal-400 transition-colors">
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
        
        {/* Custom Bounds Block */}
        <div className="pt-4 space-y-2">
          <span className="text-zinc-500 text-[11px] block font-medium">Custom Range:</span>
          <div className="flex gap-2 items-center">
            <input 
              type="number" 
              placeholder="Min" 
              value={budgetRange.min}
              onChange={(e) => setBudgetRange({ ...budgetRange, min: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-center text-xs text-white outline-none focus:border-teal-500/50 transition-colors placeholder:text-zinc-600" 
            />
            <span className="text-zinc-600 text-xs">-</span>
            <input 
              type="number" 
              placeholder="Max" 
              value={budgetRange.max}
              onChange={(e) => setBudgetRange({ ...budgetRange, max: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-center text-xs text-white outline-none focus:border-teal-500/50 transition-colors placeholder:text-zinc-600" 
            />
          </div>
        </div>
      </FilterSection>

    </aside>
  );
};

export default JobFilterSidebar;