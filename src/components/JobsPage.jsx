import React from 'react';
import { FaMapMarkerAlt, FaBriefcase, FaClock, FaDollarSign } from 'react-icons/fa';

const MOCK_JOBS = [
  {
    id: 1,
    title: "UI/UX Designer",
    company: "Vista",
    type: "Fulltime",
    mode: "Onsite",
    salary: "$7000/hr",
    location: "Jakarta, IND"
  },
  {
    id: 2,
    title: "Product Designer",
    company: "Roundel",
    type: "Partime",
    mode: "Onsite",
    salary: "$8000/hr",
    location: "Bekasi, IND"
  },
  {
    id: 3,
    title: "Web Designer",
    company: "BMW",
    type: "Fulltime",
    mode: "Onsite",
    salary: "$9000/hr",
    location: "Medan, IND"
  }
];

const JobCard = ({ job }) => (
  <div className="bg-zinc-900 border border-white/10 p-5 rounded-2xl hover:border-teal-500/50 transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className="w-10 h-10 bg-teal-500/10 rounded-full flex items-center justify-center text-teal-400 font-bold">
        {job.company[0]}
      </div>
      <button className="text-zinc-500 hover:text-white">🔖</button>
    </div>
    <h3 className="text-white font-bold text-lg">{job.company}</h3>
    <p className="text-zinc-400 text-sm mb-3">{job.title}</p>
    
    <div className="flex gap-2 mb-4">
      <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-zinc-300">{job.mode}</span>
      <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-zinc-300">{job.type}</span>
    </div>

    <div className="flex justify-between items-center border-t border-white/5 pt-4">
      <span className="text-teal-400 font-bold text-sm">{job.salary}</span>
      <button className="text-xs bg-teal-500/10 text-teal-400 px-3 py-1 rounded-lg hover:bg-teal-500 hover:text-white transition-colors">
        Details
      </button>
    </div>
  </div>
);


const JobsPage = () => {
  return (
    <div className="p-8 bg-zinc-950 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">Discover your ideal career</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MOCK_JOBS.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
};

export default JobsPage;
