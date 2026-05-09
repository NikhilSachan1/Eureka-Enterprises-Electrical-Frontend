import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-reject-invoice',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './reject-invoice.component.html',
  styleUrl: './reject-invoice.component.scss',
})
export class RejectInvoiceComponent {}
