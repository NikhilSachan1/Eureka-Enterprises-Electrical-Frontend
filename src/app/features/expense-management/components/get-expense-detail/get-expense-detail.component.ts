import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-get-expense-detail',
  imports: [],
  templateUrl: './get-expense-detail.component.html',
  styleUrl: './get-expense-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetExpenseDetailComponent {}
