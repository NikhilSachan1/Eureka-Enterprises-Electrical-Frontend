import { Routes } from '@angular/router';
import { ROUTE_BASE_PATHS } from './shared/constants/index';
import { PublicLayoutComponent } from './shared/components/layouts/public-layout/public-layout.component';
import { PrivateLayoutComponent } from './shared/components/layouts/private-layout/private-layout.component';

export const routes: Routes = [
  // Public routes (no sidebar)
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: `${ROUTE_BASE_PATHS.EMPLOYEE}/list`,
        pathMatch: 'full'
      }
    ]
  },
  
  // Private routes (with sidebar)
  {
    path: '',
    component: PrivateLayoutComponent,
    children: [
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
        path: ROUTE_BASE_PATHS.LEAVE,
        loadChildren: () => import('./features/leave-management/leave-management.routes')
          .then(m => m.LEAVE_MANAGEMENT_ROUTES)
      },
      {
        path: ROUTE_BASE_PATHS.CALENDAR,
        loadChildren: () => import('./features/leave-planner-management/leave-planner-management.routes')
          .then(m => m.LEAVE_PLANNER_MANAGEMENT_ROUTES)
      },
      {
        path: ROUTE_BASE_PATHS.ASSET,
        loadChildren: () => import('./features/asset-management/asset-management.routes')
          .then(m => m.ASSET_MANAGEMENT_ROUTES)
      },
      {
        path: ROUTE_BASE_PATHS.VEHICLE,
        loadChildren: () => import('./features/vehicle-management/vehicle-management.routes')
          .then(m => m.VEHICLE_MANAGEMENT_ROUTES)
      }
    ]
  },
  
  {
    path: '**',
    redirectTo: `${ROUTE_BASE_PATHS.EMPLOYEE}/list`
  }
];
