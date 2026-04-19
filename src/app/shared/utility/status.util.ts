import { STATUS_MAP, SEVERITY_STYLES } from '@shared/config';
import { StatusSeverity, IStatusStyle } from '@shared/types';

export class StatusUtil {
  private static readonly statusCache = new Map<
    string,
    { icon: string; severity: StatusSeverity }
  >();

  // Build cache on first access
  private static initCache(): void {
    if (this.statusCache.size > 0) {
      return;
    }

    for (const [key, value] of Object.entries(STATUS_MAP)) {
      this.statusCache.set(key.toLowerCase().trim(), value);
    }
  }

  /**
   * Normalize status string (lowercase + trim)
   */
  private static normalize(status: string): string {
    return status?.toLowerCase().trim() ?? '';
  }

  /**
   * Get status definition from config
   */
  private static getStatusDef(
    status: string
  ): { icon: string; severity: StatusSeverity } | null {
    this.initCache();
    return this.statusCache.get(this.normalize(status)) ?? null;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ICON METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get icon class for a status
   * @returns Icon class or null if not found
   */
  static getIcon(status: string): string | null {
    return this.getStatusDef(status)?.icon ?? null;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COLOR / SEVERITY METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get PrimeNG severity string for a status
   * @returns Severity string ('success', 'danger', 'warn', 'info', 'secondary')
   */
  static getSeverity(status: string): string {
    const def = this.getStatusDef(status);
    const severity = def?.severity ?? 'secondary';
    return SEVERITY_STYLES[severity].severity;
  }

  /**
   * Get the severity type for a status
   * @returns StatusSeverity ('success', 'danger', 'warning', 'info', 'secondary')
   */
  static getSeverityType(status: string): StatusSeverity {
    return this.getStatusDef(status)?.severity ?? 'secondary';
  }

  /**
   * Whether `p-tag` needs Tailwind classes via `styleClass`.
   * Extended {@link StatusSeverity} entries use PrimeNG `secondary` only as a
   * fallback while real colors live in {@link SEVERITY_STYLES}; those cases
   * must not rely on Tag’s built-in secondary styling.
   */
  static needsTailwindTagOverride(status: string): boolean {
    const severityType = this.getSeverityType(status);
    const primeSlot = SEVERITY_STYLES[severityType].severity;
    return severityType !== 'secondary' && primeSlot === 'secondary';
  }

  /**
   * Get color name (for Tailwind classes)
   * @returns Color name ('green', 'red', 'yellow', 'blue', 'gray')
   */
  static getColor(status: string): string {
    const severity = this.getSeverityType(status);
    const { border } = SEVERITY_STYLES[severity];
    const match = border.match(/border-(\w+)-/);
    return match?.[1] ?? 'gray';
  }

  /**
   * Get Tailwind CSS classes for a status
   * @returns Object with bg, border, text classes
   */
  static getColorClass(status: string): {
    bg: string;
    border: string;
    text: string;
  } {
    const severity = this.getSeverityType(status);
    const { bg, border, text } = SEVERITY_STYLES[severity];
    return { bg, border, text };
  }

  /**
   * Get hex color values for a status
   * @returns Object with primary, light, dark hex colors
   */
  static getHexColors(status: string): {
    primary: string;
    light: string;
    dark: string;
  } {
    const severity = this.getSeverityType(status);
    return SEVERITY_STYLES[severity].hex;
  }

  /**
   * Get full style definition for a severity
   */
  static getStyle(status: string): IStatusStyle {
    const severity = this.getSeverityType(status);
    return SEVERITY_STYLES[severity];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COMBINED METHODS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get all status information at once
   * @returns Object with icon, severity, and full style
   */
  static getAll(status: string): {
    icon: string | null;
    severity: string;
    severityType: StatusSeverity;
    style: IStatusStyle;
  } {
    const def = this.getStatusDef(status);
    const severityType = def?.severity ?? 'secondary';

    return {
      icon: def?.icon ?? null,
      severity: SEVERITY_STYLES[severityType].severity,
      severityType,
      style: SEVERITY_STYLES[severityType],
    };
  }

  /**
   * Check if a status exists in the config
   */
  static exists(status: string): boolean {
    return this.getStatusDef(status) !== null;
  }
}
