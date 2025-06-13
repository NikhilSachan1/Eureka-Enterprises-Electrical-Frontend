import { Routes } from '@angular/router';
import { ROUTES } from '../../shared/constants';

export const LEAVE_MANAGEMENT_ROUTES: Routes = [
    {
        path: ROUTES.LEAVE.LIST,
        loadComponent: () => import('./leave-requests-list/leave-requests-list.component')
            .then(m => m.LeaveRequestsListComponent)
    },
    {
        path: ROUTES.LEAVE.APPLY,
        loadComponent: () => import('./apply-leave/apply-leave.component')
            .then(m => m.ApplyLeaveComponent)
    },
    {
        path: ROUTES.LEAVE.FORCE,
        loadComponent: () => import('./force-leave/force-leave.component')
            .then(m => m.ForceLeaveComponent)
    }
]; 