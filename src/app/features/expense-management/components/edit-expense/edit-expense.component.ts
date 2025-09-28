import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-edit-expense',
  imports: [],
  templateUrl: './edit-expense.component.html',
  styleUrl: './edit-expense.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditExpenseComponent {}
