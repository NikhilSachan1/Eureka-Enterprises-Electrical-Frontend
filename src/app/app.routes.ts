import { Routes } from '@angular/router';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';

import { authGuard, GuestGuard } from '@core/guards';

export const routes: Routes = [
  // Public routes (no sidebar)
  {
    path: '',
    loadComponent: () =>
      import(
        '@shared/components/layouts/public-layout/public-layout.component'
      ).then(m => m.PublicLayoutComponent),
    canActivate: [GuestGuard],
    children: [
      {
        path: '',
        redirectTo: `${ROUTE_BASE_PATHS.AUTH}/${ROUTES.AUTH.LOGIN}`,
        pathMatch: 'full',
      },
      {
        path: ROUTE_BASE_PATHS.AUTH,
        loadChildren: () =>
          import('./features/auth-management/auth-management.routes').then(
            m => m.AUTH_MANAGEMENT_ROUTES
          ),
      },
    ],
  },

  // Private routes (with sidebar)
  {
    path: '',
    loadComponent: () =>
      import(
        '@shared/components/layouts/private-layout/private-layout.component'
      ).then(m => m.PrivateLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: ROUTE_BASE_PATHS.SETTINGS.BASE,
        loadChildren: () =>
          import(
            './features/settings-management/setting-management.routes'
          ).then(m => m.SETTING_MANAGEMENT_ROUTES),
      },
      {
        path: ROUTE_BASE_PATHS.EMPLOYEE,
        loadChildren: () =>
          import('./features/employee-management/employee.routes').then(
            m => m.EMPLOYEE_MANAGEMENT_ROUTES
          ),
      },
      {
        path: ROUTE_BASE_PATHS.ATTENDANCE,
        loadChildren: () =>
          import('./features/attendance-management/attendance.routes').then(
            m => m.ATTENDANCE_MANAGEMENT_ROUTES
          ),
      },
      {
        path: ROUTE_BASE_PATHS.EXPENSE,
        loadChildren: () =>
          import('./features/expense-management/expense.routes').then(
            m => m.EXPENSE_MANAGEMENT_ROUTES
          ),
      },
      {
        path: ROUTE_BASE_PATHS.LEAVE,
        loadChildren: () =>
          import('./features/leave-management/leave.routes').then(
            m => m.LEAVE_MANAGEMENT_ROUTES
          ),
      },
      {
        path: ROUTE_BASE_PATHS.ASSET,
        loadChildren: () =>
          import('./features/asset-management/asset.routes').then(
            m => m.ASSET_MANAGEMENT_ROUTES
          ),
      },
      {
        path: ROUTE_BASE_PATHS.TRANSPORT,
        loadChildren: () =>
          import('./features/transport-management/transport.routes').then(
            m => m.TRANSPORT_MANAGEMENT_ROUTES
          ),
      },
      {
        path: ROUTE_BASE_PATHS.SITE.BASE,
        loadChildren: () =>
          import('./features/site-management/site.routes').then(
            m => m.SITE_MANAGEMENT_ROUTES
          ),
      },
      {
        path: ROUTE_BASE_PATHS.ANNOUNCEMENT,
        loadChildren: () =>
          import('./features/announcement-management/announcement.routes').then(
            m => m.ANNOUNCEMENT_MANAGEMENT_ROUTES
          ),
      },
      {
        path: ROUTE_BASE_PATHS.PAYROLL,
        loadChildren: () =>
          import('./features/payroll-management/payroll.routes').then(
            m => m.PAYROLL_MANAGEMENT_ROUTES
          ),
      },
      {
        path: '**',
        redirectTo: `${ROUTE_BASE_PATHS.EMPLOYEE}`,
      },
    ],
  },

  {
    path: '**',
    redirectTo: `${ROUTE_BASE_PATHS.AUTH}/${ROUTES.AUTH.LOGIN}`,
  },
];
