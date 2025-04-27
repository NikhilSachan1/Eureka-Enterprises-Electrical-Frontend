import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-metrics-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metrics-card.component.html',
  styleUrls: ['./metrics-card.component.scss']
})
export class MetricsCardComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() iconClass: string = 'pi pi-chart-pie text-blue-500';
  @Input() iconBgClass: string = 'bg-blue-50';
  @Input() metrics: { label: string, value: string | number }[] = [];
} 