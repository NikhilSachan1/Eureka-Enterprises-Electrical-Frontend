import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-edit-invoice',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './edit-invoice.component.html',
  styleUrl: './edit-invoice.component.scss',
})
export class EditInvoiceComponent {}
