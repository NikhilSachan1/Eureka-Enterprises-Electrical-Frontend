import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { GetNextEmployeeCodeResolver } from './resolvers/get-next-employee-code.resolver';
import { GetEmployeeDetailResolver } from './resolvers/get-employee-detail.resolver';
import { APP_PERMISSION } from '@core/constants';
import { permissionGuard } from '@core/guards';

export const EMPLOYEE_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.EMPLOYEE.LIST,
    pathMatch: 'full',
  },
  {
    path: ROUTES.EMPLOYEE.LIST,
    loadComponent: () =>
      import('./components/get-employee/get-employee.component').then(
        m => m.GetEmployeeComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.EMPLOYEE.TABLE_VIEW],
    },
  },
  {
    path: ROUTES.EMPLOYEE.MY_PROFILE,
    loadComponent: () =>
      import(
        './components/get-employee-detail/get-employee-detail.component'
      ).then(m => m.GetEmployeeDetailComponent),
    data: {
      mode: 'route',
    },
  },
  {
    path: ROUTES.EMPLOYEE.ADD,
    loadComponent: () =>
      import('./components/add-employee/add-employee.component').then(
        m => m.AddEmployeeComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.EMPLOYEE.ADD],
    },
    resolve: {
      nextEmployeeCode: GetNextEmployeeCodeResolver,
    },
  },
  {
    path: `${ROUTES.EMPLOYEE.EDIT}/:employeeId`,
    loadComponent: () =>
      import('./components/edit-employee/edit-employee.component').then(
        m => m.EditEmployeeComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.EMPLOYEE.EDIT],
    },
    resolve: {
      employeeDetail: GetEmployeeDetailResolver,
    },
  },
];
