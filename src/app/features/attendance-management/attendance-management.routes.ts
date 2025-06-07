import { Routes } from '@angular/router';
import { ROUTES } from '../../shared/constants';

export const ATTENDANCE_MANAGEMENT_ROUTES: Routes = [
  {
    path: ROUTES.ATTENDANCE.LIST,
    loadComponent: () => import('./attendance-list/attendance-list.component')
      .then(m => m.AttendanceListComponent)
  },
]; 