"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Avatar } from "@heroui/react";
import { authClient } from "@/lib/auth-client";
import { NavbarLogo } from "./NavbarLogo";

export default function Navbar() {
  const pathname = usePathname(); 
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // 🔥 Added loading spinner state

  // Refs for click-outside detection
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  // Handling clicking outside to close menus
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target) && !event.target.closest('button')) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const publicLinks = [
    { label: "Home", href: "/" },
    { label: "Browse Tasks", href: "/jobs" },
    { label: "Browse Freelancers", href: "/freelancers" },
  ];

  const dashboardHref =
    user?.role === "admin"
      ? "/dashboard/admin"
      : user?.role === "client"
        ? "/dashboard/client"
        : "/dashboard/freelancer";
        
  const privateLinks = [
    { label: "Dashboard", href: dashboardHref },
    { label: "Profile", href: "/profile" },
  ];

  const linksToShow = user ? [...publicLinks, ...privateLinks] : publicLinks;

  // 🚪 Clean Logout Flow with instant state refresh
  const handleSignOut = async () => {
    setIsLoggingOut(true); // 1. Instantly trigger the loading state spinner wrapper
    setIsProfileDropdownOpen(false);
    setIsMenuOpen(false);

    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            // 2. Instantly refresh and route back to landing page by wiping token cache contexts cleanly
            window.location.href = "/";
          },
        },
      });
    } catch (error) {
      console.error("Sign out encountered a processing error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800/50 bg-background/80 backdrop-blur-xl">
      <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* LEFT SECTION: Hamburger on Mobile, Logo on Desktop */}
        <div className="z-20 flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-foreground"
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>
          <div className="hidden lg:block">
            <NavbarLogo />
          </div>
        </div>

        {/* CENTER SECTION: Logo on Mobile, Links on Desktop */}
        <div className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 z-10 flex items-center">
          {/* Logo visible only on mobile */}
          <div className="lg:hidden">
            <NavbarLogo />
          </div>
          {/* Links visible only on desktop */}
          <ul className="hidden lg:flex items-center gap-1">
            {linksToShow.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${pathname === link.href
                    ? "text-teal-400"
                    : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT SECTION: Profile/Auth */}
        <div className="z-20 flex items-center" ref={dropdownRef}>
          {/* 🔄 Condition extended to check for active logout processing */}
          {isPending || isLoggingOut ? (
            <div className="flex items-center justify-center h-10 w-10">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-teal-500 border-t-transparent"></span>
            </div>
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex rounded-full focus:outline-none transition-transform hover:scale-105"
              >
                <Avatar className="h-10 w-10 rounded-full border-2 border-[#AA4465] cursor-pointer">
                  <Avatar.Image
                    referrerPolicy="no-referrer"
                    alt={user?.name || "User"}
                    src={user?.image}
                    className="h-full w-full object-cover cursor-pointer"
                  />
                  <Avatar.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-[#AA4465]/10 font-bold text-[#AA4465] text-sm select-none">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "?"}
                  </Avatar.Fallback>
                </Avatar>
              </button>

              {/* Desktop Dropdown */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 top-16 mt-2 w-48 rounded-xl shadow-xl py-1 bg-white ring-1 ring-black/5 z-50 overflow-hidden border border-gray-100 cursor-pointer">
                  <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/50">
                    <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                  </div>
                  {/* <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Dashboard</Link>
                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Profile</Link> */}
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50/70 font-semibold transition-colors cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/signin" className="text-sm font-medium text-foreground hover:text-teal-400 transition-colors">
                Log in
              </Link>
              <Link
                href="/auth/signup"
                className="hidden md:flex text-sm font-medium text-foreground hover:text-teal-400 transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE MENU (Combined) */}
      {isMenuOpen && (
        <div className="absolute w-full border-b border-zinc-800 bg-background p-6 lg:hidden flex flex-col gap-4 z-40" ref={menuRef}>
          {linksToShow.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-lg font-medium text-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {!user ? (
            <div className="flex flex-col gap-3 pt-4 border-t border-zinc-800">
              <Link href="/auth/signup" className="flex items-center justify-center px-6 py-2.5 bg-white text-black font-semibold rounded-xl" onClick={() => setIsMenuOpen(false)}>
                Register
              </Link>
            </div>
          ) : (
            <div className="pt-4 border-t border-zinc-800">
              <button
                onClick={handleSignOut}
                className="w-full text-left text-lg font-medium text-red-500 cursor-pointer hover:underline"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}