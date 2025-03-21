import { Routes } from '@angular/router';
import { ROUTES } from '../../shared/constants';
export const REGULAR_EXPENSE_MANAGEMENT_ROUTES: Routes = [
  {
    path: ROUTES.EXPENSE.LEDGER,
    loadComponent: () => import('./regular-expense-list/regular-expense-list.component')
      .then(m => m.RegularExpenseListComponent)
  },
  {
    path: ROUTES.EXPENSE.ADD,
    loadComponent: () => import('./add-edit-regular-expense/add-edit-regular-expense.component')
      .then(m => m.AddEditRegularExpenseComponent)
  },
  {
    path: ROUTES.EXPENSE.EDIT,
    loadComponent: () => import('./add-edit-regular-expense/add-edit-regular-expense.component')
      .then(m => m.AddEditRegularExpenseComponent)
  },
  {
    path: ROUTES.EXPENSE.FORCE,
    loadComponent: () => import('./force-regular-expense/force-regular-expense.component')
      .then(m => m.ForceRegularExpenseComponent)
  }
]; 