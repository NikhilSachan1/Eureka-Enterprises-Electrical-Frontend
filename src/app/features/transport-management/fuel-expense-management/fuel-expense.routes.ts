import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { GetFuelExpenseDetailResolver } from './resolvers/get-fuel-expense-detail.resolver';
import { permissionGuard } from '@core/guards';
import { APP_PERMISSION } from '@core/constants';

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
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.FUEL_EXPENSE.TABLE_VIEW],
    },
  },
  {
    path: ROUTES.FUEL.ADD,
    loadComponent: () =>
      import('./components/add-fuel-expense/add-fuel-expense.component').then(
        m => m.AddFuelExpenseComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.FUEL_EXPENSE.ADD],
    },
  },
  {
    path: `${ROUTES.FUEL.EDIT}/:fuelExpenseId`,
    loadComponent: () =>
      import('./components/edit-fuel-expense/edit-fuel-expense.component').then(
        m => m.EditFuelExpenseComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.FUEL_EXPENSE.EDIT],
    },
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
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.FUEL_EXPENSE.FORCE],
    },
  },
  {
    path: ROUTES.FUEL.REIMBURSEMENT,
    loadComponent: () =>
      import(
        './components/reimburse-fuel-expense/reimburse-fuel-expense.component'
      ).then(m => m.ReimburseFuelExpenseComponent),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.FUEL_EXPENSE.REIMBURSE],
    },
  },
];
