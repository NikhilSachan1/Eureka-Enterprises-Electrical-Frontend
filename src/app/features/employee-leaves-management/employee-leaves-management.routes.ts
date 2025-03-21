import { Routes } from '@angular/router';
import { ROUTES } from '../../shared/constants';
export const EMPLOYEE_LEAVES_MANAGEMENT_ROUTES: Routes = [
  {
    path: ROUTES.LEAVE.LIST,
    loadComponent: () => import('./leave-list/leave-list.component')
      .then(m => m.LeaveListComponent)
  },
  {
    path: ROUTES.LEAVE.APPLY,
    loadComponent: () => import('./request-leave/request-leave.component')
      .then(m => m.RequestLeaveComponent)
  },
  {
    path: ROUTES.LEAVE.FORCE,
    loadComponent: () => import('./force-leave/force-leave.component')
      .then(m => m.ForceLeaveComponent)
  }
]; 