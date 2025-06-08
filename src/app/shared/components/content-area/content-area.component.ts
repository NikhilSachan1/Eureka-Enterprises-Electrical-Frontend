import { Component, input, inject } from '@angular/core';
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
  // Input signals
  sidebarVisible = input<boolean>(true);
  isMobile = input<boolean>(false);
  
  readonly themeService = inject(ThemeService);
} 