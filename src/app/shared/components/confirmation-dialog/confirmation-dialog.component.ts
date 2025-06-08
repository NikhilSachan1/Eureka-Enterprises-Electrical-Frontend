import { Component, output, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { EInputType } from '../../types/data-table-input.types';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [
    ConfirmDialogModule, 
    ButtonModule, 
    FormsModule,
    InputTextModule,
    TextareaModule
  ],
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent {

  @ViewChild('cd') confirmDialog: any;

  inputFieldsType = EInputType;
  
  comment: string = '';
  inputValues = {};

  // Modern output signal
  onConfirm = output<{
    confirmed: boolean;
    comment: string;
    message: string;
    inputValues: any;
  }>();

  handleAccept(): void {
    const message = 'Action confirmed successfully';
    this.onConfirm.emit({ 
      confirmed: true, 
      comment: this.comment,
      message: message,
      inputValues: this.inputValues
    });
    this.confirmDialog.close();
    this.resetForm();
  }

  handleReject(): void {
    const message = 'Action cancelled';
    this.onConfirm.emit({ 
      confirmed: false, 
      comment: '',
      message: message,
      inputValues: this.inputValues
    });
    this.confirmDialog.close();
    this.resetForm();
  }

  private resetForm(): void {
    this.comment = '';
    this.inputValues = {};
  }
} 