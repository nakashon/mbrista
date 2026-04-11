"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WifiOff, Loader2 } from "lucide-react";
import { getSavedIp } from "@/lib/connection-store";
import { testConnection } from "@/lib/machine-api";
import type { ConnectionStatus } from "@/lib/types";

export function ConnectionDot() {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [machineName, setMachineName] = useState("");

  useEffect(() => {
    const ip = getSavedIp();
    if (!ip) return;
    setStatus("connecting");
    testConnection(ip)
      .then((info) => { setMachineName(info.name); setStatus("connected"); })
      .catch(() => setStatus("error"));
  }, []);

  const label = status === "connected"   ? machineName || "Connected"
              : status === "connecting"  ? "Connecting…"
              : status === "error"       ? "Reconnect"
              : "Connect";

  const pill: Record<ConnectionStatus, string> = {
    connected:    "border-[#4ade80]/20 bg-[#4ade80]/[0.08] text-[#4ade80]",
    connecting:   "border-white/[0.08]  bg-white/[0.04]    text-[#f5f0ea]/50",
    error:        "border-[#e8944a]/20  bg-[#e8944a]/[0.08] text-[#e8944a]/70 hover:text-[#e8944a]",
    disconnected: "border-white/[0.08]  bg-white/[0.04]    text-[#f5f0ea]/40 hover:text-[#f5f0ea]/70",
  };

  return (
    <Link href="/dashboard"
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all shrink-0 ${pill[status]}`}>

      {status === "connecting" && <Loader2 className="h-3 w-3 animate-spin" />}

      {status === "connected" && (
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#4ade80]" />
        </span>
      )}

      {(status === "error" || status === "disconnected") && <WifiOff className="h-3 w-3" />}

      <span className="hidden sm:inline max-w-28 truncate">{label}</span>
    </Link>
  );
}
