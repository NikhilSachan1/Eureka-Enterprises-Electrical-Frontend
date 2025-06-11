import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent {
  // Input signals
  title = input.required<string>();
  subtitle = input.required<string>();
  showAddButton = input<boolean>(false);
  addButtonLabel = input<string>('Add New');
  
  // Output signals
  addButtonClick = output<void>();
} 