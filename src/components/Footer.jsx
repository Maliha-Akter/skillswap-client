import Link from "next/link";
import { Zap, Mail, X } from "lucide-react"; // Customizing X here to avoid package mismatch
import { LogoLinkedin, LogoGithub } from "@gravity-ui/icons";

export default function Footer() {
  const publicLinks = [
    { label: "Home", href: "/" },
    { label: "Browse Tasks", href: "/jobs" },
    { label: "Browse Freelancers", href: "/freelancers" },
    { label: "Login", href: "/auth/signin" },
  ];

  return (
    <footer className="w-full border-t border-zinc-800 bg-background text-foreground">
      {/* 📐 Enhanced responsive vertical and horizontal padding for the container */}
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16 lg:px-12 lg:py-20">
        
        {/* TOP SECTION */}
        {/* 📐 Increased grid row/column gaps across screen breaking matrix steps */}
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:gap-16 lg:gap-24">
          
          {/* BRAND & CONTACT SECTION */}
          {/* 📐 Structured block element vertical padding offsets */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 w-fit transition-opacity hover:opacity-90">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-yellow-400 shadow-lg shadow-teal-500/10">
                <Zap className="h-5 w-5 text-black fill-black" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Skill<span className="text-teal-600">Swap</span>
              </span>
            </Link>

            <p className="max-w-xs text-sm text-muted-foreground leading-relaxed">
              The platform where talent meets opportunity. Built for the modern workforce.
            </p>

            {/* Email Contact Info */}
            {/* 📐 Added slight upper element padding split spacing */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
              <Mail className="h-4 w-4 text-teal-600" />
              <a href="mailto:support@skillswap.com" className="hover:text-foreground transition">
                support@skillswap.com
              </a>
            </div>

            {/* Social Icons */}
            {/* 📐 Enhanced buffer spacing block layout anchor tracking */}
            <div className="flex items-center gap-3 pt-3">
              {[
                { Icon: X, href: "https://x.com" },
                { Icon: LogoLinkedin, href: "https://linkedin.com" },
                { Icon: LogoGithub, href: "https://github.com" }
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 transition hover:bg-teal-600 text-muted-foreground hover:text-white"
                >
                  <social.Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* NAVIGATION LINKS */}
          {/* 📐 Added light responsive top padding padding for mobile stacked alignment */}
          <div className="sm:justify-self-end pt-4 sm:pt-0">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-teal-600">
              Navigation
            </h3>
            <ul className="space-y-3.5 text-sm text-muted-foreground">
              {publicLinks.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition hover:text-foreground py-0.5 block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT SECTION */}
        {/* 📐 Expanded margin and padding metrics for the fine-print baseline segment */}
        <div className="mt-16 border-t border-zinc-800 pt-8 text-center text-xs text-muted-foreground sm:text-left">
          <p>© {new Date().getFullYear()} SkillSwap. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}