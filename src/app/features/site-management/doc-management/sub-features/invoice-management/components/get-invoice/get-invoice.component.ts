import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-get-invoice',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './get-invoice.component.html',
  styleUrl: './get-invoice.component.scss',
})
export class GetInvoiceComponent {}
