export class ColorUtil {
  private static readonly STATUS_GROUPS = {
    success: {
      severity: 'success',
      color: 'green',
      statuses: ['active', 'approved', 'present'],
    },
    danger: {
      severity: 'danger',
      color: 'red',
      statuses: ['inactive', 'rejected', 'absent'],
    },
    warning: {
      severity: 'warn',
      color: 'yellow',
      statuses: ['pending', 'leave'],
    },
    info: { severity: 'info', color: 'blue', statuses: ['holiday'] },
  };

  private static readonly STATUS_MAP = new Map(
    Object.values(this.STATUS_GROUPS).flatMap(group =>
      group.statuses.map(status => [status, [group.severity, group.color]])
    )
  );

  static getSeverity(status: string): string {
    const normalizedStatus = status?.toLowerCase().trim();
    return this.STATUS_MAP.get(normalizedStatus)?.[0] ?? 'secondary';
  }

  static getColor(status: string): string {
    const normalizedStatus = status?.toLowerCase().trim();
    return this.STATUS_MAP.get(normalizedStatus)?.[1] ?? 'gray';
  }
}
