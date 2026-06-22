import { Zap } from "lucide-react"; // Make sure to install: npm install lucide-react
import Link from "next/link";

export const NavbarLogo = () => {
  return (
    <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-90">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-yellow-400 shadow-lg shadow-teal-500/20">
        <Zap className="h-6 w-6 text-black fill-black" />
      </div>
      <span className="text-xl font-bold tracking-tight text-foreground">
        Skill<span className="text-teal-600">Swap</span>
      </span>
    </Link>
  );
};