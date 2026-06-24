"use client";
import React, { useState, useEffect } from 'react';
import { FaDollarSign, FaCalendarAlt, FaSearch, FaUser, FaEnvelope } from 'react-icons/fa';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Elegant Individual Job/Task Cards reading live MongoDB structural items
const JobCard = ({ job, currentPath }) => {
  // Gracefully format dates coming from the database collection
  const formattedDate = job.deadline
    ? new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'No deadline';

  // Safely grab a character badge fallback string
  const badgeLetter = job.title ? job.title[0] : 'T';

  // Mapped to match your database schema fields: job.clientName and job.client_email
  const clientName = job.clientName || "Platform Client";
  const clientEmail = job.client_email || job.email || "No Email Provided";

  return (
    <Link href={`${currentPath}/${job._id}`} className="block group">
      <div className="bg-zinc-900 border border-white/10 p-5 rounded-2xl group-hover:border-teal-500/50 transition-all flex flex-col justify-between h-full cursor-pointer min-h-[260px]">
        <div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-teal-500/10 rounded-full flex items-center justify-center text-teal-400 font-bold capitalize">
              {badgeLetter}
            </div>
            <span className="px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-full text-[11px] font-medium capitalize">
              {job.status || "open"}
            </span>
          </div>
          
          <h3 className="text-white font-bold text-lg leading-tight mb-1 group-hover:text-teal-400 transition-colors">
            {job.title}
          </h3>
          <p className="text-zinc-400 text-sm mb-4 line-clamp-2 min-h-[40px]">
            {job.description}
          </p>
          
          {/* Metadata Badges Field */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-zinc-300 font-medium">
              {job.category || "General"}
            </span>
            
            <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-zinc-300 flex items-center gap-1">
              <FaCalendarAlt className="text-zinc-500 text-[9px]" /> {formattedDate}
            </span>

            {/* Displaying Client Name Badge */}
            <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-zinc-300 flex items-center gap-1 max-w-[150px] truncate" title={clientName}>
              <FaUser className="text-teal-500 text-[9px]" /> {clientName}
            </span>

            {/* Displaying Client Email Badge */}
            <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-zinc-400 flex items-center gap-1 max-w-[180px] truncate" title={clientEmail}>
              <FaEnvelope className="text-teal-500 text-[9px]" /> {clientEmail}
            </span>
          </div>
        </div>

        {/* Budget Base Action footer indicator surface line */}
        <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-2">
          <span className="text-teal-400 font-bold text-sm flex items-center gap-0.5">
            <FaDollarSign className="text-xs" />
            {job.budget || "Flexible"}
          </span>
          <span className="text-[11px] text-teal-400/80 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            Apply Proposal &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
};

// Core Database Driven Job Board View
const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentPath = usePathname();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8080/tasks");
        
        if (!response.ok) {
          throw new Error("Failed to fetch jobs from the active database infrastructure.");
        }

        const data = await response.json();
        setJobs(data);
      } catch (err) {
        console.error("Fetch job listings exception:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="p-6 md:p-10 bg-zinc-950 min-h-screen text-zinc-100 flex flex-col gap-6 max-w-7xl mx-auto">
      
      {/* HEADER BAR */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Discover Your Ideal Career</h1>
        <p className="text-sm text-zinc-400 mt-1">Explore live contracts and tasks posted across the network</p>
      </div>

      {/* SEARCH CONTROL BAR */}
      <div className="relative flex items-center w-full bg-zinc-900/40 p-2 rounded-2xl border border-white/5">
        <FaSearch className="absolute left-6 text-zinc-500 text-sm" />
        <input
          type="text"
          placeholder="Search jobs or keywords..."
          className="w-full bg-zinc-950/80 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-teal-500/50 placeholder:text-zinc-600 transition-colors"
        />
      </div>

      {/* LIVE INTERACTIVE DATA MATRIX GRID */}
      {loading ? (
        <div className="text-center py-12 text-zinc-500 text-sm animate-pulse">
          Loading live available opportunities...
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-400 text-sm">
          ⚠️ Error Loading Jobs: {error}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 text-sm border border-dashed border-white/10 rounded-2xl">
          No job roles currently found open in the cluster.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-2">
          {jobs.map((job) => (
            <JobCard 
              key={job._id} 
              job={job} 
              currentPath={currentPath} 
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default JobsPage;