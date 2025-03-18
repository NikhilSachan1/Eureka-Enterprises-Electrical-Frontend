import { ThemeConfig, ThemeColors, ThemeMode } from '../../shared/models';

export const themeConfig: ThemeConfig = {
  light: {
    primary: {
      main: '#00a389',
      light: '#00bf9f',
      dark: '#008975',
      contrast: '#ffffff',
    },
    surface: {
      50: '#f0fdfb',
      100: '#e6f7f4',
      200: '#d1ebe7',
      300: '#bcded9',
      400: '#a7d1cc',
      500: '#92c4bf',
      600: '#7db7b2',
      700: '#68aaa5',
      800: '#539d98',
      900: '#3e908b',
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
      main: '#00d1ae',
      light: '#00e2bc',
      dark: '#00bf9f',
      contrast: '#ffffff',
    },
    surface: {
      50: '#0f172a',
      100: '#1e293b',
      200: '#334155',
      300: '#475569',
      400: '#64748b',
      500: '#94a3b8',
      600: '#cbd5e1',
      700: '#e2e8f0',
      800: '#f1f5f9',
      900: '#f8fafc',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
      disabled: '#64748b',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    border: {
      light: '#334155',
      main: '#475569',
      dark: '#64748b',
    },
    shadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
    },
  },
}; 