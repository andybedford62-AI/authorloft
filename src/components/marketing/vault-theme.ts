// Shared design tokens for the "Vault" visual identity — blue/gold, no pill
// buttons, no centered headline blocks — used across the public marketing
// site (not admin, not per-author sites, see src/lib/themes.ts).
//
// The canonical source of truth is now the `@theme` block in
// src/app/globals.css, which generates real Tailwind utilities
// (bg-vault-surf, text-vault-gold, rounded-vault, font-vault-display, ...).
// Prefer those utility classes in new code. This object stays as a manually
// synced mirror for the handful of call sites that structurally need a raw
// JS value — inline SVG `fill=`, the numeric `radius`, or JS color math —
// where a className isn't an option. Keep both in sync if the palette ever
// changes.
export const VAULT = {
  bg:     '#16233d',
  bgDeep: '#111b30',
  surf:   '#1e2f4d',
  surf2:  '#243756',
  ink:    '#f3ecdb',
  mute:   '#93a0bc',
  gold:      '#d6a94a',
  goldLight: '#e2bc6e',
  goldMuted: '#a8752a',
  good: '#5fbf8a',
  hair: 'rgba(243,236,219,.12)',
  line: '#2c3f5e',
  cream:       '#f5f0e8',
  creamBorder: '#d8ceb8',
  creamInk:    '#1a1008',
  creamMute:   '#5a4a38',
  radius: 6,
  fontDisplay: "Georgia, 'Iowan Old Style', serif",
  fontBody: "'Helvetica Neue', Arial, sans-serif",
} as const;
