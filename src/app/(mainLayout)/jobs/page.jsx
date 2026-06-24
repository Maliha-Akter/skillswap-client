"use client";
import React, { useState } from "react";
import JobFilterSidebar from "@/components/JobFilterSidebar";
import JobsPage from "@/components/JobsPage";

const JobsLayoutPage = () => {
  // Global filter state matrix
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [budgetRange, setBudgetRange] = useState({ min: "", max: "" });

  return (
    <div className="flex w-full min-h-screen bg-black">
      {/* 1. Sidebar Filter */}
      <div className="hidden lg:block w-64 h-screen sticky top-0">
        <JobFilterSidebar 
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          budgetRange={budgetRange}
          setBudgetRange={setBudgetRange}
        />
      </div>

      {/* 2. Main Content */}
      <main className="flex-1 overflow-y-auto">
        <JobsPage 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategories={selectedCategories}
          selectedStatus={selectedStatus}
          budgetRange={budgetRange}
          // Passing down the sidebar components into main content for responsive layout views
          setSelectedCategories={setSelectedCategories}
          setSelectedStatus={setSelectedStatus}
          setBudgetRange={setBudgetRange}
        />
      </main>
    </div>
  );
};

export default JobsLayoutPage;