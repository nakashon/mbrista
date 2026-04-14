"use client";

import { useMemo } from "react";
import type { Profile } from "@/lib/types";

// Per-stage-type colour palette
const TYPE_COLOR: Record<string, string> = {
  pressure: "#60a5fa", // blue
  flow:     "#22d3ee", // cyan
  power:    "#a78bfa", // purple
};

const FALLBACK_DURATION = 15; // seconds, when no time-based exit trigger

interface Props {
  profile: Profile;
  height?: number;
  /** accent colour override (falls back to profile.display.accentColor) */
  accent?: string;
}

/**
 * Full-bleed generative SVG "fingerprint" for a profile.
 * Plots every stage as a pressure/flow/power trace with:
 *  - coloured stage-zone background bands
 *  - per-type curve + filled area
 *  - dashed stage-transition markers
 *  - subtle horizontal grid
 *  - accent-coloured bottom border
 *
 * Used as the hero image for profiles that have no official display.image.
 */
export function ProfileFingerprint({ profile, height = 144, accent }: Props) {
  const W = 600; // internal viewBox width — scales to container

  const data = useMemo(() => {
    const stages = profile.stages ?? [];
    if (!stages.length) return null;

    // Build a variable lookup so "$key" refs resolve to numeric values
    const vars: Record<string, number> = {};
    for (const v of profile.variables ?? []) {
      vars[`$${v.key}`] = typeof v.value === "number" ? v.value : 6;
    }
    const resolve = (v: number | string): number =>
      typeof v === "number" ? v : (vars[v] ?? 6);

    // Walk stages → build timeline segments
    type Seg = { start: number; end: number; type: string; name: string; pts: { t: number; v: number }[] };
    const segs: Seg[] = [];
    let cursor = 0;

    for (const stage of stages) {
      const { dynamics, exit_triggers, type, name } = stage;
      if (!dynamics?.points?.length) continue;

      const timeTrig = (exit_triggers ?? []).find((t) => t.type === "time");
      const duration = timeTrig ? Number(timeTrig.value) : FALLBACK_DURATION;

      const pts = dynamics.points.map(([dt, dv]) => ({
        t: cursor + Number(dt),
        v: resolve(dv as number | string),
      }));

      // Extend last point to fill the full stage duration
      const last = pts[pts.length - 1];
      if (last.t < cursor + duration) pts.push({ t: cursor + duration, v: last.v });

      segs.push({ start: cursor, end: cursor + duration, type, name, pts });
      cursor += duration;
    }

    if (!segs.length) return null;

    const totalTime = cursor;
    const maxVal = Math.max(...segs.flatMap((s) => s.pts.map((p) => p.v)), 9);

    const px = (t: number) => (t / totalTime) * W;
    const py = (v: number) => height - 10 - (v / maxVal) * (height - 28);

    // Merge points per type into sorted traces
    const byType = new Map<string, { t: number; v: number }[]>();
    for (const seg of segs) {
      if (!byType.has(seg.type)) byType.set(seg.type, []);
      byType.get(seg.type)!.push(...seg.pts);
    }

    const traces = [...byType.entries()].map(([type, rawPts]) => {
      const sorted = [...rawPts].sort((a, b) => a.t - b.t);
      const d = sorted.map((p, i) => `${i === 0 ? "M" : "L"} ${px(p.t).toFixed(1)} ${py(p.v).toFixed(1)}`).join(" ");
      const fill = `${d} L ${px(sorted.at(-1)!.t).toFixed(1)} ${height} L ${px(sorted[0].t).toFixed(1)} ${height} Z`;
      return { type, d, fill, color: TYPE_COLOR[type] ?? "#e8944a" };
    });

    // Stage background bands + transition markers
    const bands = segs.map((s) => ({ x: px(s.start), w: px(s.end) - px(s.start), color: TYPE_COLOR[s.type] ?? "#e8944a" }));
    const markers = segs.slice(1).map((s) => px(s.start));

    // Horizontal grid lines at 3 / 6 / 9 units
    const gridYs = [3, 6, 9].map((v) => py(v));

    return { traces, bands, markers, gridYs };
  }, [profile, height, W]);

  if (!data) return null;

  const accentColor = accent ?? profile.display?.accentColor ?? "#e8944a";
  const uid = profile.id ?? "fp";

  return (
    <svg
      viewBox={`0 0 ${W} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      className="w-full block"
      aria-hidden="true"
    >
      <defs>
        {data.traces.map((tr) => (
          <linearGradient key={tr.type} id={`fp-${uid}-${tr.type}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={tr.color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={tr.color} stopOpacity={0.02} />
          </linearGradient>
        ))}
      </defs>

      {/* Stage zone tints */}
      {data.bands.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={height} fill={b.color} opacity={0.05} />
      ))}

      {/* Horizontal grid */}
      {data.gridYs.map((y, i) => (
        <line key={i} x1={0} y1={y} x2={W} y2={y} stroke="white" strokeOpacity={0.05} strokeWidth={1} />
      ))}

      {/* Stage transition dashes */}
      {data.markers.map((x, i) => (
        <line key={i} x1={x} y1={0} x2={x} y2={height} stroke="white" strokeOpacity={0.10} strokeWidth={1} strokeDasharray="3 5" />
      ))}

      {/* Fill areas */}
      {data.traces.map((tr) => (
        <path key={`f-${tr.type}`} d={tr.fill} fill={`url(#fp-${uid}-${tr.type})`} />
      ))}

      {/* Curve lines — pressure on top so it's most visible */}
      {[...data.traces].reverse().map((tr) => (
        <path key={`l-${tr.type}`} d={tr.d} fill="none" stroke={tr.color}
          strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      ))}

      {/* Accent bottom rule */}
      <line x1={0} y1={height - 1} x2={W} y2={height - 1} stroke={accentColor} strokeOpacity={0.5} strokeWidth={1.5} />
    </svg>
  );
}
