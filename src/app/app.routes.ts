import { Routes } from '@angular/router';
import { DashboardComponent } from './features/home/dashboard/dashboard.component';
import { ROUTE_BASE_PATHS } from './shared/constants/index';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: ROUTE_BASE_PATHS.EMPLOYEE,
    loadChildren: () => import('./features/employee-management/employee-management.routes')
      .then(m => m.EMPLOYEE_MANAGEMENT_ROUTES)
  },
  {
    path: ROUTE_BASE_PATHS.ATTENDANCE,
    loadChildren: () => import('./features/attendance-management/attendance-management.routes')
      .then(m => m.ATTENDANCE_MANAGEMENT_ROUTES)
  },
  {
    path: ROUTE_BASE_PATHS.CARD,
    loadChildren: () => import('./features/card-management/card-management.routes')
      .then(m => m.CARD_MANAGEMENT_ROUTES)
  },
  {
    path: ROUTE_BASE_PATHS.LEAVE,
    loadChildren: () => import('./features/employee-leaves-management/employee-leaves-management.routes')
      .then(m => m.EMPLOYEE_LEAVES_MANAGEMENT_ROUTES)
  },
  {
    path: ROUTE_BASE_PATHS.EXPENSE,
    loadChildren: () => import('./features/regular-expense-management/regular-expense-management.routes')
      .then(m => m.REGULAR_EXPENSE_MANAGEMENT_ROUTES)
  },
  {
    path: ROUTE_BASE_PATHS.FUEL,
    loadChildren: () => import('./features/fuel-expense-management/fuel-expense-management.routes')
      .then(m => m.FUEL_EXPENSE_MANAGEMENT_ROUTES)
  },
  {
    path: ROUTE_BASE_PATHS.CALENDAR,
    loadChildren: () => import('./features/holiday-calendar-management/holiday-calendar-management.routes')
      .then(m => m.HOLIDAY_CALENDAR_MANAGEMENT_ROUTES)
  },
  {
    path: ROUTE_BASE_PATHS.VEHICLE,
    loadChildren: () => import('./features/vehicle-management/vehicle-management.routes')
      .then(m => m.VEHICLE_MANAGEMENT_ROUTES)
  },
  {
    path: ROUTE_BASE_PATHS.ASSET,
    loadChildren: () => import('./features/asset-management/asset-management.routes')
      .then(m => m.ASSET_MANAGEMENT_ROUTES)
  },
  {
    path: ROUTE_BASE_PATHS.PAYROLL,
    loadChildren: () => import('./features/payroll-management/payroll-management.routes')
      .then(m => m.PAYROLL_MANAGEMENT_ROUTES)
  },
  {
    path: '**',
    redirectTo: ROUTE_BASE_PATHS.DASHBOARD
  }
];
