import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AvatarService {
  private readonly API_BASE_URL = 'https://ui-avatars.com/api/';

  private readonly SOLID_COLORS = [
    '007bff', // Blue
    '28a745', // Green
    'dc3545', // Red
    'ffc107', // Yellow
    '17a2b8', // Cyan
    '6f42c1', // Purple
    'e83e8c', // Pink
    'fd7e14', // Orange
    '20c997', // Teal
    '6c757d', // Gray
    '343a40', // Dark gray
    '495057', // Medium dark gray
    '8b5cf6', // Violet
    'f59e0b', // Amber
    'ef4444', // Red variant
    '10b981', // Emerald
    '3b82f6', // Blue variant
    '8b5a2b', // Brown
    '6366f1', // Indigo
    '84cc16', // Lime
  ];

  /**
   * Generate avatar URL with consistent background color for the same name
   */
  getAvatarFromName(name: string): string {
    const backgroundColor = this.getConsistentColor(name);

    const params = new URLSearchParams({
      name,
      background: backgroundColor,
      color: 'ffffff',
      size: '40',
    });

    return `${this.API_BASE_URL}?${params.toString()}`;
  }

  private getConsistentColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      const char = name.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    const index = Math.abs(hash) % this.SOLID_COLORS.length;
    return this.SOLID_COLORS[index];
  }
}
