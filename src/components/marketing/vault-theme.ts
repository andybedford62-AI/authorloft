// Shared design tokens for the "Vault" homepage identity — blue/gold, no pill
// buttons, no centered headline blocks. See memory/project_visual_identity_vault.md
// for the decision this implements. Scoped to the public homepage for now;
// not wired into src/app/globals.css or the per-author site theme system
// (src/lib/themes.ts), which stay untouched.
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
  radius: 6,
  fontDisplay: "Georgia, 'Iowan Old Style', serif",
  fontBody: "'Helvetica Neue', Arial, sans-serif",
} as const;
