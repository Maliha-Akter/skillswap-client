"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft, LogIn, Lock } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="relative flex min-[90vh] items-center justify-center overflow-hidden bg-zinc-950 px-6">

      {/* Background Glow */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[30rem] w-[30rem] rounded-full bg-red-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_70%)]" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl shadow-[0_25px_80px_rgba(0,0,0,0.6)]">

        {/* Top Border */}
        <div className="h-1 w-full bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400" />

        <div className="p-10">

          {/* Badge */}
          <div className="mb-6 flex justify-center">
            <div className="flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-red-400">
              <Lock size={14} />
              Access Restricted
            </div>
          </div>

          {/* Icon */}
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 shadow-[0_0_40px_rgba(239,68,68,0.15)]">
            <ShieldAlert className="h-12 w-12 text-red-400" />
          </div>

          {/* Error Code */}
          <h1 className="text-center text-8xl font-black tracking-tight text-white">
            401
          </h1>

          {/* Heading */}
          <h2 className="mt-4 text-center text-3xl font-bold text-white">
            Unauthorized Access
          </h2>

          {/* Description */}
          <p className="mx-auto mt-4 max-w-md text-center text-sm leading-7 text-zinc-400">
            You do not have sufficient permissions to access this page.
            Please sign in using an account with the required privileges or
            return to the homepage.
          </p>

          {/* Buttons */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">

            <Link
              href="/auth/signin"
              className="flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-6 py-3 font-semibold text-zinc-950 transition-all duration-300 hover:bg-teal-400 hover:shadow-lg hover:shadow-teal-500/20"
            >
              <LogIn size={18} />
              Sign In
            </Link>

            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-800/60 px-6 py-3 font-medium text-zinc-300 transition-all duration-300 hover:border-white/20 hover:bg-zinc-800 hover:text-white"
            >
              <ArrowLeft size={18} />
              Back to Home
            </Link>

          </div>

          {/* Footer */}
          <div className="mt-10 border-t border-white/5 pt-6 text-center">
            <p className="text-xs text-zinc-500">
              Error Code <span className="font-mono text-zinc-300">401</span> •
              Authentication Required
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}