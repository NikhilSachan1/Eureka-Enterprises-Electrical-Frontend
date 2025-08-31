export class ColorUtil {
  private static readonly STATUS_GROUPS = {
    success: {
      severity: 'success',
      colorClasses: {
        bg: '!bg-green-50',
        border: 'border-l-green-500',
        text: 'text-green-600',
      },
      statuses: ['active', 'approved', 'approve', 'present', 'clearselection'],
    },
    danger: {
      severity: 'danger',
      colorClasses: {
        bg: '!bg-red-50',
        border: 'border-l-red-500',
        text: 'text-red-600',
      },
      statuses: ['inactive', 'rejected', 'reject', 'absent', 'delete'],
    },
    warning: {
      severity: 'warn',
      colorClasses: {
        bg: '!bg-yellow-50',
        border: 'border-l-yellow-500',
        text: 'text-yellow-600',
      },
      statuses: ['pending', 'leave', 'regularize', 'edit'],
    },
    info: {
      severity: 'info',
      colorClasses: {
        bg: '!bg-blue-50',
        border: 'border-l-blue-500',
        text: 'text-blue-600',
      },
      statuses: ['holiday', 'view', 'setpermissions'],
    },
  };

  private static readonly STATUS_MAP = new Map(
    Object.values(this.STATUS_GROUPS).flatMap(group =>
      group.statuses.map(status => [
        status,
        [group.severity, group.colorClasses],
      ])
    )
  );

  static getSeverity(status: string): string {
    const normalizedStatus = status?.toLowerCase().trim();
    const statusData = this.STATUS_MAP.get(normalizedStatus);
    return (statusData?.[0] as string) ?? 'secondary';
  }

  static getColor(status: string): string {
    const normalizedStatus = status?.toLowerCase().trim();
    const statusData = this.STATUS_MAP.get(normalizedStatus);
    if (statusData?.[1]) {
      const colorClasses = statusData[1] as {
        bg: string;
        border: string;
        text: string;
      };
      const match = colorClasses.border.match(/border-l-(\w+)-/);
      return match?.[1] ?? 'gray';
    }
    return 'gray';
  }

  static getColorClass(label: string): {
    bg: string;
    border: string;
    text: string;
  } {
    const normalizedStatus = label?.toLowerCase().trim();
    const statusData = this.STATUS_MAP.get(normalizedStatus);

    if (statusData?.[1]) {
      return statusData[1] as { bg: string; border: string; text: string };
    }

    return {
      bg: 'bg-gray-50',
      border: 'border-l-gray-500',
      text: 'text-gray-600',
    };
  }
}
