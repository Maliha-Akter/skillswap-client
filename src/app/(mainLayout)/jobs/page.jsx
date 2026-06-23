import JobFilterSidebar from "@/components/JobFilterSidebar"; // Adjust the path
import JobsPage from "@/components/JobsPage"; // Adjust the path

const JobsLayoutPage = () => {
  return (
    <div className="flex w-full min-h-screen bg-black">
      {/* 1. Sidebar Filter: Fixed width */}
      <div className="hidden lg:block w-64 h-screen sticky top-0">
        <JobFilterSidebar />
      </div>

      {/* 2. Main Content: Takes up remaining space */}
      <main className="flex-1 overflow-y-auto">
        <JobsPage />
      </main>
    </div>
  );
};

export default JobsLayoutPage;