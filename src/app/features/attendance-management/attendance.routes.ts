import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';

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
  },
  {
    path: ROUTES.ATTENDANCE.APPLY,
    loadComponent: () =>
      import('./components/apply-attendance/apply-attendance.component').then(
        m => m.ApplyAttendanceComponent
      ),
  },
  {
    path: ROUTES.ATTENDANCE.FORCE,
    loadComponent: () =>
      import('./components/force-attendance/force-attendance.component').then(
        m => m.ForceAttendanceComponent
      ),
  },
];
