/**
 * PrimeNG theme preset: Aura with app primary palette for light and dark.
 * Per official doc: https://primeng.org/theming/styled
 * - colorScheme.light / colorScheme.dark so both modes use our theme palette.
 */
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { themeConfig } from './theme.config';

const lightPrimary = themeConfig.light.primary;
const darkPrimary = themeConfig.dark.primary;

const primaryTokens = (p: typeof lightPrimary): Record<string, string> => ({
  50: p[50],
  100: p[100],
  200: p[200],
  300: p[300],
  400: p[400],
  500: p[500],
  600: p[600],
  700: p[700],
  800: p[800],
  900: p[900],
  950: p[950],
});

export const AppPreset = definePreset(Aura, {
  semantic: {
    primary: primaryTokens(lightPrimary),
    colorScheme: {
      light: {
        semantic: {
          primary: primaryTokens(lightPrimary),
        },
      },
      dark: {
        semantic: {
          primary: primaryTokens(darkPrimary),
        },
      },
    },
  },
});
