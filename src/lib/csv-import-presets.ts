/**
 * Browser-local saved column-mapping presets for the Book CSV import wizard.
 *
 * Presets let an author re-use a custom column mapping on a second CSV from the
 * same source (e.g. another export from the same tool). Stored per-browser in
 * localStorage — no server round-trip, no account binding.
 */

import type { ColumnMapping } from "@/lib/csv-import";

const STORAGE_KEY = "al_csv_import_presets";

export type MappingPreset = {
  name: string;
  mapping: ColumnMapping;
};

/** Read all saved presets (sorted A–Z). Returns [] if none / unavailable. */
export function loadPresets(): MappingPreset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((p): p is MappingPreset => !!p && typeof p.name === "string" && !!p.mapping)
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

/** Save (or overwrite by name) a preset. Returns the updated list. */
export function savePreset(name: string, mapping: ColumnMapping): MappingPreset[] {
  const trimmed = name.trim();
  if (!trimmed) return loadPresets();
  const others = loadPresets().filter((p) => p.name.toLowerCase() !== trimmed.toLowerCase());
  const next = [...others, { name: trimmed, mapping }].sort((a, b) => a.name.localeCompare(b.name));
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage full / disabled — silently no-op
  }
  return next;
}

/** Delete a preset by name. Returns the updated list. */
export function deletePreset(name: string): MappingPreset[] {
  const next = loadPresets().filter((p) => p.name.toLowerCase() !== name.toLowerCase());
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // no-op
  }
  return next;
}
