import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-add-expense',
  imports: [],
  templateUrl: './add-expense.component.html',
  styleUrl: './add-expense.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddExpenseComponent {}
