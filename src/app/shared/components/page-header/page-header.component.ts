import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { EButtonSeverity, EButtonSize } from '../../types';
import { ICONS } from '../../constants';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent {
  // Expose enums for template use
  EButtonSeverity = EButtonSeverity;
  EButtonSize = EButtonSize;
  icons = ICONS;
  
  // Input signals
  title = input.required<string>();
  subtitle = input<string>('');
  showAddButton = input<boolean>(false);
  addButtonLabel = input<string>('Add New');
  
  // Output signals
  addButtonClick = output<void>();
} 