import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-card.component.html',
  styleUrls: ['./stats-card.component.scss']
})
export class StatsCardComponent {
  @Input() title: string = '';
  @Input() value: string | number = '';
  @Input() subtitle: string = '';
  @Input() icon: string = '';
  @Input() iconColor: string = 'blue';
  @Input() borderColor: string = 'blue';

  @HostBinding('style.--border-color') get borderColorStyle() {
    return this.getColorValue(this.borderColor);
  }

  @HostBinding('style.--icon-color') get iconColorStyle() {
    return this.getColorValue(this.iconColor);
  }

  private getColorValue(color: string): string {
    // If it's a named color, convert it to hex
    const colorMap: { [key: string]: string } = {
      'blue': '#3b82f6',
      'green': '#22c55e',
      'purple': '#a855f7',
      'amber': '#f59e0b',
      'red': '#ef4444',
      'yellow': '#eab308',
      'indigo': '#6366f1',
      'pink': '#ec4899',
      'gray': '#6b7280'
    };

    return colorMap[color.toLowerCase()] || color;
  }
} 