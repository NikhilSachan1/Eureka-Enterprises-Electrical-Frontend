import { Component, Input, inject } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-content-area',
  standalone: true,
  imports: [NgClass],
  templateUrl: './content-area.component.html',
  styleUrls: ['./content-area.component.scss']
})
export class ContentAreaComponent {
  @Input() sidebarVisible = true;
  @Input() isMobile = false;
  
  readonly themeService = inject(ThemeService);
} 