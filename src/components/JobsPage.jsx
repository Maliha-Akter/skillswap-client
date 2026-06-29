"use client";
import React, { useState, useEffect } from 'react';
import { FaDollarSign, FaCalendarAlt, FaSearch, FaUser, FaEnvelope, FaSlidersH, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useSession } from '@/lib/auth-client';

const JobCard = ({ job, currentPath }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const formattedDate = job.deadline
    ? new Date(job.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'No deadline';

  const badgeLetter = job.title ? job.title[0] : 'T';
  const clientName = job.clientName || "Platform Client";
  const clientEmail = job.client_email || job.email || "No Email Provided";

  const handleNavigation = (e) => {
    e.preventDefault();
    if (status === "loading") return;

    const destinationPath = `${currentPath}/${job._id}`;

    if (status === "authenticated" || !!session) {
      router.push(destinationPath);
    } else {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(destinationPath)}`);
    }
  };

  return (
    <div 
      onClick={handleNavigation} 
      className={`block group ${status === "loading" ? "cursor-wait" : "cursor-pointer"}`}
    >
      <div className="bg-zinc-900 border border-white/10 p-5 rounded-2xl group-hover:border-teal-500/50 transition-all flex flex-col justify-between h-full min-h-[260px]">
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
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-zinc-300 font-medium">
              {job.category || "General"}
            </span>
            <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-zinc-300 flex items-center gap-1">
              <FaCalendarAlt className="text-zinc-500 text-[9px]" /> {formattedDate}
            </span>
            <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-zinc-300 flex items-center gap-1 max-w-[150px] truncate" title={clientName}>
              <FaUser className="text-teal-500 text-[9px]" /> {clientName}
            </span>
            <span className="px-2 py-1 bg-white/5 rounded text-[10px] text-zinc-400 flex items-center gap-1 max-w-[180px] truncate" title={clientEmail}>
              <FaEnvelope className="text-teal-500 text-[9px]" /> {clientEmail}
            </span>
          </div>
        </div>

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
    </div>
  );
};

const JobsPage = ({ 
  searchQuery, 
  setSearchQuery, 
  selectedCategories, 
  selectedStatus, 
  budgetRange,
  setSelectedCategories,
  setSelectedStatus,
  setBudgetRange
}) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Navigation Routing Hooks
  const router = useRouter();
  const currentPath = usePathname();
  const searchParams = useSearchParams();

  // Read initial page state value directly out of the URL parameters
  const urlPage = parseInt(searchParams.get("page"), 10) || 1;
  const [currentPage, setCurrentPage] = useState(urlPage);
  const [totalPages, setTotalPages] = useState(1);
  const limitCount = 9;

  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  // Sync state if browser URL navigation occurs (e.g. Forward/Back buttons)
  useEffect(() => {
    setCurrentPage(urlPage);
  }, [urlPage]);

  // Debounce keyboard search inputs
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Helper utility function to push updated URL params on state changes
  const updatePageUrl = (pageNumber) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", pageNumber.toString());
    router.push(`${currentPath}?${params.toString()}`, { scroll: false });
  };

  // Reset page structure whenever any active filtering attributes change
  useEffect(() => {
    setCurrentPage(1);
    updatePageUrl(1);
  }, [debouncedSearch, selectedCategories, selectedStatus, budgetRange.min, budgetRange.max]);

  // Fetch paginated documentation results
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (debouncedSearch) params.append("search", debouncedSearch);
        if (selectedCategories.length > 0) params.append("category", selectedCategories.join(","));
        if (selectedStatus) params.append("status", selectedStatus.toLowerCase());
        if (budgetRange.min) params.append("minBudget", budgetRange.min);
        if (budgetRange.max) params.append("maxBudget", budgetRange.max);
        
        params.append("page", currentPage.toString());
        params.append("limit", limitCount.toString());

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks?${params.toString()}`);
        if (!response.ok) throw new Error("Failed to fetch jobs from active systems.");

        const data = await response.json();
        setJobs(data.tasks || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [debouncedSearch, selectedCategories, selectedStatus, budgetRange.min, budgetRange.max, currentPage]);

  const handleCategoryChange = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handlePageAction = (newPage) => {
    setCurrentPage(newPage);
    updatePageUrl(newPage);
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setSelectedStatus("");
    setBudgetRange({ min: "", max: "" });
    handlePageAction(1);
  };

  return (
    <div className="p-6 md:p-10 bg-zinc-950 min-h-screen text-zinc-100 flex flex-col gap-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Discover Your Ideal Career</h1>
        <p className="text-sm text-zinc-400 mt-1">Explore live contracts and tasks posted across the network</p>
      </div>

      {/* Search Input */}
      <div className="relative flex items-center w-full bg-zinc-900/40 p-2 rounded-2xl border border-white/5">
        <FaSearch className="absolute left-6 text-zinc-500 text-sm" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search jobs or keywords..."
          className="w-full bg-zinc-950/80 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-teal-500/50 placeholder:text-zinc-600 transition-colors"
        />
      </div>

      {/* TOP FILTERS ROW: Visible only on Mobile/Tablet viewports below 'lg' */}
      <div className="bg-zinc-900/30 border border-white/5 p-4 rounded-2xl flex flex-col gap-4 lg:hidden">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <span className="text-xs font-bold text-white tracking-wider uppercase flex items-center gap-2">
            <FaSlidersH className="text-teal-500" /> Filters
          </span>
          <button onClick={handleReset} className="text-red-400 text-xs bg-transparent border-none cursor-pointer">
            Reset All
          </button>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between overflow-x-auto pb-1">
          {/* Categories */}
          <div>
            <h4 className="text-white text-xs font-bold mb-2">Category</h4>
            <div className="flex flex-wrap gap-3">
              {['Development', 'Marketing', 'Writing', 'Design', 'Other'].map((cat) => (
                <label key={cat} className="flex items-center gap-1.5 text-zinc-400 text-xs cursor-pointer hover:text-teal-400 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={selectedCategories.includes(cat)}
                    onChange={() => handleCategoryChange(cat)}
                    className="accent-teal-500 rounded border-white/10 bg-white/5 w-3.5 h-3.5" 
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <h4 className="text-white text-xs font-bold mb-2">Status</h4>
            <div className="flex flex-wrap gap-3">
              {['Open', 'in_progress', 'Completed'].map((status) => (
                <label key={status} className="flex items-center gap-1.5 text-zinc-400 text-xs cursor-pointer hover:text-teal-400 transition-colors">
                  <input 
                    type="radio" 
                    name="status-filter-mobile"
                    checked={selectedStatus.toLowerCase() === status.toLowerCase()}
                    onChange={() => setSelectedStatus(status)}
                    className="accent-teal-500 w-3.5 h-3.5" 
                  />
                  {status === 'in_progress' ? 'In Progress' : status}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Budget */}
        <div className="pt-3 border-t border-white/5 flex flex-col gap-2">
          <h4 className="text-white text-xs font-bold">Budget Tiers</h4>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-1.5 text-zinc-400 text-xs cursor-pointer hover:text-teal-400 transition-colors">
              <input 
                type="radio" 
                name="budget-mobile"
                checked={budgetRange.min === "0" && budgetRange.max === "100"}
                onChange={() => setBudgetRange({ min: "0", max: "100" })}
                className="accent-teal-500 w-3.5 h-3.5"
              /> $0 - $100
            </label>
            <label className="flex items-center gap-1.5 text-zinc-400 text-xs cursor-pointer hover:text-teal-400 transition-colors">
              <input 
                type="radio" 
                name="budget-mobile"
                checked={budgetRange.min === "100" && budgetRange.max === "500"}
                onChange={() => setBudgetRange({ min: "100", max: "500" })}
                className="accent-teal-500 w-3.5 h-3.5"
              /> $100 - $500
            </label>
            <label className="flex items-center gap-1.5 text-zinc-400 text-xs cursor-pointer hover:text-teal-400 transition-colors">
              <input 
                type="radio" 
                name="budget-mobile"
                checked={budgetRange.min === "500" && budgetRange.max === "1000"}
                onChange={() => setBudgetRange({ min: "500", max: "1000" })}
                className="accent-teal-500 w-3.5 h-3.5"
              /> $500 - $1k
            </label>

            <div className="flex gap-2 items-center max-w-[160px] ml-auto sm:ml-0">
              <input 
                type="number" 
                placeholder="Min" 
                value={budgetRange.min}
                onChange={(e) => setBudgetRange({ ...budgetRange, min: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-center text-xs text-white outline-none focus:border-teal-500/50 transition-colors" 
              />
              <span className="text-zinc-600 text-xs">-</span>
              <input 
                type="number" 
                placeholder="Max" 
                value={budgetRange.max}
                onChange={(e) => setBudgetRange({ ...budgetRange, max: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-center text-xs text-white outline-none focus:border-teal-500/50 transition-colors" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Jobs Grid Output Feed */}
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
          No job roles currently found matching your search parameters.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-2">
            {jobs.map((job) => (
              <JobCard key={job._id} job={job} currentPath={currentPath} />
            ))}
          </div>

          {/* Interactive Pagination Controls Element */}
          <div className="flex items-center justify-center gap-2 mt-8 pt-4 border-t border-white/5">
            <button
              onClick={() => handlePageAction(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl border border-white/10 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-zinc-900 disabled:hover:text-zinc-400 transition-all cursor-pointer disabled:cursor-not-allowed"
              aria-label="Previous Page"
            >
              <FaChevronLeft className="text-xs" />
            </button>

            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageAction(pageNumber)}
                  className={`w-9 h-9 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    currentPage === pageNumber
                      ? "bg-teal-500 border-teal-500 text-black font-bold"
                      : "bg-zinc-900 border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              onClick={() => handlePageAction(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl border border-white/10 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-zinc-900 disabled:hover:text-zinc-400 transition-all cursor-pointer disabled:cursor-not-allowed"
              aria-label="Next Page"
            >
              <FaChevronRight className="text-xs" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default JobsPage;