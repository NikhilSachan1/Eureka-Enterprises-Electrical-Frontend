import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';

export const LEAVE_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.LEAVE.LIST,
    pathMatch: 'full',
  },
  {
    path: ROUTES.LEAVE.LIST,
    loadComponent: () =>
      import('./components/get-leave/get-leave.component').then(
        m => m.GetLeaveComponent
      ),
  },
  {
    path: ROUTES.LEAVE.APPLY,
    loadComponent: () =>
      import('./components/apply-leave/apply-leave.component').then(
        m => m.ApplyLeaveComponent
      ),
  },
  {
    path: ROUTES.LEAVE.FORCE,
    loadComponent: () =>
      import('./components/force-leave/force-leave.component').then(
        m => m.ForceLeaveComponent
      ),
  },
];
