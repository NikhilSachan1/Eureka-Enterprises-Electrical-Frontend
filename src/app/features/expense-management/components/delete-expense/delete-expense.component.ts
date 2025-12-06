import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-delete-expense',
  imports: [],
  templateUrl: './delete-expense.component.html',
  styleUrl: './delete-expense.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteExpenseComponent {}
