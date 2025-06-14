import { Routes } from '@angular/router';
import { ROUTES } from '../../shared/constants';

export const LEAVE_PLANNER_MANAGEMENT_ROUTES: Routes = [
    {
        path: ROUTES.CALENDAR.LIST,
        loadComponent: () => import('./leave-planner-list/leave-planner-list.component')
            .then(m => m.LeavePlannerListComponent)
    },
    {
        path: ROUTES.CALENDAR.ADD,
        loadComponent: () => import('./add-leave-planner/add-leave-planner.component')
            .then(m => m.AddLeavePlannerComponent)
    }
]; 