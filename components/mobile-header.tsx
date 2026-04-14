"use client";
import Link from "next/link";
import { Menu, Settings } from "lucide-react";
import { ConnectionDot } from "./connection-dot";

/**
 * Mobile top bar (md:hidden). Stitch design: hamburger + METBARISTA brand + dot + settings.
 */
export function MobileHeader() {
  return (
    <header className="md:hidden sticky top-0 z-50 flex items-center justify-between px-4 h-16 bg-[#131313] border-b border-[#4E4635]/15">
      <div className="flex items-center gap-3">
        <button className="p-1 text-[#E5E2E1]/40 hover:text-[#E5E2E1] transition-colors">
          <Menu className="h-5 w-5" />
        </button>
        <Link href="/" className="font-black tracking-widest uppercase text-base text-[#F5C444] hover:text-[#FFE4AA] transition-colors">
          METBARISTA
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <ConnectionDot />
        <Link href="/dashboard" className="p-1 text-[#F5C444] hover:text-[#FFE4AA] transition-colors">
          <Settings className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}
