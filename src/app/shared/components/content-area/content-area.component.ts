import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-content-area',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './content-area.component.html',
  styleUrls: ['./content-area.component.scss']
})
export class ContentAreaComponent {
  @Input() sidebarVisible = true;
  @Input() isMobile = false;
  
  readonly themeService = inject(ThemeService);
} 