import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-get-expense',
  imports: [],
  templateUrl: './get-expense.component.html',
  styleUrl: './get-expense.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetExpenseComponent {}
