import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { GetExpenseDetailResolver } from './resolvers/get-expense-detail.resolver';

export const EXPENSE_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.EXPENSE.LEDGER,
    pathMatch: 'full',
  },
  {
    path: ROUTES.EXPENSE.LEDGER,
    loadComponent: () =>
      import('./components/get-expense/get-expense.component').then(
        m => m.GetExpenseComponent
      ),
  },
  {
    path: ROUTES.EXPENSE.ADD,
    loadComponent: () =>
      import('./components/add-expense/add-expense.component').then(
        m => m.AddExpenseComponent
      ),
  },
  {
    path: `${ROUTES.EXPENSE.EDIT}/:expenseId`,
    loadComponent: () =>
      import('./components/edit-expense/edit-expense.component').then(
        m => m.EditExpenseComponent
      ),
    resolve: {
      expenseDetail: GetExpenseDetailResolver,
    },
    data: {
      mode: 'edit',
    },
  },
  {
    path: ROUTES.EXPENSE.FORCE,
    loadComponent: () =>
      import('./components/force-expense/force-expense.component').then(
        m => m.ForceExpenseComponent
      ),
  },
  {
    path: ROUTES.EXPENSE.REIMBURSE,
    loadComponent: () =>
      import('./components/reimburse-expense/reimburse-expense.component').then(
        m => m.ReimburseExpenseComponent
      ),
  },
];
