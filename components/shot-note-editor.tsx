"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { getShotNote, saveShotNote } from "@/lib/shot-notes";

interface ShotNoteEditorProps {
  timestamp: number;
  onSave?: () => void;
}

export function ShotNoteEditor({ timestamp, onSave }: ShotNoteEditorProps) {
  const existing = getShotNote(timestamp);
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [note, setNote] = useState(existing?.note ?? "");
  const [hovered, setHovered] = useState(0);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    saveShotNote(timestamp, rating, note);
    setSaved(true);
    onSave?.();
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-[#f5f0ea]/40 uppercase tracking-wider mb-2 block">
          Rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              className="transition-colors"
            >
              <Star
                className="h-6 w-6"
                fill={(hovered || rating) >= star ? "#e8944a" : "none"}
                stroke={
                  (hovered || rating) >= star ? "#e8944a" : "rgba(245,240,234,0.2)"
                }
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-[#f5f0ea]/40 uppercase tracking-wider mb-2 block">
          Tasting Notes
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Chocolatey finish, slight citrus…"
          rows={3}
          className="w-full rounded-xl border border-white/[0.06] bg-[#0c0a09] px-3 py-2.5 text-sm text-[#f5f0ea] placeholder:text-[#f5f0ea]/25 focus:outline-none focus:border-white/[0.15] resize-none transition-colors"
        />
      </div>

      <button
        onClick={handleSave}
        className="inline-flex items-center gap-1.5 rounded-xl bg-[#e8944a] px-4 py-2 text-sm font-semibold text-[#0c0a09] hover:bg-[#f0a060] transition-colors"
      >
        {saved ? "Saved ✓" : "Save Note"}
      </button>
    </div>
  );
}
