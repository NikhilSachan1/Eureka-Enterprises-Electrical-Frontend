/**
 * Type for theme modes supported by the application
 */
export type ThemeMode = 'light' | 'dark';

/**
 * Interface representing the colors for a theme
 */
export interface ThemeColors {
  primary: {
    main: string;
    light: string;
    dark: string;
    contrast: string;
  };
  surface: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  background: {
    default: string;
    paper: string;
  };
  border: {
    light: string;
    main: string;
    dark: string;
  };
  shadow: {
    sm: string;
    md: string;
    lg: string;
  };
}

/**
 * Interface for the application theme configuration
 * Contains color values for both light and dark themes
 */
export interface ThemeConfig {
  light: ThemeColors;
  dark: ThemeColors;
} 