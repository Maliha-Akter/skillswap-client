"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaHome, FaArrowLeft, FaExclamationTriangle } from "react-icons/fa";

const NotFound = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-zinc-100 p-6 relative overflow-hidden">
      
      {/* Background Decorative Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[250px] h-[250px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Glassmorphic Card Container */}
      <div className="max-w-md w-full text-center bg-zinc-900/40 border border-white/5 p-8 md:p-12 rounded-3xl backdrop-blur-xl shadow-2xl relative z-10 flex flex-col items-center">
        
        {/* Animated Warning Icon Badge */}
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-400 text-2xl mb-6 shadow-lg shadow-red-500/5 animate-pulse">
          <FaExclamationTriangle />
        </div>

        {/* Error Code */}
        <h1 className="text-7xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-600 mb-2">
          404
        </h1>

        {/* Message */}
        <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
          Task Record Terminated
        </h2>
        <p className="text-sm text-zinc-400 mb-8 max-w-xs leading-relaxed">
          The contract page or terminal node you are trying to view does not exist or has been shifted across the network topology.
        </p>

        {/* Action Buttons Row */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          {/* Back Action Element */}
          <button
            onClick={() => router.back()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-zinc-900 text-zinc-300 text-xs font-semibold hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
          >
            <FaArrowLeft className="text-[10px]" /> Go Back
          </button>

          {/* Home Redirection Element */}
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-teal-500 text-black text-xs font-bold hover:bg-teal-400 shadow-lg shadow-teal-500/10 transition-all"
          >
            <FaHome className="text-[11px]" /> Terminal Home
          </Link>
        </div>
      </div>

      {/* Subdued Footer Breadcrumb details */}
      <div className="absolute bottom-6 text-[11px] text-zinc-600 font-mono tracking-widest uppercase">
        System Status: Code 404 // Object_Not_Found
      </div>
    </div>
  );
};

export default NotFound;