import { Routes } from '@angular/router';
import { ROUTES } from '../../shared/constants';
export const FUEL_EXPENSE_MANAGEMENT_ROUTES: Routes = [
  {
    path: ROUTES.FUEL.LEDGER,
    loadComponent: () => import('./fuel-expense-list/fuel-expense-list.component')
      .then(m => m.FuelExpenseListComponent)
  },
  {
    path: ROUTES.FUEL.ADD,
    loadComponent: () => import('./add-edit-fuel-expense/add-edit-fuel-expense.component')
      .then(m => m.AddEditFuelExpenseComponent)
  },
  {
    path: ROUTES.FUEL.EDIT,
    loadComponent: () => import('./add-edit-fuel-expense/add-edit-fuel-expense.component')
      .then(m => m.AddEditFuelExpenseComponent)
  },
  {
    path: ROUTES.FUEL.FORCE,
    loadComponent: () => import('./force-fuel-expense/force-fuel-expense.component')
      .then(m => m.ForceFuelExpenseComponent)
  }
]; 