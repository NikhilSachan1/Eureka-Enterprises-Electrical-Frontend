import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { GetLatestSalaryDetailResolver } from './resolvers/get-latest-salary-detail.resolver';

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
  },
  {
    path: ROUTES.PAYROLL.INCREMENT,
    loadComponent: () =>
      import(
        './components/add-salary-increment/add-salary-increment.component'
      ).then(m => m.AddSalaryIncrementComponent),
  },
  {
    path: `${ROUTES.PAYROLL.STRUCTURE}/:salaryStructureId`,
    loadComponent: () =>
      import('./components/edit-salary/edit-salary.component').then(
        m => m.EditSalaryComponent
      ),
    resolve: {
      salaryDetail: GetLatestSalaryDetailResolver,
    },
  },
];
