import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-get-invoice-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './get-invoice-detail.component.html',
  styleUrl: './get-invoice-detail.component.scss',
})
export class GetInvoiceDetailComponent {}
