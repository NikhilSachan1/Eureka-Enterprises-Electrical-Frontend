/**
 * Theme utilities: generate primary color shades from a single hex (main) color.
 * Set PRIMARY_MAIN in theme.config.ts to change the entire primary palette.
 */

export interface PrimaryShades {
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
  950: string;
  main: string;
  light: string;
  dark: string;
  contrast: string;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex: ${hex}`);
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number): string => {
    const h = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return h.length === 1 ? `0${h}` : h;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Mix two hex colors by a given weight (0 = full first, 1 = full second).
 */
export function mixHex(hex1: string, hex2: string, weight: number): string {
  const r1 = hexToRgb(hex1);
  const r2 = hexToRgb(hex2);
  const w = Math.max(0, Math.min(1, weight));
  return rgbToHex(
    r1.r + (r2.r - r1.r) * w,
    r1.g + (r2.g - r1.g) * w,
    r1.b + (r2.b - r1.b) * w
  );
}

/**
 * Generates a full primary palette from one main hex color.
 * 50 = lightest tint (toward white), 500 = main, 900 = darkest shade (toward black).
 * Light theme only (dark theme will be handled later).
 */
export function generatePrimaryShades(mainHex: string): PrimaryShades {
  const white = '#ffffff';
  const black = '#0a0a0a';

  const s50 = mixHex(mainHex, white, 0.92);
  const s100 = mixHex(mainHex, white, 0.84);
  const s200 = mixHex(mainHex, white, 0.68);
  const s300 = mixHex(mainHex, white, 0.48);
  const s400 = mixHex(mainHex, white, 0.28);
  const s500 = mainHex;
  const s600 = mixHex(mainHex, black, 0.18);
  const s700 = mixHex(mainHex, black, 0.38);
  const s800 = mixHex(mainHex, black, 0.52);
  const s900 = mixHex(mainHex, black, 0.65);
  const s950 = mixHex(mainHex, black, 0.78);

  return {
    50: s50,
    100: s100,
    200: s200,
    300: s300,
    400: s400,
    500: s500,
    600: s600,
    700: s700,
    800: s800,
    900: s900,
    950: s950,
    main: s500,
    light: s400,
    dark: s600,
    contrast: '#ffffff',
  };
}
