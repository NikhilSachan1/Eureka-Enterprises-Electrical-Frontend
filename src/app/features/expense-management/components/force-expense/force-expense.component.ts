import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-force-expense',
  imports: [],
  templateUrl: './force-expense.component.html',
  styleUrl: './force-expense.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForceExpenseComponent {}
