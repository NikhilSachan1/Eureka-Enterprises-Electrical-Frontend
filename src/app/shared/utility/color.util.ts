import { STATUS_COLOR_GROUPS } from '@shared/config/status-color.config';

export class ColorUtil {
  private static readonly COLOR_DEFINITIONS: Record<
    string,
    {
      severity: string;
      bg: string;
      border: string;
      text: string;
      hex: { primary: string; light: string; dark: string };
    }
  > = {
    success: {
      severity: 'success',
      bg: '!bg-green-50',
      border: 'border-l-green-500',
      text: 'text-green-600',
      hex: { primary: '#10b981', light: '#d1fae5', dark: '#059669' },
    },
    danger: {
      severity: 'danger',
      bg: '!bg-red-50',
      border: 'border-l-red-500',
      text: 'text-red-600',
      hex: { primary: '#ef4444', light: '#fee2e2', dark: '#dc2626' },
    },
    warning: {
      severity: 'warn',
      bg: '!bg-yellow-50',
      border: 'border-l-yellow-500',
      text: 'text-yellow-600',
      hex: { primary: '#f59e0b', light: '#fef3c7', dark: '#d97706' },
    },
    info: {
      severity: 'info',
      bg: '!bg-blue-50',
      border: 'border-l-blue-500',
      text: 'text-blue-600',
      hex: { primary: '#3b82f6', light: '#dbeafe', dark: '#2563eb' },
    },
    secondary: {
      severity: 'secondary',
      bg: 'bg-gray-50',
      border: 'border-l-gray-500',
      text: 'text-gray-600',
      hex: { primary: '#6b7280', light: '#f3f4f6', dark: '#4b5563' },
    },
  };

  private static readonly STATUS_COLOR_MAP: Record<string, string> =
    Object.entries(STATUS_COLOR_GROUPS).reduce(
      (acc, [color, statuses]) => {
        statuses.forEach(status => {
          acc[status] = color;
        });
        return acc;
      },
      {} as Record<string, string>
    );

  static getSeverity(status: string): string {
    const normalizedStatus = this.normalizeStatus(status);
    const color = this.STATUS_COLOR_MAP[normalizedStatus] ?? 'secondary';
    return this.COLOR_DEFINITIONS[color].severity;
  }

  static getColor(status: string): string {
    const normalizedStatus = this.normalizeStatus(status);
    const color = this.STATUS_COLOR_MAP[normalizedStatus] ?? 'secondary';
    const { border } = this.COLOR_DEFINITIONS[color];
    const match = border.match(/border-l-(\w+)-/);
    return match?.[1] ?? 'gray';
  }

  static getColorClass(status: string): {
    bg: string;
    border: string;
    text: string;
  } {
    const normalizedStatus = this.normalizeStatus(status);
    const color = this.STATUS_COLOR_MAP[normalizedStatus] ?? 'secondary';
    const { bg, border, text } = this.COLOR_DEFINITIONS[color];
    return { bg, border, text };
  }

  static getHexColors(status: string): {
    primary: string;
    light: string;
    dark: string;
  } {
    const normalizedStatus = this.normalizeStatus(status);
    const color = this.STATUS_COLOR_MAP[normalizedStatus] ?? 'secondary';
    return this.COLOR_DEFINITIONS[color].hex;
  }

  private static normalizeStatus(status: string): string {
    return status?.toLowerCase().trim() ?? '';
  }
}
