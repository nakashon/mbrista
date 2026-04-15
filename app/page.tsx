"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Coffee, Gauge, History, ArrowRight, Layers, GitCompare, Radio, Share2, Loader2, Star, GitFork } from "lucide-react";
import { ConnectDialog } from "@/components/connect-dialog";
import { getSavedIp, saveIp, getIpFromUrlParam } from "@/lib/connection-store";
import { testConnection } from "@/lib/machine-api";

const FEATURES = [
  { icon: GitCompare, title: "Shot Comparison",   desc: "Overlay multiple shots on one chart. See exactly why shot 47 tasted better than shot 46.", color: "#34d399" },
  { icon: History,    title: "Deep Analytics",    desc: "~300 data points per shot — pressure, flow, weight, temperature, motor load. Every sensor, every frame.", color: "#60a5fa" },
  { icon: Layers,     title: "Profile Inspector", desc: "See the full OEPF stage diagram, dynamics, variables, and lineage of every profile on your machine.", color: "#a78bfa" },
  { icon: Radio,      title: "Live Telemetry",    desc: "Real-time extraction chart with phase timeline. Watch pressure build, bloom, and flow — as it happens.", color: "#f87171" },
  { icon: Share2,     title: "Geeky Share Cards", desc: "Share a profile with actual shot data attached — pressure curves, extraction stats, full OEPF spec.", color: "#f5a855" },
  { icon: Gauge,      title: "Full Control",      desc: "Preheat, tare, purge, start/stop — everything the official app does, right in your browser.", color: "#e8944a" },
];

export default function HomePage() {
  const router = useRouter();
  const [showConnect, setShowConnect] = useState(false);
  const [checking, setChecking] = useState(true);
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    // If ?ip= is in the URL, save it and go straight to dashboard
    const urlIp = getIpFromUrlParam();
    if (urlIp) {
      saveIp(urlIp.trim());
      router.replace("/dashboard");
      return;
    }
    const ip = getSavedIp();
    if (!ip) { setChecking(false); return; }
    testConnection(ip)
      .then(() => router.replace("/dashboard"))
      .catch(() => setChecking(false));
  }, [router]);

  useEffect(() => {
    fetch("https://api.github.com/repos/nakashon/metbarista")
      .then(r => r.json())
      .then(d => setStars(d.stargazers_count))
      .catch(() => {});
  }, []);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0c0a09]">
        <Loader2 className="h-5 w-5 animate-spin text-[#e8944a]/50" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0a09]">
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Radial glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[600px] w-[800px] rounded-full bg-[#e8944a] opacity-[0.05] blur-[140px]" />
        </div>
        {/* Pressure curve line art — very subtle */}
        <div className="pointer-events-none absolute bottom-0 inset-x-0 overflow-hidden">
          <svg className="w-full opacity-[0.12]" viewBox="0 0 1200 160" preserveAspectRatio="none">
            <path d="M0,150 Q150,150 220,70 T480,45 T700,110 T920,30 T1200,35"
              fill="none" stroke="#e8944a" strokeWidth="2" />
            <path d="M0,158 Q150,158 220,78 T480,53 T700,118 T920,38 T1200,43"
              fill="none" stroke="#e8944a" strokeWidth="1" opacity="0.4" />
          </svg>
        </div>
        <div className="relative mx-auto max-w-4xl px-6 py-28 text-center w-full">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e8944a]/20 bg-[#e8944a]/[0.08] px-3 py-1 text-xs font-medium text-[#e8944a] mb-8">
            <Coffee className="h-3 w-3" />
            Built by a daily Meticulous user · Free forever · Open source
          </div>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-[#f5f0ea] mb-6 leading-[1.05]">
            The official app gets<br />
            <span className="text-[#e8944a]">you started.</span>
          </h1>
          <p className="text-lg text-[#f5f0ea]/50 max-w-2xl mx-auto mb-4 leading-relaxed">
            MetBarista is for when you want to go deeper.
          </p>
          <p className="text-sm text-[#f5f0ea]/35 max-w-xl mx-auto mb-10 leading-relaxed">
            I pull shots every morning. After a while I wanted to compare shot 47 to shot 46,
            understand why one tasted better, build profiles with real data behind them.
            So I built this — a geeky, open control center for people who take their espresso seriously.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setShowConnect(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#e8944a] px-7 py-3.5 text-sm font-semibold text-[#0c0a09] hover:bg-[#f5a855] transition-all shadow-[0_0_40px_rgba(232,148,74,0.3)] hover:shadow-[0_0_55px_rgba(232,148,74,0.45)] active:scale-[0.98]"
            >
              <Coffee className="h-4 w-4" /> Connect My Machine
            </button>
            <Link
              href="/profiles"
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.04] px-7 py-3.5 text-sm font-medium text-[#f5f0ea]/70 hover:bg-white/[0.07] hover:text-[#f5f0ea] transition-all"
            >
              Browse Profiles <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-white/[0.05] bg-white/[0.02]">
        <div className="mx-auto max-w-4xl px-6 py-6 grid grid-cols-3 gap-4 text-center">
          {[
            { value: "~300", label: "Data points per shot" },
            { value: "4",    label: "Shots overlaid at once" },
            { value: "0",    label: "Cost to run" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-2xl font-bold font-mono text-[#e8944a]">{value}</p>
              <p className="text-xs text-[#f5f0ea]/35 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-2xl font-bold text-[#f5f0ea] text-center mb-3">What the official app doesn&apos;t do</h2>
        <p className="text-[#f5f0ea]/40 text-center text-sm mb-12">Everything runs in your browser, directly connected to your machine. No install. No backend. No cloud.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="group rounded-2xl border border-white/[0.06] bg-[#161210] p-5 hover:border-white/[0.12] hover:bg-[#1e1b16] transition-all">
              <div className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: `${color}18`, color }}>
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-[#f5f0ea] mb-1.5">{title}</h3>
              <p className="text-sm text-[#f5f0ea]/45 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Open Source CTA */}
      <section className="border-t border-white/[0.05]">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e8944a]/20 bg-[#e8944a]/[0.06] px-3 py-1 text-xs font-medium text-[#e8944a] mb-6">
            Open Source
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#f5f0ea] mb-3">
            Built by the community, for the community
          </h2>
          <p className="text-[#f5f0ea]/45 text-sm max-w-xl mx-auto mb-8 leading-relaxed">
            MetBarista is fully open source — MIT licensed. Read the code, suggest features,
            fix bugs, or build your own tools on top of the Meticulous API.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://github.com/nakashon/metbarista"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-xl bg-white/[0.06] border border-white/[0.10] px-6 py-3 text-sm font-semibold text-[#f5f0ea] hover:bg-white/[0.10] hover:border-white/[0.18] transition-all"
            >
              <Star className="h-4 w-4 text-yellow-400" />
              Star on GitHub
              {stars !== null && (
                <span className="ml-1 font-mono text-xs text-[#f5f0ea]/40 bg-white/[0.06] rounded px-1.5 py-0.5">{stars}</span>
              )}
            </a>
            <a
              href="https://github.com/nakashon/metbarista/fork"
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-6 py-3 text-sm font-medium text-[#f5f0ea]/55 hover:bg-white/[0.05] hover:text-[#f5f0ea] transition-all"
            >
              <GitFork className="h-4 w-4" /> Fork & Contribute
            </a>
          </div>
          <p className="text-xs text-[#f5f0ea]/25 mt-6">
            <a href="https://github.com/nakashon/metbarista" target="_blank" rel="noopener noreferrer"
               className="hover:text-[#f5f0ea]/50 transition-colors font-mono">
              github.com/nakashon/metbarista
            </a>
          </p>
        </div>
      </section>

      {/* Ecosystem */}
      <section className="border-t border-white/[0.05]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <h2 className="text-lg font-semibold text-[#f5f0ea] mb-6">The Meticulous Ecosystem</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { title: "metprofiles.link",   desc: "Community profiles — browse, rate, and load to your machine",     href: "https://metprofiles.link" },
              { title: "Discord Community",  desc: "The official (unofficial) Meticulous community server",            href: "https://discord.gg/w48ha2h3" },
              { title: "MeticulousHome",     desc: "Open-source firmware, backend, API clients, and more",             href: "https://github.com/MeticulousHome" },
            ].map(({ title, desc, href }) => (
              <a key={title} href={href} target="_blank" rel="noopener noreferrer"
                className="group flex items-start gap-3 rounded-xl border border-white/[0.06] bg-[#161210] p-4 hover:border-white/[0.12] hover:bg-[#1e1b16] transition-all">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#f5f0ea] group-hover:text-[#e8944a] transition-colors">{title}</p>
                  <p className="text-xs text-[#f5f0ea]/40 mt-1 leading-relaxed">{desc}</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[#f5f0ea]/20 group-hover:text-[#e8944a] group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
              </a>
            ))}
          </div>
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
