import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { GetExpenseDetailResolver } from './resolvers/get-expense-detail.resolver';
import { APP_PERMISSION } from '@core/constants';
import { permissionGuard } from '@core/guards';

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
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.EXPENSE.TABLE_VIEW],
    },
  },
  {
    path: ROUTES.EXPENSE.ADD,
    loadComponent: () =>
      import('./components/add-expense/add-expense.component').then(
        m => m.AddExpenseComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.EXPENSE.ADD],
    },
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
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.EXPENSE.EDIT],
    },
  },
  {
    path: ROUTES.EXPENSE.FORCE,
    loadComponent: () =>
      import('./components/force-expense/force-expense.component').then(
        m => m.ForceExpenseComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.EXPENSE.FORCE],
    },
  },
  {
    path: ROUTES.EXPENSE.REIMBURSE,
    loadComponent: () =>
      import('./components/reimburse-expense/reimburse-expense.component').then(
        m => m.ReimburseExpenseComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.EXPENSE.REIMBURSE],
    },
  },
];
