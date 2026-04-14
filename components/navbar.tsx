"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConnectionDot } from "./connection-dot";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profiles",  label: "Profiles" },
  { href: "/live",      label: "Shot" },
  { href: "/compare",   label: "Compare" },
  { href: "/community", label: "Community" },
];

export function Navbar() {
  const pathname = usePathname();
  return (
    <header className="hidden md:flex sticky top-0 z-50 items-center bg-[#131313] border-b border-[#4E4635]/15 h-16">
      <div className="mx-auto max-w-7xl w-full px-5 flex h-full items-center gap-4">
        <button className="p-2 text-[#E5E2E1]/40 hover:text-[#E5E2E1] transition-colors">
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/" className="font-black tracking-widest uppercase text-xl text-[#F5C444] ml-1 hover:text-[#FFE4AA] transition-colors">
          METBARISTA
        </Link>
        <nav className="flex items-center gap-0.5 ml-auto">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href}
              className={cn(
                "px-3 py-1.5 text-[13px] font-medium rounded-sm transition-all",
                pathname.startsWith(href)
                  ? "text-[#FFE4AA]"
                  : "text-[#E5E2E1]/50 hover:text-[#E5E2E1] hover:bg-[#353534]"
              )}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 ml-4">
          <ConnectionDot />
          <Link href="/dashboard" className="p-2 text-[#F5C444] hover:text-[#FFE4AA] transition-colors">
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
