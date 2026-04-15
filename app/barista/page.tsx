"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Target,
  Trophy,
  Flame,
  TrendingUp,
  Star,
  Coffee,
  Award,
  ChevronRight,
  Edit3,
  Check,
  Share2,
  Lock,
  Zap,
} from "lucide-react";
import { getBaristaProfile, setNickname, initBarista } from "@/lib/barista";
import type { BaristaProfile } from "@/lib/barista";
import { getBaristaStats, DIALED_IN_THRESHOLD, MASTERY_THRESHOLD } from "@/lib/barista-stats";
import type { BaristaStats, ProfileMastery, Achievement } from "@/lib/barista-stats";
import { getMachineInfo } from "@/lib/machine-api";
import { getSavedIp } from "@/lib/connection-store";

// ── Level progress bar ───────────────────────────────────────

function LevelProgress({ stats }: { stats: BaristaStats }) {
  const { level } = stats;
  const next = level.nextLevel;
  const progress = next
    ? ((stats.dialedInCount - level.dialedInRequired) /
        (next.dialedInRequired - level.dialedInRequired)) *
      100
    : 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[#e8944a]">{level.title}</span>
        {next && (
          <span className="text-xs text-[#f5f0ea]/30">
            {next.dialedInRequired - stats.dialedInCount} more to {next.title}
          </span>
        )}
      </div>
      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#e8944a] to-[#f59e0b] transition-all duration-700"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
    </div>
  );
}

// ── Stats hero grid ──────────────────────────────────────────

function StatsGrid({ stats }: { stats: BaristaStats }) {
  const items = [
    { Icon: Coffee, value: stats.totalShots, label: "Total Shots", color: "#f5f0ea" },
    { Icon: Target, value: stats.dialedInCount, label: "Dialed In", color: "#22c55e" },
    { Icon: Flame, value: stats.currentStreak, label: "Streak", color: stats.currentStreak >= 3 ? "#f59e0b" : "#f5f0ea" },
    { Icon: Trophy, value: stats.profilesMastered, label: "Mastered", color: "#e8944a" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map(({ Icon, value, label, color }) => (
        <div key={label} className="rounded-2xl border border-white/[0.06] bg-[#161210] p-4 text-center">
          <Icon className="h-4 w-4 mx-auto mb-2" style={{ color }} />
          <p className="text-2xl font-bold font-mono" style={{ color }}>{value}</p>
          <p className="text-[10px] text-[#f5f0ea]/30 mt-0.5 uppercase tracking-wider">{label}</p>
        </div>
      ))}
    </div>
  );
}

// ── Profile mastery card ─────────────────────────────────────

function MasteryCard({ mastery }: { mastery: ProfileMastery }) {
  const progress = Math.min(100, (mastery.dialedInCount / MASTERY_THRESHOLD) * 100);
  const dots = Array.from({ length: MASTERY_THRESHOLD }, (_, i) => i < mastery.dialedInCount);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#161210] p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#f5f0ea] truncate">{mastery.profileName}</p>
          <p className="text-xs text-[#f5f0ea]/30 mt-0.5">
            {mastery.dialedInCount}/{mastery.totalShots} shots dialed in · avg {mastery.avgScore}
          </p>
        </div>
        {mastery.mastered && (
          <div className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#e8944a]/10 border border-[#e8944a]/20">
            <Star className="h-3 w-3 text-[#e8944a]" fill="#e8944a" />
            <span className="text-xs font-bold text-[#e8944a]">Mastered</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {dots.map((filled, i) => (
          <div
            key={i}
            className={`h-2 w-2 rounded-full transition-all ${
              filled ? "bg-[#22c55e]" : "bg-white/[0.08]"
            }`}
          />
        ))}
        {mastery.dialedInCount > MASTERY_THRESHOLD && (
          <span className="text-[10px] text-[#22c55e]/60 ml-1">+{mastery.dialedInCount - MASTERY_THRESHOLD}</span>
        )}
      </div>
      <div className="flex items-center gap-3 text-xs text-[#f5f0ea]/25">
        <span>Best: <span className="text-[#f5f0ea]/50 font-mono">{mastery.bestScore}</span></span>
        <span>·</span>
        <span>Avg: <span className="text-[#f5f0ea]/50 font-mono">{mastery.avgScore}</span></span>
      </div>
    </div>
  );
}

// ── Achievement badge ────────────────────────────────────────

function AchievementBadge({ achievement }: { achievement: Achievement }) {
  const unlocked = !!achievement.unlockedAt;

  return (
    <div
      className={`rounded-xl border p-3 text-center transition-all ${
        unlocked
          ? "border-[#e8944a]/20 bg-[#161210]"
          : "border-white/[0.04] bg-[#0c0a09] opacity-40"
      }`}
    >
      <div className="text-2xl mb-1">{unlocked ? achievement.icon : "🔒"}</div>
      <p className={`text-xs font-medium ${unlocked ? "text-[#f5f0ea]" : "text-[#f5f0ea]/30"}`}>
        {achievement.title}
      </p>
      <p className="text-[10px] text-[#f5f0ea]/25 mt-0.5">{achievement.description}</p>
    </div>
  );
}

// ── Share card (copyable) ────────────────────────────────────

function ShareCard({ profile, stats }: { profile: BaristaProfile; stats: BaristaStats }) {
  const [copied, setCopied] = useState(false);

  const shareText = [
    `☕ MetBarista — ${profile.nickname}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `${stats.totalShots} shots · ${stats.dialedInCount} dialed in · ${stats.profilesMastered} profiles mastered`,
    stats.currentStreak >= 3 ? `Current streak: ${stats.currentStreak} 🔥` : null,
    `Level: ${stats.level.title}`,
    `Dial-in rate: ${stats.dialedInRate}%`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `metbarista.com`,
  ]
    .filter(Boolean)
    .join("\n");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#161210] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#f5f0ea]">Share Your Stats</p>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.10] px-3 py-1.5 text-xs font-medium text-[#f5f0ea]/60 hover:text-[#f5f0ea] hover:border-[#e8944a]/30 transition-all"
        >
          {copied ? <Check className="h-3 w-3 text-[#22c55e]" /> : <Share2 className="h-3 w-3" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="text-xs font-mono text-[#f5f0ea]/50 bg-[#0c0a09] rounded-xl border border-white/[0.06] p-4 overflow-auto whitespace-pre-wrap">
        {shareText}
      </pre>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────

export default function BaristaPage() {
  const [profile, setProfile] = useState<BaristaProfile | null>(null);
  const [stats, setStats] = useState<BaristaStats | null>(null);
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      // Try to init barista from machine
      const ip = getSavedIp();
      if (ip) {
        try {
          const info = await getMachineInfo();
          const bp = await initBarista(info.serial, info.name);
          setProfile(bp);
        } catch {
          // Machine offline — use stored profile
          const stored = getBaristaProfile();
          setProfile(stored);
        }
      } else {
        const stored = getBaristaProfile();
        setProfile(stored);
      }

      setStats(getBaristaStats());
      setLoading(false);
    }
    init();
  }, []);

  const handleSaveNickname = () => {
    if (nicknameInput.trim()) {
      const updated = setNickname(nicknameInput.trim());
      if (updated) setProfile(updated);
    }
    setEditingNickname(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20 min-h-screen bg-[#0c0a09]">
        <div className="h-6 w-6 rounded-full border-2 border-[#e8944a] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center px-6">
        <div className="text-center max-w-sm space-y-4">
          <Coffee className="h-10 w-10 text-[#e8944a] mx-auto" />
          <h1 className="text-xl font-bold text-[#f5f0ea]">Connect Your Machine</h1>
          <p className="text-sm text-[#f5f0ea]/40">
            Your barista profile is created automatically when you connect to your Meticulous machine.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-[#e8944a] px-5 py-2.5 text-sm font-semibold text-[#0c0a09] hover:bg-[#f59e0b] transition-colors"
          >
            Go to Setup <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const unlockedAchievements = stats?.achievements.filter((a) => a.unlockedAt) ?? [];
  const lockedAchievements = stats?.achievements.filter((a) => !a.unlockedAt) ?? [];

  return (
    <div className="min-h-screen bg-[#0c0a09]">
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#e8944a] to-[#f59e0b] flex items-center justify-center text-2xl font-bold text-[#0c0a09] shrink-0">
            {profile.nickname.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            {editingNickname ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveNickname()}
                  maxLength={30}
                  autoFocus
                  className="bg-[#161210] border border-[#e8944a]/30 rounded-lg px-3 py-1.5 text-lg font-bold text-[#f5f0ea] focus:outline-none focus:border-[#e8944a] w-full max-w-xs"
                />
                <button onClick={handleSaveNickname} className="p-1.5 rounded-lg bg-[#e8944a]/10 text-[#e8944a] hover:bg-[#e8944a]/20 transition-colors">
                  <Check className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#f5f0ea] truncate">{profile.nickname}</h1>
                <button
                  onClick={() => { setNicknameInput(profile.nickname); setEditingNickname(true); }}
                  className="p-1 rounded text-[#f5f0ea]/20 hover:text-[#f5f0ea]/60 transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <p className="text-sm text-[#f5f0ea]/30 mt-0.5">
              {profile.machineName} · {stats?.level.title}
            </p>
          </div>
        </div>

        {/* Level progress */}
        {stats && <LevelProgress stats={stats} />}

        {/* Stats grid */}
        {stats && <StatsGrid stats={stats} />}

        {/* Dial-in rate */}
        {stats && stats.totalShots > 0 && (
          <div className="rounded-2xl border border-white/[0.06] bg-[#161210] p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#f5f0ea]/60">Dial-in Rate</span>
              <span className="text-sm font-mono font-bold text-[#e8944a]">{stats.dialedInRate}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#22c55e] transition-all duration-500"
                style={{ width: `${stats.dialedInRate}%` }}
              />
            </div>
            <p className="text-xs text-[#f5f0ea]/25 mt-2">
              {stats.dialedInCount} of {stats.totalShots} shots scored {DIALED_IN_THRESHOLD}+
            </p>
          </div>
        )}

        {/* Profile mastery */}
        {stats && stats.profiles.length > 0 && (
          <div>
            <p className="text-xs text-[#f5f0ea]/35 uppercase tracking-wider mb-3">Profile Mastery</p>
            <div className="space-y-2">
              {stats.profiles.map((m) => (
                <MasteryCard key={m.profileId} mastery={m} />
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {stats && (
          <div>
            <p className="text-xs text-[#f5f0ea]/35 uppercase tracking-wider mb-3">
              Achievements ({unlockedAchievements.length}/{stats.achievements.length})
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {unlockedAchievements.map((a) => (
                <AchievementBadge key={a.id} achievement={a} />
              ))}
              {lockedAchievements.map((a) => (
                <AchievementBadge key={a.id} achievement={a} />
              ))}
            </div>
          </div>
        )}

        {/* Share card */}
        {stats && stats.totalShots > 0 && <ShareCard profile={profile} stats={stats} />}
      </div>
    </div>
  );
}
