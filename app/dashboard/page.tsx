"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ConnectDialog } from "@/components/connect-dialog";
import {
  Coffee, WifiOff, Loader2,
  Play, Square, Flame, Scale, RefreshCw
} from "lucide-react";
import { getMachineInfo, getHistory, executeAction, listProfiles } from "@/lib/machine-api";
import { getSavedIp } from "@/lib/connection-store";
import type { MachineInfo, ShotEntry, Profile } from "@/lib/types";
import type { ActionType } from "@/lib/types";

export default function DashboardPage() {
  const [showConnect, setShowConnect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [machine, setMachine] = useState<MachineInfo | null>(null);
  const [recentShots, setRecentShots] = useState<ShotEntry[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<ActionType | null>(null);

  const ip = getSavedIp();

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [info, shots, profs] = await Promise.all([
        getMachineInfo(),
        getHistory(),
        listProfiles(),
      ]);
      setMachine(info);
      setRecentShots(shots.slice(0, 5));
      setProfiles(profs);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (ip) load();
    else setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function doAction(action: ActionType) {
    setActionLoading(action);
    try {
      await executeAction(action);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  }

  if (!ip) {
    return (
      <div className="min-h-screen bg-[#131313] flex items-center justify-center">
        <div className="flex flex-col items-center gap-5 text-center px-4">
          <div className="h-16 w-16 rounded-sm bg-[#F5C444]/10 flex items-center justify-center">
            <Coffee className="h-7 w-7 text-[#F5C444]" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-[#E5E2E1]">No machine connected</h2>
            <p className="text-sm text-[#E5E2E1]/40 mt-1 max-w-sm">
              Connect to your Meticulous machine over your local network.
            </p>
          </div>
          <button
            onClick={() => setShowConnect(true)}
            className="inline-flex items-center gap-2 brass-gradient rounded-sm px-5 py-2.5 text-sm font-black uppercase tracking-widest text-[#3E2E00] hover:opacity-90 transition-all"
          >
            <Coffee className="h-4 w-4" /> Connect Machine
          </button>
          <ConnectDialog
            open={showConnect}
            onConnected={() => { setShowConnect(false); load(); }}
            onCancel={() => setShowConnect(false)}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#131313] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#F5C444]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#131313] flex items-center justify-center">
        <div className="flex flex-col items-center gap-5 text-center px-4">
          <div className="h-16 w-16 rounded-sm bg-red-500/10 flex items-center justify-center">
            <WifiOff className="h-7 w-7 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-[#E5E2E1]">Connection failed</h2>
            <p className="text-sm text-[#E5E2E1]/40 mt-1">{error}</p>
          </div>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 ghost-border rounded-sm px-5 py-2.5 text-sm font-medium text-[#E5E2E1]/60 hover:text-[#E5E2E1] hover:bg-[#1C1B1B] transition-all"
          >
            <RefreshCw className="h-4 w-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  const ACTIONS: { action: ActionType; label: string; icon: React.ElementType; hero?: boolean; danger?: boolean }[] = [
    { action: "preheat", label: "Preheat",    icon: Flame  },
    { action: "start",   label: "Start Shot", icon: Play,  hero: true },
    { action: "stop",    label: "Stop",       icon: Square, danger: true },
    { action: "tare",    label: "Tare Scale", icon: Scale  },
  ];

  const activeProfile: Profile | undefined = profiles[0];

  return (
    <div className="min-h-screen bg-[#131313]">
      <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">

        {/* ── Machine Status Header ─────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-[#E5E2E1]">{machine?.name ?? "Machine"}</h1>
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-[#4ADE80]/20 bg-[#4ADE80]/[0.08] px-2 py-0.5 text-xs font-space text-[#4ADE80] uppercase tracking-widest">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4ADE80] pulse-dot inline-flex shrink-0" />
                Connected
              </span>
            </div>
            <p className="text-xs font-space uppercase tracking-widest text-[#9A8F7B]">
              fw {machine?.firmware ?? "—"} · {ip}
            </p>
          </div>

          {/* Boiler temp circular gauge */}
          <div className="shrink-0">
            <svg viewBox="0 0 100 100" className="w-20 h-20 md:w-24 md:h-24">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#2A2A2A" strokeWidth="7" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#F5C444" strokeWidth="7"
                strokeDasharray={`${(93 / 120) * 251.2} 251.2`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)" />
              <text x="50" y="46" textAnchor="middle" dominantBaseline="middle" fill="#E5E2E1" fontSize="18" fontWeight="900" fontFamily="inherit">93°</text>
              <text x="50" y="62" textAnchor="middle" dominantBaseline="middle" fill="#9A8F7B" fontSize="7" fontFamily="inherit">BOILER</text>
            </svg>
          </div>
        </div>

        {/* ── Action Grid ───────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ACTIONS.map(({ action, label, icon: Icon, hero, danger }) => {
            const base = "aspect-square rounded-sm flex flex-col items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-40";
            const cls = hero
              ? `${base} brass-gradient text-[#3E2E00] shadow-[0_0_24px_rgba(245,196,68,0.2)] hover:opacity-90`
              : danger
              ? `${base} ghost-border bg-[#1C1B1B] text-red-400 border-red-500/20 hover:bg-red-500/10`
              : `${base} ghost-border bg-[#1C1B1B] text-[#E5E2E1]/60 hover:text-[#FFE4AA] hover:border-[#F5C444]/20`;
            return (
              <button key={action} onClick={() => doAction(action)} disabled={actionLoading !== null} className={cls}>
                {actionLoading === action
                  ? <Loader2 className="h-6 w-6 animate-spin" />
                  : <Icon className="h-6 w-6" />
                }
                <span className="text-[10px] uppercase tracking-widest font-space">{label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Active Profile Card ───────────────────────────── */}
        {activeProfile && (
          <div className="ghost-border rounded bg-[#1C1B1B] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#9A8F7B] font-space">Active Profile</span>
                <p className="text-base font-black tracking-tight text-[#E5E2E1] mt-0.5">{activeProfile.name}</p>
              </div>
              <Link href="/profiles" className="text-xs font-space uppercase tracking-widest text-[#F5C444] hover:text-[#FFE4AA] transition-colors">
                All Profiles →
              </Link>
            </div>
            {/* Profile stage bars */}
            <div className="flex gap-1 h-12">
              {(activeProfile.stages ?? []).slice(0, 8).map((stage, i) => (
                <div key={i} className="flex-1 rounded-sm bg-[#F5C444]/20 flex items-end">
                  <div
                    className="w-full rounded-sm bg-[#F5C444]/60"
                    style={{ height: `${Math.min(100, 40 + i * 8)}%` }}
                  />
                </div>
              ))}
              {(activeProfile.stages ?? []).length === 0 && (
                <p className="text-xs text-[#9A8F7B]">No stage data</p>
              )}
            </div>
            <div className="flex gap-6 mt-4">
              {[["Stages", String(activeProfile.stages?.length ?? 0)], ["Profiles", String(profiles.length)], ["Serial", machine?.serial?.slice(0, 8) ?? "—"]].map(([l, v]) => (
                <div key={l}>
                  <p className="text-[10px] uppercase tracking-widest text-[#9A8F7B] font-space">{l}</p>
                  <p className="text-sm font-black text-[#E5E2E1] mt-0.5">{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Recent Sessions ───────────────────────────────── */}
        {recentShots.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-widest text-[#9A8F7B] font-space">Recent Sessions</span>
              <Link href="/history" className="text-xs font-space uppercase tracking-widest text-[#F5C444] hover:text-[#FFE4AA] transition-colors">
                View All →
              </Link>
            </div>
            <div className="space-y-2">
              {recentShots.map((shot) => (
                <Link
                  href={`/shot?id=${shot.id}`}
                  key={shot.id}
                  className="flex items-center gap-4 rounded-sm ghost-border bg-[#1C1B1B] px-4 py-3 hover:border-[#F5C444]/10 hover:bg-[#201F1F] transition-all group"
                >
                  <Coffee className="h-4 w-4 text-[#9A8F7B] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#E5E2E1] truncate group-hover:text-[#FFE4AA] transition-colors">
                      {shot.name}
                    </p>
                    <p className="text-xs text-[#9A8F7B] font-space uppercase tracking-wider mt-0.5">
                      {format(new Date(shot.time * 1000), "MMM d · HH:mm")}
                    </p>
                  </div>
                  <span className="text-xs font-space text-[#4E4635] uppercase tracking-widest">#{shot.db_key}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Refresh */}
        <div className="flex justify-center pt-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 ghost-border rounded-sm px-4 py-2 text-xs font-space uppercase tracking-widest text-[#E5E2E1]/40 hover:text-[#E5E2E1] hover:bg-[#1C1B1B] transition-all"
          >
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
