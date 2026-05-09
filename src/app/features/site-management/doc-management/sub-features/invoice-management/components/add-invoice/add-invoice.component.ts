import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-add-invoice',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './add-invoice.component.html',
  styleUrl: './add-invoice.component.scss',
})
export class AddInvoiceComponent {}
