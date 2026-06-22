"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button, Avatar } from "@heroui/react";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const navLinks = [
    { label: "Browse Jobs", href: "/jobs" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Pricing", href: "/pricing" },
  ];

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0B0B0F]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-yellow-400 shadow-lg">
            <span className="text-xl font-bold text-black">S</span>
          </div>
          <h1 className="text-lg font-bold text-white">SkillSwap</h1>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden items-center gap-6 md:flex">
          <ul className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    pathname === link.href ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {isPending ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-white/10" />
          ) : user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">Hi, {user.name}</span>
              <Avatar src={user.image} className="h-10 w-10 border border-white/10" />
              <Button onClick={handleSignOut} variant="bordered" size="sm" className="border-white/10 text-white">
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-teal-400 hover:text-teal-300">Log in</Link>
              <Button as={Link} href="/signup" radius="lg" className="bg-white text-black font-semibold">
                Get Started
              </Button>
            </div>
          )}
        </div>

        {/* MOBILE TRIGGER */}
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white p-2">
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="border-t border-white/10 bg-[#0B0B0F] p-4 md:hidden">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="block py-3 text-white" onClick={() => setIsMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          {!user && (
            <div className="flex flex-col gap-2 pt-4">
              <Link href="/login" className="py-2 text-teal-400">Log in</Link>
              <Button as={Link} href="/signup" className="w-full bg-white text-black">Get Started</Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}