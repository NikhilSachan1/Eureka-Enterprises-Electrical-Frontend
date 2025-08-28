import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AvatarService {
  private readonly API_BASE_URL = 'https://ui-avatars.com/api/';

  private readonly SOLID_COLORS = [
    '1E40AF', // Dark Blue
    '065F46', // Dark Emerald
    '92400E', // Dark Amber
    '991B1B', // Dark Red
    '5B21B6', // Dark Violet
    '164E63', // Dark Cyan/Teal
    '9A3412', // Deep Orange
    '3730A3', // Dark Indigo
    '3F6212', // Dark Lime
    '9D174D', // Deep Pink
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
    if (!name) {
      return this.SOLID_COLORS[0];
    }

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
