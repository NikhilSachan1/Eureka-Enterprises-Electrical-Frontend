import { ThemeConfig } from '@shared/types';
import { generatePrimaryShades } from './theme.utils';

/** Single source of truth: set this hex to change the entire primary palette (light theme). */
export const PRIMARY_MAIN = '#BA8E23';

/** Primary color for dark theme: muted slate (dark-mode style, no bright accent). */
export const DARK_PRIMARY_MAIN = '#94a3b8';

const primaryShades = generatePrimaryShades(PRIMARY_MAIN);
const darkPrimaryShades = generatePrimaryShades(DARK_PRIMARY_MAIN);

export const themeConfig: ThemeConfig = {
  light: {
    primary: {
      ...primaryShades,
      main: primaryShades[500],
      light: primaryShades[400],
      dark: primaryShades[600],
      contrast: primaryShades.contrast,
    },
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
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      disabled: '#94a3b8',
    },
    background: {
      default: '#ffffff',
      paper: '#f8fafc',
    },
    border: {
      light: '#e2e8f0',
      main: '#cbd5e1',
      dark: '#94a3b8',
    },
    shadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    },
  },
  dark: {
    primary: {
      ...darkPrimaryShades,
      main: darkPrimaryShades[500],
      light: darkPrimaryShades[400],
      dark: darkPrimaryShades[600],
      contrast: '#ffffff',
    },
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
    text: {
      primary: '#ffffff',
      secondary: '#e2e8f0',
      disabled: '#64748b',
    },
    background: {
      default: '#0c1222',
      paper: '#151c2e',
    },
    border: {
      light: '#1e293b',
      main: '#334155',
      dark: '#475569',
    },
    shadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
    },
  },
};
