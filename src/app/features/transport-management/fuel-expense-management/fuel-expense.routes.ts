import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { GetFuelExpenseDetailResolver } from './resolvers/get-fuel-expense-detail.resolver';

export const FUEL_EXPENSE_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.FUEL.LEDGER,
    pathMatch: 'full',
  },
  {
    path: ROUTES.FUEL.LEDGER,
    loadComponent: () =>
      import('./components/get-fuel-expense/get-fuel-expense.component').then(
        m => m.GetFuelExpenseComponent
      ),
  },
  {
    path: ROUTES.FUEL.ADD,
    loadComponent: () =>
      import('./components/add-fuel-expense/add-fuel-expense.component').then(
        m => m.AddFuelExpenseComponent
      ),
  },
  {
    path: `${ROUTES.FUEL.EDIT}/:fuelExpenseId`,
    loadComponent: () =>
      import('./components/edit-fuel-expense/edit-fuel-expense.component').then(
        m => m.EditFuelExpenseComponent
      ),
    resolve: {
      fuelExpenseDetail: GetFuelExpenseDetailResolver,
    },
  },
  {
    path: ROUTES.FUEL.FORCE,
    loadComponent: () =>
      import(
        './components/force-fuel-expense/force-fuel-expense.component'
      ).then(m => m.ForceFuelExpenseComponent),
  },
  {
    path: ROUTES.FUEL.REIMBURSEMENT,
    loadComponent: () =>
      import(
        './components/reimburse-fuel-expense/reimburse-fuel-expense.component'
      ).then(m => m.ReimburseFuelExpenseComponent),
  },
];
