import { Routes } from '@angular/router';
import { APP_PERMISSION } from '@core/constants';
import { permissionGuard } from '@core/guards';
import { ROUTES } from '@shared/constants';
import { getNonEmployeeDetailResolver } from './resolvers/get-non-employee-detail.resolver';

/** Mounted under the employee routes. The list itself is a tab of the employee directory. */
export const NON_EMPLOYEE_MANAGEMENT_ROUTES: Routes = [
  {
    path: ROUTES.NON_EMPLOYEE.ADD,
    loadComponent: () =>
      import('./components/non-employee-form/non-employee-form.component').then(
        m => m.NonEmployeeFormComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.SYSTEM_USER.ADD],
    },
  },
  {
    path: `${ROUTES.NON_EMPLOYEE.EDIT}/:nonEmployeeId`,
    loadComponent: () =>
      import('./components/non-employee-form/non-employee-form.component').then(
        m => m.NonEmployeeFormComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.SYSTEM_USER.EDIT],
    },
    resolve: {
      nonEmployeeDetail: getNonEmployeeDetailResolver,
    },
  },
];
