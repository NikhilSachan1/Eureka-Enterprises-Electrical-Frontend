import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';

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
  },
  {
    path: ROUTES.EMPLOYEE.ADD,
    loadComponent: () =>
      import('./components/add-employee/add-employee.component').then(
        m => m.AddEmployeeComponent
      ),
  },
  {
    path: `${ROUTES.EMPLOYEE.EDIT}/:employeeId`,
    loadComponent: () =>
      import('./components/edit-employee/edit-employee.component').then(
        m => m.EditEmployeeComponent
      ),
  },
];
