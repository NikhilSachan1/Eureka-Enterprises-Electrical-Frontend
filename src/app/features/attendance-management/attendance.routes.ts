import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { CurrentStatusResolver } from './resolvers/current-status.resolver';
import { permissionGuard } from '@core/guards';
import { APP_PERMISSION } from '@core/constants';

export const ATTENDANCE_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.ATTENDANCE.LIST,
    pathMatch: 'full',
  },
  {
    path: ROUTES.ATTENDANCE.LIST,
    loadComponent: () =>
      import('./components/get-attendance/get-attendance.component').then(
        m => m.GetAttendanceComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.ATTENDANCE.TABLE_VIEW],
    },
  },
  {
    path: ROUTES.ATTENDANCE.APPLY,
    loadComponent: () =>
      import('./components/apply-attendance/apply-attendance.component').then(
        m => m.ApplyAttendanceComponent
      ),
    resolve: {
      currentStatus: CurrentStatusResolver,
    },
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.ATTENDANCE.APPLY],
    },
  },
  {
    path: ROUTES.ATTENDANCE.FORCE,
    loadComponent: () =>
      import('./components/force-attendance/force-attendance.component').then(
        m => m.ForceAttendanceComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.ATTENDANCE.FORCE],
    },
  },
];
