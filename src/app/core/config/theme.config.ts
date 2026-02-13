import { ThemeConfig } from '@shared/types';
import { generatePrimaryShades } from './theme.utils';

// ═══════════════════════════════════════════════════════════════════════════════
// BRAND / PRIMARY COLORS — Yahan se poora app ka accent color control hota hai
// ═══════════════════════════════════════════════════════════════════════════════

/** Light theme: Ye hex change karo → buttons, links, active states sab isi se derive honge */
export const PRIMARY_MAIN = '#006D5B';

/** Dark theme: Dark mode mein primary accent (zyda bright nahi, easy on eyes) */
export const DARK_PRIMARY_MAIN = '#94a3b8';

const primaryShades = generatePrimaryShades(PRIMARY_MAIN);
const darkPrimaryShades = generatePrimaryShades(DARK_PRIMARY_MAIN);

// ═══════════════════════════════════════════════════════════════════════════════
// THEME CONFIG — light / dark dono modes ke colors
// ═══════════════════════════════════════════════════════════════════════════════

export const themeConfig: ThemeConfig = {
  light: {
    // —— Primary: Brand color + shades (50=lightest, 500=main, 900=darkest). Buttons, links, focus.
    primary: {
      ...primaryShades,
      main: primaryShades[500],
      light: primaryShades[400],
      dark: primaryShades[600],
      contrast: primaryShades.contrast,
    },
    // —— Surface: Cards, panels, dropdowns ke backgrounds (50=light, 900=dark)
    surface: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    // —— Text: primary = headings/body, secondary = labels/captions, disabled = greyed out
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      disabled: '#94a3b8',
    },
    // —— Background: default = page bg, paper = card/sheet bg
    background: {
      default: '#ffffff',
      paper: '#f8fafc',
    },
    // —— Border: dividers, outlines (light=subtle, dark=strong)
    border: {
      light: '#e2e8f0',
      main: '#cbd5e1',
      dark: '#94a3b8',
    },
    // —— Shadow: sm/md/lg for elevation
    shadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    },
  },
  dark: {
    // —— Primary: Dark mode accent (muted so it doesn’t glare)
    primary: {
      ...darkPrimaryShades,
      main: darkPrimaryShades[500],
      light: darkPrimaryShades[400],
      dark: darkPrimaryShades[600],
      contrast: '#ffffff',
    },
    // —— Surface: Dark surfaces (50=darkest, 900=lightest — inverted from light)
    surface: {
      50: '#0c1222',
      100: '#151c2e',
      200: '#1e293b',
      300: '#334155',
      400: '#475569',
      500: '#64748b',
      600: '#94a3b8',
      700: '#cbd5e1',
      800: '#e2e8f0',
      900: '#f1f5f9',
    },
    // —— Text: primary = main content, secondary = labels (thoda muted)
    text: {
      primary: '#ffffff',
      secondary: '#94a3b8',
      disabled: '#64748b',
    },
    // —— Background: default = page, paper = cards
    background: {
      default: '#0c1222',
      paper: '#151c2e',
    },
    // —— Border: dark mode borders
    border: {
      light: '#1e293b',
      main: '#334155',
      dark: '#475569',
    },
    // —— Shadow: same structure, slightly stronger opacity for dark
    shadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
    },
  },
};
