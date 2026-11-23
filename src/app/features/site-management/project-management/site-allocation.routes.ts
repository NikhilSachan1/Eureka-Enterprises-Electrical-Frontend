import { Routes } from '@angular/router';
import { APP_PERMISSION } from '@core/constants';
import { permissionGuard } from '@core/guards';
import { ROUTES } from '@shared/constants';

const { ENTRIES, EMPLOYEE_WISE, PROJECT_WISE } =
  ROUTES.SITE.PROJECT.ALLOCATION_HISTORY_TAB;

/** Workspace allocation history: the entries, and the same history per employee and per project. */
export const PROJECT_WORKSPACE_SITE_ALLOCATION_ROUTES: Routes = [
  {
    path: ROUTES.SITE.PROJECT.ALLOCATION_HISTORY,
    loadComponent: () =>
      import(
        './components/allocation-history-tabs/allocation-history-tabs.component'
      ).then(m => m.AllocationHistoryTabsComponent),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.PROJECT.ALLOCATION_HISTORY_TABLE_VIEW],
    },
    children: [
      { path: '', redirectTo: ENTRIES, pathMatch: 'full' },
      {
        path: ENTRIES,
        loadComponent: () =>
          import(
            './components/get-site-allocation-history/get-site-allocation-history.component'
          ).then(m => m.GetSiteAllocationHistoryComponent),
      },
      {
        path: EMPLOYEE_WISE,
        loadComponent: () =>
          import(
            './components/get-employee-wise-allocation/get-employee-wise-allocation.component'
          ).then(m => m.GetEmployeeWiseAllocationComponent),
      },
      {
        path: PROJECT_WISE,
        loadComponent: () =>
          import(
            './components/get-project-wise-allocation/get-project-wise-allocation.component'
          ).then(m => m.GetProjectWiseAllocationComponent),
      },
    ],
  },
];
