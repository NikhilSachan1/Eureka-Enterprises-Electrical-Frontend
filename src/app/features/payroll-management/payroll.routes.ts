import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { GetLatestSalaryDetailResolver } from './resolvers/get-latest-salary-detail.resolver';
import { permissionGuard } from '@core/guards';
import { APP_PERMISSION } from '@core/constants';

export const PAYROLL_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.PAYROLL.STRUCTURE,
    pathMatch: 'full',
  },
  {
    path: ROUTES.PAYROLL.STRUCTURE,
    loadComponent: () =>
      import(
        './components/get-salary-structure/get-salary-structure.component'
      ).then(m => m.GetSalaryStructureComponent),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.SALARY_STRUCTURE.TABLE_VIEW],
    },
  },
  {
    path: ROUTES.PAYROLL.INCREMENT,
    loadComponent: () =>
      import(
        './components/add-salary-increment/add-salary-increment.component'
      ).then(m => m.AddSalaryIncrementComponent),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.PAYROLL.ADD_INCREMENT],
    },
  },
  {
    path: `${ROUTES.PAYROLL.STRUCTURE}/:salaryStructureId`,
    loadComponent: () =>
      import('./components/edit-salary/edit-salary.component').then(
        m => m.EditSalaryComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.SALARY_STRUCTURE.EDIT],
    },
    resolve: {
      salaryDetail: GetLatestSalaryDetailResolver,
    },
  },
  {
    path: ROUTES.PAYROLL.PAYSLIP,
    loadComponent: () =>
      import('./components/get-payslip/get-payslip.component').then(
        m => m.GetPayslipComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.PAYROLL.TABLE_VIEW],
    },
  },
];
