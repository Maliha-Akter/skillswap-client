"use client";
import React, { useState } from "react";
import JobFilterSidebar from "@/components/JobFilterSidebar";
import JobsPage from "@/components/JobsPage";

const PublicJobComponent = () => {
  // Global filter state matrix
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [budgetRange, setBudgetRange] = useState({ min: "", max: "" });

  return (
    <div className="flex w-full min-h-screen bg-black">
      {/* 1. Sidebar Filter - Visible on Large Desktops only */}
      <div className="hidden lg:block w-64 h-screen sticky top-0 shrink-0">
        <JobFilterSidebar 
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          budgetRange={budgetRange}
          setBudgetRange={setBudgetRange}
        />
      </div>

      {/* 2. Main Content Container */}
      <main className="flex-1 overflow-y-auto">
        <JobsPage 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategories={selectedCategories}
          selectedStatus={selectedStatus}
          budgetRange={budgetRange}
          // State setters for mobile responsive filter layout views
          setSelectedCategories={setSelectedCategories}
          setSelectedStatus={setSelectedStatus}
          setBudgetRange={setBudgetRange}
        />
      </main>
    </div>
  );
};

export default PublicJobComponent;