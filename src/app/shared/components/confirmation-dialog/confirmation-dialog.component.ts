import { Component, inject, EventEmitter, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [ConfirmDialogModule, ButtonModule, InputTextModule, FormsModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent {
  comment: string = '';

  @Output() onConfirm = new EventEmitter<{ confirmed: boolean; comment: string }>();

  handleAccept(): void {
    this.onConfirm.emit({ confirmed: true, comment: this.comment });
  }

  handleReject(): void {
    this.onConfirm.emit({ confirmed: false, comment: '' });
  }
} 