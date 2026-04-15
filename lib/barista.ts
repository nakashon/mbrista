/**
 * Barista Identity — zero-friction identity from machine serial.
 *
 * Your machine IS your login. Serial gets SHA-256 hashed into an
 * anonymous barista ID. You pick a nickname for fun. No PII.
 */

const STORAGE_KEY = "metbarista_barista";

export interface BaristaProfile {
  id: string;          // SHA-256 hash of machine serial
  nickname: string;
  machineSerial: string;
  machineName: string;
  createdAt: number;
  updatedAt: number;
}

// ── Hashing ──────────────────────────────────────────────────

async function sha256(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Generate a short barista ID from machine serial (first 12 hex chars). */
export async function generateBaristaId(serial: string): Promise<string> {
  const full = await sha256(`metbarista:${serial}`);
  return full.slice(0, 12);
}

// ── Storage ──────────────────────────────────────────────────

function readProfile(): BaristaProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BaristaProfile) : null;
  } catch {
    return null;
  }
}

function writeProfile(profile: BaristaProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

// ── Public API ───────────────────────────────────────────────

/** Get the stored barista profile, or null if not yet created. */
export function getBaristaProfile(): BaristaProfile | null {
  return readProfile();
}

/** Create or update the barista profile from machine info. */
export async function initBarista(
  serial: string,
  machineName: string,
  nickname?: string
): Promise<BaristaProfile> {
  const existing = readProfile();
  const id = await generateBaristaId(serial);

  // If already exists with same ID, just update machine name
  if (existing && existing.id === id) {
    existing.machineName = machineName;
    existing.updatedAt = Date.now();
    if (nickname) existing.nickname = nickname;
    writeProfile(existing);
    return existing;
  }

  // New profile
  const profile: BaristaProfile = {
    id,
    nickname: nickname ?? generateDefaultNickname(),
    machineSerial: serial,
    machineName,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  writeProfile(profile);
  return profile;
}

/** Update just the nickname. */
export function setNickname(nickname: string): BaristaProfile | null {
  const profile = readProfile();
  if (!profile) return null;
  profile.nickname = nickname.trim().slice(0, 30);
  profile.updatedAt = Date.now();
  writeProfile(profile);
  return profile;
}

/** Generate a fun default nickname. */
function generateDefaultNickname(): string {
  const adjectives = [
    "Silky", "Bold", "Smooth", "Precise", "Steady",
    "Golden", "Velvet", "Sharp", "Clean", "Focused",
  ];
  const nouns = [
    "Barista", "Puller", "Dialer", "Tamper", "Brewer",
    "Pourer", "Grinder", "Crafter", "Steamer", "Dosser",
  ];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
}
