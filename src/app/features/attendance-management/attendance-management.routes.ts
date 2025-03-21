import { Routes } from '@angular/router';
import { ROUTES } from '../../shared/constants';
export const ATTENDANCE_MANAGEMENT_ROUTES: Routes = [

  {
    path: ROUTES.ATTENDANCE.LIST,
    loadComponent: () => import('./attendance-list/attendance-list.component')
      .then(m => m.AttendanceListComponent)
  },
  {
    path: ROUTES.ATTENDANCE.APPLY,
    loadComponent: () => import('./record-attendance/record-attendance.component')
      .then(m => m.RecordAttendanceComponent)
  },
  {
    path: ROUTES.ATTENDANCE.FORCE,
    loadComponent: () => import('./force-attendance/force-attendance.component')
      .then(m => m.ForceAttendanceComponent)
  }

]; 