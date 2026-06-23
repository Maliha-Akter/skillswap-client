"use client";

import DashboardSideBar from "@/components/DashboardSideBar";

const DashboardLayout = ({ children }) => {

    // console.log(role);

    return (
        <div className="min-h-screen flex bg-[#080c16]">
            <DashboardSideBar />
           
            <div className="px-6 py-10 max-w-5xl w-full">
                {children}
            </div>
        </div>
        // <div>
        //     {children}
        // </div>
    );
};
// /dashboard/organizer 
export default DashboardLayout;