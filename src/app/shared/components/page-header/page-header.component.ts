import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule
  ],
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() showAddButton: boolean = false;
  @Input() addButtonLabel: string = 'Add New';
  @Input() buttonClass: string = 'p-button-success text-sm';
  
  @Output() addButtonClick = new EventEmitter<void>();
} 