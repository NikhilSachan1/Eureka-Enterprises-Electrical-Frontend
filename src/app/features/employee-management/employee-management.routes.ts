import { Routes } from '@angular/router';
import { ROUTES } from '../../shared/constants';

export const EMPLOYEE_MANAGEMENT_ROUTES: Routes = [
  {
    path: ROUTES.EMPLOYEE.LIST,
    loadComponent: () => import('./employee-list/employee-list.component')
      .then(m => m.EmployeeListComponent)
  },
]; 