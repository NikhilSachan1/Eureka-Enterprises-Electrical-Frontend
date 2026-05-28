import { Routes } from '@angular/router';
import { APP_PERMISSION } from '@core/constants';
import { permissionGuard } from '@core/guards';
import { ROUTES } from '@shared/constants';

export const PROJECT_WORKSPACE_SITE_ALLOCATION_ROUTES: Routes = [
  {
    path: ROUTES.SITE.PROJECT.ALLOCATION_HISTORY,
    loadComponent: () =>
      import(
        './components/get-site-allocation-history/get-site-allocation-history.component'
      ).then(m => m.GetSiteAllocationHistoryComponent),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.PROJECT.ALLOCATION_HISTORY_TABLE_VIEW],
    },
  },
];
