import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { GetNextEmployeeCodeResolver } from './resolvers/get-next-employe-code.resolver';
import { GetEmployeeDetailResolver } from './resolvers/get-employee-detail.resolver';

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
    resolve: {
      employeeDetail: GetEmployeeDetailResolver,
    },
  },
];
