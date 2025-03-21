import { Routes } from '@angular/router';
import { ROUTES } from '../../shared/constants';

export const PAYROLL_MANAGEMENT_ROUTES: Routes = [
  {
    path: ROUTES.PAYROLL.PAYSLIP,
    loadComponent: () => import('./payslip-list/payslip-list.component')
      .then(m => m.PayslipListComponent)
  },
  {
    path: ROUTES.PAYROLL.INCREMENT,
    loadComponent: () => import('./employee-salary-increment/employee-salary-increment.component')
      .then(m => m.EmployeeSalaryIncrementComponent)
  },
  {
    path: ROUTES.PAYROLL.MONTHLY_REPORT,
    loadComponent: () => import('./payslip-monthly-report/payslip-monthly-report.component')
      .then(m => m.PayslipMonthlyReportComponent)
  },
  {
    path: ROUTES.PAYROLL.STRUCTURE,
    loadComponent: () => import('./payslip-structure/payslip-structure.component')
      .then(m => m.PayslipStructureComponent)
  }
]; 