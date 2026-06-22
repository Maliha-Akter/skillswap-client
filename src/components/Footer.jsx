import Link from "next/link";
import { Zap } from "lucide-react";
import {
  LogoFacebook,
  LogoLinkedin,
  LogoGithub,
} from "@gravity-ui/icons";

export default function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800 bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        
        {/* TOP SECTION: Grid layout */}
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* BRAND SECTION (Column 1) */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 w-fit transition-opacity hover:opacity-90">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-yellow-400 shadow-lg shadow-teal-500/10">
                <Zap className="h-6 w-6 text-black fill-black" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Skill<span className="text-teal-600">Swap</span>
              </span>
            </Link>

            <p className="max-w-xs leading-8 text-muted-foreground">
              The platform where talent meets opportunity. Built for the modern workforce.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {[LogoFacebook, LogoGithub, LogoLinkedin].map((Icon, idx) => (
                <Link
                  key={idx}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 transition hover:bg-teal-600 text-muted-foreground hover:text-white"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* DYNAMIC LINKS (Columns 2, 3, 4) */}
          {[
            { 
              title: "Product", 
              links: [
                { label: "Browse Tasks", href: "/jobs" }, 
                { label: "Browse Freelancers", href: "/freelancers" }, 
                { label: "Companies", href: "/companies" }, 
                { label: "Salary Data", href: "/salary" }
              ] 
            },
            { 
              title: "Navigation", 
              links: [
                { label: "Dashboard", href: "/dashboard" }, 
                { label: "Profile", href: "/profile" }, 
                { label: "Help Center", href: "/help-center" }
              ] 
            },
            { 
              title: "Resources", 
              links: [
                { label: "Brand Guideline", href: "/brand-guideline" }, 
                { label: "Newsroom", href: "/newsroom" }, 
                { label: "Contact", href: "/contact" }
              ] 
            }
          ].map((section) => (
            <div key={section.title}>
              <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-teal-600">
                {section.title}
              </h3>
              <ul className="space-y-4 text-muted-foreground">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="transition hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* BOTTOM SECTION */}
        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-zinc-800 pt-8 text-sm text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} SkillSwap. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <Link href="/terms" className="transition hover:text-foreground">Terms & Policy</Link>
            <Link href="/privacy" className="transition hover:text-foreground">Privacy Guideline</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}