"use client";

import DashboardSideBar from "@/components/DashboardSideBar";

const DashboardLayout = ({ children }) => {
    return (
        <div className="h-screen flex bg-[#080c16] overflow-hidden">
            
            {/* Sidebar sits fixed on the left */}
            <DashboardSideBar />
            
            {/* 1. This container is full width and handles the scrollbar at the screen's right edge */}
            <div className="flex-1 overflow-y-auto">
                
                {/* 2. This inner container keeps your max-width constraints and padding intact */}
                <div className="px-6 py-10 max-w-5xl w-full mx-auto">
                    {children}
                </div>
                
            </div>
        </div>
    );
};

export default DashboardLayout;