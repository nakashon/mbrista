const STORAGE_KEY = "metbarista_shot_notes";

type NoteRecord = { rating: number; note: string; savedAt: number };
type NotesStore = Record<number, NoteRecord>;

function readStore(): NotesStore {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as NotesStore;
  } catch {
    return {};
  }
}

export function getShotNote(timestamp: number): { rating: number; note: string } | null {
  const store = readStore();
  const entry = store[timestamp];
  if (!entry) return null;
  return { rating: entry.rating, note: entry.note };
}

export function saveShotNote(timestamp: number, rating: number, note: string): void {
  const store = readStore();
  store[timestamp] = { rating, note, savedAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getAllNotes(): Record<number, { rating: number; note: string; savedAt: number }> {
  return readStore();
}
