"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Coffee, ArrowRight, Loader2 } from "lucide-react";
import { ConnectDialog } from "@/components/connect-dialog";
import { getSavedIp } from "@/lib/connection-store";
import { testConnection } from "@/lib/machine-api";

export default function HomePage() {
  const router = useRouter();
  const [showConnect, setShowConnect] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const ip = getSavedIp();
    if (!ip) { setChecking(false); return; }
    testConnection(ip)
      .then(() => router.replace("/dashboard"))
      .catch(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#131313]">
        <Loader2 className="h-5 w-5 animate-spin text-[#F5C444]/50" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#131313]">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-24 overflow-hidden">
        {/* SVG pressure curve line art */}
        <svg className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.04]" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice">
          <path d="M0,400 C100,400 150,200 300,180 C450,160 500,350 600,300 C700,250 750,100 900,120 C1050,140 1100,280 1200,260" stroke="#F5C444" strokeWidth="2" fill="none" />
          <path d="M0,450 C100,450 150,250 300,230 C450,210 500,400 600,350 C700,300 750,150 900,170 C1050,190 1100,330 1200,310" stroke="#FFE4AA" strokeWidth="1.5" fill="none" />
        </svg>
        {/* Warm glow */}
        <div className="pointer-events-none absolute top-1/3 left-1/4 w-[600px] h-[400px] rounded-full bg-[#F5C444] opacity-[0.04] blur-[120px]" />

        <div className="relative max-w-4xl">
          {/* Label */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-8 bg-[#F5C444]" />
            <span className="text-[11px] uppercase tracking-widest text-[#F5C444] font-space">
              Laboratory Grade Precision
            </span>
          </div>
          {/* H1 */}
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-[#E5E2E1] leading-[1.0] mb-3">
            Your Meticulous.
          </h1>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-[1.0] mb-8">
            <span className="brass-gradient bg-clip-text text-transparent">Fully Unleashed.</span>
          </h1>
          {/* Subtext */}
          <p className="text-base sm:text-lg text-[#E5E2E1]/50 max-w-xl mb-10 leading-relaxed">
            Connect locally to your machine. Browse community profiles,
            monitor extractions live, and share telemetry-rich shot data.
          </p>
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowConnect(true)}
              className="inline-flex items-center gap-2 brass-gradient rounded-sm px-6 py-3 text-sm font-black uppercase tracking-widest text-[#3E2E00] hover:opacity-90 transition-all active:scale-95 shadow-[0_0_30px_rgba(245,196,68,0.2)]"
            >
              <Coffee className="h-4 w-4" /> Connect My Machine
            </button>
            <Link
              href="/community"
              className="inline-flex items-center gap-2 ghost-border rounded-sm px-6 py-3 text-sm font-medium text-[#E5E2E1]/60 hover:text-[#E5E2E1] hover:bg-[#1C1B1B] transition-all"
            >
              Browse Community <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#E5E2E1]/20">
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-[#F5C444]/30" />
          <span className="text-[10px] uppercase tracking-widest font-space">Scroll</span>
        </div>
      </section>

      {/* ── Bento grid ──────────────────────────────────────── */}
      <section className="px-6 md:px-24 py-24 bg-[#0E0E0E]">
        <div className="mb-12">
          <span className="text-[10px] uppercase tracking-widest text-[#F5C444] font-space">Platform Features</span>
          <h2 className="text-3xl font-black tracking-tight text-[#E5E2E1] mt-2">Built for obsessives.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Large card — telemetry stats */}
          <div className="md:col-span-8 ghost-border rounded bg-[#1C1B1B] p-8 flex flex-col gap-6">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#9A8F7B] font-space">Live Telemetry</span>
              <h3 className="text-xl font-black tracking-tight text-[#E5E2E1] mt-1">Real-time Pressure Mapping</h3>
            </div>
            <div className="flex gap-8">
              {[["50Hz","Sample Rate"],["0.01","BAR Resolution"],["~300","Points/Shot"]].map(([v, l]) => (
                <div key={l}>
                  <p className="text-3xl font-black text-[#F5C444]">{v}</p>
                  <p className="text-xs text-[#9A8F7B] uppercase tracking-wider mt-1 font-space">{l}</p>
                </div>
              ))}
            </div>
            {/* Mini bar chart */}
            <div className="h-20 flex items-end gap-1 mt-auto">
              {[30,45,70,85,90,88,82,78,75,72,70,68,65,62,60,55,50,45,40,35].map((h, i) => (
                <div key={i} className="flex-1 rounded-sm bg-[#F5C444]/20" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>

          {/* Community card */}
          <div className="md:col-span-4 ghost-border rounded bg-[#1C1B1B] p-6 flex flex-col gap-4">
            <span className="text-[10px] uppercase tracking-widest text-[#9A8F7B] font-space">Community</span>
            <div className="flex-1 flex flex-col justify-center gap-4">
              <div>
                <p className="text-4xl font-black text-[#E5E2E1]">OEPF</p>
                <p className="text-xs text-[#9A8F7B] mt-1 font-space uppercase tracking-wider">Open Profile Format</p>
              </div>
              <div className="h-px bg-[#4E4635]/30" />
              <div>
                <p className="text-2xl font-black text-[#FFE4AA]">100%</p>
                <p className="text-xs text-[#9A8F7B] mt-1 font-space uppercase tracking-wider">Open Source</p>
              </div>
            </div>
          </div>

          {/* Connection card */}
          <div className="md:col-span-4 ghost-border rounded bg-[#201F1F] p-6 flex flex-col gap-3">
            <span className="text-[10px] uppercase tracking-widest text-[#9A8F7B] font-space">Local Network</span>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-[#4ADE80] pulse-dot shrink-0" />
              <span className="text-sm text-[#E5E2E1]/70">Direct connection</span>
            </div>
            <p className="text-xs text-[#9A8F7B] leading-relaxed">No cloud. No subscription. Connects over your local network via HTTP API.</p>
          </div>

          {/* API version card */}
          <div className="md:col-span-8 ghost-border rounded bg-[#201F1F] p-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#9A8F7B] font-space">API Compatibility</span>
              <p className="text-xl font-black text-[#E5E2E1] mt-1">Meticulous REST API v1</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#9A8F7B] font-space uppercase tracking-wider">Cost to run</p>
              <p className="text-3xl font-black text-[#F5C444]">$0</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Split section ────────────────────────────────────── */}
      <section className="grid md:grid-cols-2 min-h-[500px]">
        {/* Left: abstract gradient art */}
        <div className="relative bg-[#1C1B1B] flex items-center justify-center overflow-hidden min-h-[300px] md:min-h-0">
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full bg-[#F5C444] opacity-[0.08] blur-[60px]" />
            <div className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full bg-[#FFE4AA] opacity-[0.05] blur-[40px]" />
            <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 300">
              <path d="M0,200 C80,200 100,80 200,60 C300,40 320,160 400,140" stroke="#F5C444" strokeWidth="1.5" fill="none" />
              <path d="M0,220 C80,220 100,100 200,80 C300,60 320,180 400,160" stroke="#FFE4AA" strokeWidth="1" fill="none" />
              <circle cx="200" cy="60" r="4" fill="#F5C444" opacity="0.5" />
            </svg>
          </div>
          <p className="relative z-10 text-6xl font-black text-[#F5C444] opacity-20 select-none">BAR</p>
        </div>

        {/* Right: features list */}
        <div className="bg-[#131313] px-8 md:px-12 py-12 flex flex-col justify-center gap-6">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#F5C444] font-space">Why metbarista</span>
            <h2 className="text-2xl font-black tracking-tight text-[#E5E2E1] mt-2">Everything your machine can do.</h2>
          </div>
          <ul className="space-y-4">
            {[
              "Full shot history with pressure, flow & temperature curves",
              "Browse and load profiles from your machine",
              "Live telemetry streaming via Socket.IO",
              "Compare up to 5 extractions side-by-side",
              "Share rich shot data with the community",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full brass-gradient shrink-0" />
                <span className="text-sm text-[#E5E2E1]/60">{item}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => setShowConnect(true)}
            className="self-start inline-flex items-center gap-2 ghost-border rounded-sm px-5 py-2.5 text-sm font-medium text-[#E5E2E1]/60 hover:text-[#FFE4AA] hover:border-[#F5C444]/20 transition-all"
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      <ConnectDialog
        open={showConnect}
        onConnected={() => router.replace("/dashboard")}
        onCancel={() => setShowConnect(false)}
      />
    </div>
  );
}
