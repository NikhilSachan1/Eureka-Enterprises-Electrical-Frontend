import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
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
    '84cc16'  // Lime
  ];

  /**
   * Generate avatar URL with random background color
   */
  getAvatarFromName(name: string): string {
    const backgroundColor = this.getRandomColor();
    
    const params = new URLSearchParams({
      name: name,
      background: backgroundColor,
      color: 'ffffff',
      size: '40',
    });

    return `${this.API_BASE_URL}?${params.toString()}`;
  }

  private getRandomColor(): string {
    const randomIndex = Math.floor(Math.random() * this.SOLID_COLORS.length);
    return this.SOLID_COLORS[randomIndex];
  }
} 