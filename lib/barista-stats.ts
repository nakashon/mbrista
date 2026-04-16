/**
 * Barista Stats & Gamification Engine
 *
 * Computes dialed-in count, profile mastery, streaks, level,
 * and achievements from local shot analysis data.
 */

import type { ShotAnalysis } from "./shot-analysis";

// ── Constants ────────────────────────────────────────────────

const STORAGE_KEY = "metbarista_barista_stats";
const DIALED_IN_THRESHOLD = 90;
const MASTERY_THRESHOLD = 5; // dialed-in shots needed for mastery

// ── Types ────────────────────────────────────────────────────

export interface ShotRecord {
  shotTimestamp: number;
  profileId: string;
  profileName: string;
  score: number;
  dialedIn: boolean;
}

export interface ProfileMastery {
  profileId: string;
  profileName: string;
  dialedInCount: number;
  totalShots: number;
  bestScore: number;
  avgScore: number;
  mastered: boolean;
  masteredAt?: number; // timestamp when mastery achieved
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji
  unlockedAt?: number;
}

export interface BaristaLevel {
  level: number;
  title: string;
  dialedInRequired: number;
  nextLevel?: { title: string; dialedInRequired: number };
}

export interface BaristaStats {
  totalShots: number;
  dialedInCount: number;
  dialedInRate: number; // 0-100
  currentStreak: number;
  bestStreak: number;
  profilesMastered: number;
  level: BaristaLevel;
  profiles: ProfileMastery[];
  achievements: Achievement[];
  shotLog: ShotRecord[];
}

// ── Level system ─────────────────────────────────────────────

const LEVELS: { title: string; dialedIn: number }[] = [
  { title: "Beginner", dialedIn: 0 },
  { title: "Apprentice", dialedIn: 5 },
  { title: "Home Barista", dialedIn: 15 },
  { title: "Dial-In Pro", dialedIn: 30 },
  { title: "Shot Whisperer", dialedIn: 50 },
  { title: "Pressure Artist", dialedIn: 75 },
  { title: "Flow Master", dialedIn: 100 },
  { title: "Extraction Sage", dialedIn: 150 },
  { title: "Espresso Legend", dialedIn: 250 },
  { title: "☕ Grandmaster", dialedIn: 500 },
];

function computeLevel(dialedInCount: number): BaristaLevel {
  let current = LEVELS[0];
  let nextIdx = 1;

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (dialedInCount >= LEVELS[i].dialedIn) {
      current = LEVELS[i];
      nextIdx = i + 1;
      break;
    }
  }

  return {
    level: nextIdx,
    title: current.title,
    dialedInRequired: current.dialedIn,
    nextLevel:
      nextIdx < LEVELS.length
        ? { title: LEVELS[nextIdx].title, dialedInRequired: LEVELS[nextIdx].dialedIn }
        : undefined,
  };
}

// ── Achievements ─────────────────────────────────────────────

interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  check: (stats: { dialedIn: number; streak: number; bestStreak: number; mastered: number; totalShots: number }) => boolean;
}

const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { id: "first_shot", title: "First Pull", description: "Pull your first shot", icon: "☕", check: (s) => s.totalShots >= 1 },
  { id: "first_dialed_in", title: "Dialed In!", description: "Score 90+ on a shot", icon: "🎯", check: (s) => s.dialedIn >= 1 },
  { id: "dialed_5", title: "Getting Consistent", description: "5 dialed-in shots", icon: "📈", check: (s) => s.dialedIn >= 5 },
  { id: "dialed_25", title: "Quarter Century", description: "25 dialed-in shots", icon: "🏅", check: (s) => s.dialedIn >= 25 },
  { id: "dialed_50", title: "Half Century", description: "50 dialed-in shots", icon: "🏆", check: (s) => s.dialedIn >= 50 },
  { id: "dialed_100", title: "The Hundred Club", description: "100 dialed-in shots", icon: "💯", check: (s) => s.dialedIn >= 100 },
  { id: "streak_3", title: "Hat Trick", description: "3 dialed-in shots in a row", icon: "🔥", check: (s) => s.bestStreak >= 3 },
  { id: "streak_5", title: "On Fire", description: "5 dialed-in shots in a row", icon: "🔥", check: (s) => s.bestStreak >= 5 },
  { id: "streak_10", title: "Unstoppable", description: "10 dialed-in shots in a row", icon: "⚡", check: (s) => s.bestStreak >= 10 },
  { id: "first_mastery", title: "Profile Master", description: "Master your first profile", icon: "⭐", check: (s) => s.mastered >= 1 },
  { id: "mastery_3", title: "Multi-Talented", description: "Master 3 different profiles", icon: "🌟", check: (s) => s.mastered >= 3 },
  { id: "mastery_5", title: "Versatile", description: "Master 5 different profiles", icon: "💫", check: (s) => s.mastered >= 5 },
  { id: "shots_50", title: "Dedicated", description: "Pull 50 total shots", icon: "💪", check: (s) => s.totalShots >= 50 },
  { id: "shots_100", title: "Centurion", description: "Pull 100 total shots", icon: "🎖️", check: (s) => s.totalShots >= 100 },
];

// ── Storage ──────────────────────────────────────────────────

interface StatsStore {
  shotLog: ShotRecord[];
  achievementTimestamps: Record<string, number>; // achievement id → unlock timestamp
}

function readStore(): StatsStore {
  if (typeof window === "undefined") return { shotLog: [], achievementTimestamps: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { shotLog: [], achievementTimestamps: {} };
    return JSON.parse(raw) as StatsStore;
  } catch {
    return { shotLog: [], achievementTimestamps: {} };
  }
}

function writeStore(store: StatsStore): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

// ── Public API ───────────────────────────────────────────────

/**
 * Record a shot result. Call after analysis. Deduplicates by timestamp.
 * Returns any newly unlocked achievements.
 */
export function recordShot(
  shotTimestamp: number,
  profileId: string,
  profileName: string,
  analysis: ShotAnalysis
): Achievement[] {
  const store = readStore();

  // Dedup
  if (store.shotLog.some((r) => r.shotTimestamp === shotTimestamp)) return [];

  const record: ShotRecord = {
    shotTimestamp,
    profileId,
    profileName,
    score: analysis.overallScore,
    dialedIn: analysis.overallScore >= DIALED_IN_THRESHOLD && analysis.applicableCount >= 2,
  };

  store.shotLog.push(record);
  store.shotLog.sort((a, b) => a.shotTimestamp - b.shotTimestamp);

  // Check for new achievements
  const stats = computeStatsFromLog(store.shotLog);
  const newAchievements: Achievement[] = [];

  for (const def of ACHIEVEMENT_DEFS) {
    if (store.achievementTimestamps[def.id]) continue; // already unlocked
    if (
      def.check({
        dialedIn: stats.dialedInCount,
        streak: stats.currentStreak,
        bestStreak: stats.bestStreak,
        mastered: stats.profilesMastered,
        totalShots: stats.totalShots,
      })
    ) {
      store.achievementTimestamps[def.id] = Date.now();
      newAchievements.push({
        id: def.id,
        title: def.title,
        description: def.description,
        icon: def.icon,
        unlockedAt: Date.now(),
      });
    }
  }

  writeStore(store);
  return newAchievements;
}

function computeStatsFromLog(shotLog: ShotRecord[]): {
  totalShots: number;
  dialedInCount: number;
  currentStreak: number;
  bestStreak: number;
  profilesMastered: number;
} {
  const dialedIn = shotLog.filter((r) => r.dialedIn);

  // Streaks (consecutive dialed-in from most recent)
  let currentStreak = 0;
  for (let i = shotLog.length - 1; i >= 0; i--) {
    if (shotLog[i].dialedIn) currentStreak++;
    else break;
  }

  let bestStreak = 0;
  let streak = 0;
  for (const r of shotLog) {
    if (r.dialedIn) {
      streak++;
      bestStreak = Math.max(bestStreak, streak);
    } else {
      streak = 0;
    }
  }

  // Profile mastery
  const profileDialedIn: Record<string, number> = {};
  for (const r of dialedIn) {
    profileDialedIn[r.profileId] = (profileDialedIn[r.profileId] ?? 0) + 1;
  }
  const profilesMastered = Object.values(profileDialedIn).filter(
    (c) => c >= MASTERY_THRESHOLD
  ).length;

  return {
    totalShots: shotLog.length,
    dialedInCount: dialedIn.length,
    currentStreak,
    bestStreak,
    profilesMastered,
  };
}

/** Get full barista stats. */
export function getBaristaStats(): BaristaStats {
  const store = readStore();
  const log = store.shotLog;
  const raw = computeStatsFromLog(log);

  // Per-profile stats
  const profileMap: Record<string, ShotRecord[]> = {};
  for (const r of log) {
    if (!profileMap[r.profileId]) profileMap[r.profileId] = [];
    profileMap[r.profileId].push(r);
  }

  const profiles: ProfileMastery[] = Object.entries(profileMap).map(
    ([profileId, shots]) => {
      const dialedInShots = shots.filter((s) => s.dialedIn);
      const scores = shots.map((s) => s.score);
      const mastered = dialedInShots.length >= MASTERY_THRESHOLD;
      return {
        profileId,
        profileName: shots[0].profileName,
        dialedInCount: dialedInShots.length,
        totalShots: shots.length,
        bestScore: Math.max(...scores),
        avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        mastered,
        masteredAt: mastered
          ? dialedInShots[MASTERY_THRESHOLD - 1]?.shotTimestamp
            ? dialedInShots[MASTERY_THRESHOLD - 1].shotTimestamp * 1000
            : undefined
          : undefined,
      };
    }
  );
  profiles.sort((a, b) => b.dialedInCount - a.dialedInCount);

  // Achievements
  const achievements: Achievement[] = ACHIEVEMENT_DEFS.map((def) => ({
    id: def.id,
    title: def.title,
    description: def.description,
    icon: def.icon,
    unlockedAt: store.achievementTimestamps[def.id] ?? undefined,
  }));

  const dialedInRate =
    log.length > 0 ? Math.round((raw.dialedInCount / log.length) * 100) : 0;

  return {
    totalShots: raw.totalShots,
    dialedInCount: raw.dialedInCount,
    dialedInRate,
    currentStreak: raw.currentStreak,
    bestStreak: raw.bestStreak,
    profilesMastered: raw.profilesMastered,
    level: computeLevel(raw.dialedInCount),
    profiles,
    achievements,
    shotLog: log,
  };
}

/** Check if a score qualifies as "dialed in". */
export function isDialedIn(score: number, applicableCount: number): boolean {
  return score >= DIALED_IN_THRESHOLD && applicableCount >= 2;
}

export { DIALED_IN_THRESHOLD, MASTERY_THRESHOLD };
