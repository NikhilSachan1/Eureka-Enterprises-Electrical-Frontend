/**
 * Status severity types used for status styling and color mapping
 * Note: 'warning' maps to 'warn' for PrimeNG compatibility
 * Extended colors: purple, orange, teal, pink, cyan, indigo
 */
export type StatusSeverity =
  // PrimeNG standard severities
  'success' | 'danger' | 'warning' | 'info' | 'secondary' | 'purple';

export interface IStatusStyle {
  severity: string; // PrimeNG severity string ('success', 'danger', 'warn', 'info', 'secondary')
  bg: string; // Tailwind background class
  border: string; // Tailwind border class
  text: string; // Tailwind text color class
  hex: {
    primary: string;
    light: string;
    dark: string;
  };
}

export interface IStatusEntry {
  icon: string;
  severity: StatusSeverity;
}
