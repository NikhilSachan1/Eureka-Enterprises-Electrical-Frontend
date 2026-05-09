import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-delete-invoice',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './delete-invoice.component.html',
  styleUrl: './delete-invoice.component.scss',
})
export class DeleteInvoiceComponent {}
