import { Component, inject, EventEmitter, Output, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextarea } from 'primeng/inputtextarea';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [ConfirmDialogModule, ButtonModule, InputTextarea, FormsModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent {
  @ViewChild('cd') confirmDialog: any;
  comment: string = '';

  @Output() onConfirm = new EventEmitter<{ confirmed: boolean; comment: string; message: string }>();

  handleAccept(): void {
    const message = 'Action confirmed successfully';
    console.log(message, 'with comment:', this.comment);
    this.onConfirm.emit({ 
      confirmed: true, 
      comment: this.comment,
      message: message 
    });
    this.confirmDialog.close();
    this.comment = ''; // Reset comment after confirmation
  }

  handleReject(): void {
    const message = 'Action cancelled';
    console.log(message);
    this.onConfirm.emit({ 
      confirmed: false, 
      comment: '',
      message: message 
    });
    this.confirmDialog.close();
    this.comment = ''; // Reset comment after rejection
  }
} 