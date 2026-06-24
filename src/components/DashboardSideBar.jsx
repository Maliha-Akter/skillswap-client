"use client";

import { useSession, authClient } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { 
  FaHome, FaSignOutAlt, FaBriefcase, FaListAlt, 
  FaUserTie, FaUserShield, FaClipboardList, FaMoneyBillWave, 
  FaChartLine, FaTasks, FaUserEdit 
} from "react-icons/fa";
import { NavbarLogo } from "./NavbarLogo";

const DashboardSideBar = () => {
  const { data: session, isPending } = useSession();  // useSession() → gets logged-in user data
  const router = useRouter(); //Used to redirect 
  const pathname = usePathname(); // current path we are in

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/auth/signin");
  };

  // --- Menu Configurations ---
  const clientMenu = [
    { key: "overview", label: "Dashboard", icon: FaChartLine, href: "/dashboard/client" },
    { key: "post-task", label: "Post a Task", icon: FaBriefcase, href: "/dashboard/client/post-task" },
    { key: "my-tasks", label: "My Tasks", icon: FaListAlt, href: "/dashboard/client/my-tasks" },
    { key: "proposals", label: "Manage Proposals", icon: FaClipboardList, href: "/dashboard/client/proposals" },
    { key: "payments", label: "Payment History", icon: FaMoneyBillWave, href: "/dashboard/client/payments" },
  ];

  const freelancerMenu = [
    { key: "overview", label: "Dashboard", icon: FaChartLine, href: "/dashboard/freelancer" },
    { key: "find-work", label: "Browse Task", icon: FaBriefcase, href: "/jobs" },
    { key: "my-proposals", label: "My Proposals", icon: FaClipboardList, href: "/dashboard/freelancer/proposals" },
    { key: "active-projects", label: "Active Projects", icon: FaTasks, href: "/dashboard/freelancer/active-projects" },
    { key: "earnings", label: "My Earnings", icon: FaMoneyBillWave, href: "/dashboard/freelancer/earnings" },
    { key: "edit-profile", label: "Edit Profile", icon: FaUserEdit, href: "/dashboard/freelancer/profile" },
  ];

  const adminMenu = [
    { key: "users", label: "Manage Users", icon: FaUserTie, href: "/dashboard/admin/users" },
    { key: "tasks", label: "Moderate Tasks", icon: FaClipboardList, href: "/dashboard/admin/tasks" },
    { key: "transactions", label: "Transactions", icon: FaMoneyBillWave, href: "/dashboard/admin/transactions" },
  ];

  const role = session?.user?.role;
  const menuItems = role === "freelancer" ? freelancerMenu : role === "client" ? clientMenu : role === "admin" ? adminMenu : [];

  //If session still loading:
  if (isPending) return <aside className="w-64 h-screen bg-zinc-950/80 animate-pulse border-r border-white/5" />;

  return (
    <aside className="w-64 h-screen border-r border-white/5">
      <div className="h-full flex flex-col bg-zinc-950/80 backdrop-blur-xl">
        <div className="px-6 py-5 border-b border-white/5">
          <NavbarLogo />
        </div>

        {/* User Profile Section */}
        <div className="px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-teal-500/60 shrink-0">
              <Image
                width={40}
                height={40}
                src={session?.user?.image || "/default-avatar.png"}
                alt="Profile"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-sm font-bold truncate">{session?.user?.name}</p>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                role === "admin" ? "text-yellow-400" : 
                role === "freelancer" ? "text-teal-400" : "text-blue-400"
              }`}>
                {role || "Loading..."}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-grow overflow-y-auto px-3 py-4 space-y-1">
          {menuItems.map(({ key, label, icon: UserIcon, href }) => {
            const isActive = pathname === href;
            return (
              <Link 
                key={key} 
                href={href} 
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? "bg-teal-500/20 text-teal-400" : "bg-white/5"}`}>
                  <UserIcon size={16} />
                </span>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="px-3 py-4  border-t border-white/5">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-400 hover:text-white transition-all">
            <FaHome className="ml-2" /> Back to Home
          </Link>
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 text-sm font-semibold text-slate-400 hover:text-red-400 transition-all"
          >
            <FaSignOutAlt className="ml-2" /> Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSideBar;