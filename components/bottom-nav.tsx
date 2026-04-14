"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers, Coffee, GitCompare, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/dashboard", label: "Home",      icon: Home },
  { href: "/profiles",  label: "Profiles",  icon: Layers },
  { href: "/live",      label: "Shot",      icon: Coffee },
  { href: "/compare",   label: "Compare",   icon: GitCompare },
  { href: "/community", label: "Community", icon: Users },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#131313]/90 backdrop-blur-xl border-t border-[#4E4635]/10 pb-safe">
      <div className="flex items-stretch h-20 pb-4">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 transition-all active:scale-95",
                active ? "text-[#F5C444]" : "text-[#E5E2E1]/40 hover:text-[#FFE4AA]"
              )}
            >
              <Icon className={cn("h-5 w-5 transition-transform", active && "scale-110")} />
              <span className="text-[10px] uppercase tracking-widest leading-none font-space">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
