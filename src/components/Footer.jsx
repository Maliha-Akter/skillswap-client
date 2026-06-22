import Link from "next/link";
import {
  LogoFacebook,
  LogoLinkedin,
  LogoGithub,
} from "@gravity-ui/icons";


export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        {/* TOP SECTION */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* LEFT */}
          <div className="space-y-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500">
                <span className="text-xl font-bold text-white">P</span>
              </div>

              <div className="leading-none">
                <h2 className="text-xl font-bold">Hiring</h2>
                <h2 className="text-xl font-bold">Loop</h2>
              </div>
            </Link>

            {/* Description */}
            <p className="max-w-xs leading-8 text-gray-400">
              The AI-native career platform. Built for people who take
              their work seriously.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4 pt-6">
              <Link
                href="#"
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 transition hover:bg-violet-600"
              >
                <LogoFacebook className="h-5 w-5" />
              </Link>

              <Link
                href="#"
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600 transition hover:bg-violet-500"
              >
                <LogoGithub className="h-5 w-5" />
              </Link>

              <Link
                href="#"
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 transition hover:bg-violet-600"
              >
                <LogoLinkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* PRODUCT */}
          <div>
            <h3 className="mb-6 text-lg font-semibold text-violet-500">
              Product
            </h3>

            <ul className="space-y-4 text-gray-400">
              <li>
                <Link href="/jobs" className="transition hover:text-white">
                  Job discovery
                </Link>
              </li>

              <li>
                <Link href="/worker-ai" className="transition hover:text-white">
                  Worker AI
                </Link>
              </li>

              <li>
                <Link href="/companies" className="transition hover:text-white">
                  Companies
                </Link>
              </li>

              <li>
                <Link href="/salary" className="transition hover:text-white">
                  Salary data
                </Link>
              </li>
            </ul>
          </div>

          {/* NAVIGATION */}
          <div>
            <h3 className="mb-6 text-lg font-semibold text-violet-500">
              Navigations
            </h3>

            <ul className="space-y-4 text-gray-400">
              <li>
                <Link
                  href="/help-center"
                  className="transition hover:text-white"
                >
                  Help center
                </Link>
              </li>

              <li>
                <Link
                  href="/career-library"
                  className="transition hover:text-white"
                >
                  Career library
                </Link>
              </li>

              <li>
                <Link href="/contact" className="transition hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* RESOURCES */}
          <div>
            <h3 className="mb-6 text-lg font-semibold text-violet-500">
              Resources
            </h3>

            <ul className="space-y-4 text-gray-400">
              <li>
                <Link
                  href="/brand-guideline"
                  className="transition hover:text-white"
                >
                  Brand Guideline
                </Link>
              </li>

              <li>
                <Link href="/newsroom" className="transition hover:text-white">
                  Newsroom
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-gray-500 md:flex-row">
          <p>Copyright 2024 — Hire Loop</p>

          <div className="flex items-center gap-6">
            <Link href="/terms" className="transition hover:text-white">
              Terms & Policy
            </Link>

            <Link href="/privacy" className="transition hover:text-white">
              Privacy Guideline
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}