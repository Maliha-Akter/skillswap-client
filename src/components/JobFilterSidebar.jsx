import React from 'react';

const FilterSection = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-white text-sm font-bold mb-3">{title}</h3>
    <div className="space-y-2">{children}</div>
  </div>
);

const Checkbox = ({ label }) => (
  <label className="flex items-center gap-2 text-zinc-400 text-xs cursor-pointer hover:text-teal-400">
    <input type="checkbox" className="accent-teal-500 rounded" />
    {label}
  </label>
);

const JobFilterSidebar = () => {
  return (
    <aside className="w-64 p-6 bg-zinc-950/80 backdrop-blur-xl border-r border-white/5 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-bold text-white">Filter</h2>
        <button className="text-red-400 text-xs hover:underline">Reset</button>
      </div>

      <FilterSection title="Job Location">
        <input 
          type="text" 
          placeholder="Jakarta, Indonesia" 
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none" 
        />
      </FilterSection>

      <FilterSection title="Job Position">
        <Checkbox label="On Site" />
        <Checkbox label="Remote" />
        <Checkbox label="Hybrid" />
      </FilterSection>

      <FilterSection title="Job Type">
        <Checkbox label="Fulltime" />
        <Checkbox label="Partime" />
        <Checkbox label="Freelance" />
        <Checkbox label="Contract" />
      </FilterSection>

      <FilterSection title="Salary Range">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <Checkbox label="$1k - $2k" />
          <Checkbox label="$3k - $4k" />
          <Checkbox label="$5k - $6k" />
          <label className="flex items-center gap-2 text-teal-400 text-xs font-bold">
            <input type="radio" name="salary" className="accent-teal-500" defaultChecked />
            Custom
          </label>
        </div>
        <div className="flex gap-2">
          <input type="text" placeholder="$7000" className="w-1/2 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-center text-xs text-white" />
          <input type="text" placeholder="$10000" className="w-1/2 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-center text-xs text-white" />
        </div>
      </FilterSection>

      <FilterSection title="Job Function">
        {['Product Designer', 'UI/UX Designer', 'Web Designer', 'Digital Designer', 'Graphic Designer', 'Interior Designer'].map((item) => (
          <Checkbox key={item} label={item} />
        ))}
      </FilterSection>
    </aside>
  );
};

export default JobFilterSidebar;