/**
 * v2 colour tokens: the single source of colour for the EWS app.
 *
 * Every colour the v2 prototype uses is listed here once. New screens import
 * from this file instead of writing hex values (see docs/ai-prompting-template.md).
 *
 * - `palette`   raw scales, named the way the v2 values were chosen (Tailwind scales)
 * - `colors`    roles: text, surfaces, borders, brand
 * - `alertLevel` and `capSeverity`  colours that carry meaning (G111: red only for danger)
 */

export const palette = {
  white: '#ffffff',
  black: '#000000',
  slate: {
    50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8',
    500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a',
  },
  gray: {
    50: '#f9fafb', 200: '#e5e7eb', 400: '#9ca3af', 700: '#374151',
  },
  blue: {
    50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 400: '#60a5fa', 500: '#3b82f6',
    600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a',
  },
  navy: '#1e3a5f',
  indigo: { 600: '#4f46e5' },
  green: {
    50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80',
    500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d',
  },
  emerald: { 100: '#d1fae5', 500: '#10b981', 600: '#059669', 800: '#065f46' },
  teal: { 50: '#f0fdfa', 400: '#2dd4bf', 600: '#0d9488', 700: '#0f766e' },
  amber: {
    50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 400: '#fbbf24', 500: '#f59e0b',
    600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f',
  },
  yellow: { 100: '#fef9c3', 700: '#a16207', 800: '#854d0e' },
  orange: {
    50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 400: '#fb923c', 500: '#f97316',
    600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12',
  },
  red: {
    50: '#fef2f2', 100: '#fee2e2', 300: '#fca5a5', 400: '#f87171', 500: '#ef4444',
    600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d',
  },
  purple: {
    50: '#faf5ff', 200: '#e9d5ff', 400: '#c084fc', 500: '#a855f7', 600: '#9333ea',
    800: '#6b21a8', 900: '#581c87',
  },
  violet: { 500: '#8b5cf6' },
  /** Pastel photo backgrounds used on the safe-route cards. */
  photo: { green: '#e2f0d9', peach: '#fce4d6', yellow: '#fff2cc', blue: '#ddebf7' },
  /** Switch track colour when off. */
  switchOff: '#f4f3f4',
} as const;

export const colors = {
  text: {
    primary: palette.slate[900],
    secondary: palette.slate[600],
    muted: palette.slate[500],
    disabled: palette.slate[400],
    inverse: palette.white,
  },
  surface: {
    page: palette.slate[50],
    card: palette.white,
    subtle: palette.slate[100],
  },
  border: {
    default: palette.slate[300],
    subtle: palette.slate[200],
  },
  brand: {
    primary: palette.blue[900],
    action: palette.blue[600],
    actionLight: palette.blue[50],
  },
  overlay: {
    scrim: 'rgba(0, 0, 0, 0.2)',
    shadow: 'rgba(0, 0, 0, 0.08)',
    onDark: 'rgba(255, 255, 255, 0.2)',
  },
} as const;

export interface AlertLevelColors {
  bg: string;
  text: string;
  buttonBg: string;
  buttonText: string;
}

/**
 * G111: calm green for safe, amber for warning, red ONLY for danger.
 * `warningMuted` is the softer amber used for autism and schizophrenia.
 */
export const alertLevel = {
  safe: { bg: palette.emerald[100], text: palette.emerald[800], buttonBg: palette.emerald[600], buttonText: palette.white },
  warning: { bg: palette.amber[100], text: palette.amber[800], buttonBg: palette.amber[500], buttonText: palette.white },
  warningMuted: { bg: palette.amber[100], text: palette.amber[900], buttonBg: palette.amber[600], buttonText: palette.white },
  danger: { bg: palette.red[600], text: palette.white, buttonBg: palette.white, buttonText: palette.red[600] },
} as const satisfies Record<string, AlertLevelColors>;

/** G119: one colour pair per CAP severity. */
export const capSeverity = {
  Extreme: { bg: palette.red[900], text: palette.red[50] },
  Severe: { bg: palette.amber[800], text: palette.amber[50] },
  Moderate: { bg: palette.navy, text: palette.blue[50] },
  Minor: { bg: palette.green[900], text: palette.green[50] },
  Unknown: { bg: palette.gray[700], text: palette.gray[50] },
} as const;
