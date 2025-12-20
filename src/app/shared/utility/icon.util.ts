import { STATUS_ICON_GROUPS } from '@shared/config/status-icon.config';

export class IconUtil {
  static getIcon(status: string): string | null {
    const normalizedStatus = this.normalizeStatus(status);
    return STATUS_ICON_GROUPS[normalizedStatus] ?? null;
  }

  private static normalizeStatus(status: string): string {
    return status?.toLowerCase().trim() ?? '';
  }
}
