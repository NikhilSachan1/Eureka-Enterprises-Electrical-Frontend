import { Routes } from '@angular/router';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { APP_PERMISSION } from '@core/constants';
import { permissionGuard } from '@core/guards';

export const SETTING_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
    pathMatch: 'full',
  },
  {
    path: ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
    loadChildren: () =>
      import('./permission-management/permission-management.routes').then(
        m => m.PERMISSION_MANAGEMENT_ROUTES
      ),
  },
  {
    path: ROUTE_BASE_PATHS.SETTINGS.CONFIGURATION.BASE,
    loadChildren: () =>
      import('./configuration-management/configuration-management.routes').then(
        m => m.CONFIGURATION_MANAGEMENT_ROUTES
      ),
  },
  {
    path: ROUTE_BASE_PATHS.SETTINGS.CRON.BASE,
    loadChildren: () =>
      import('./cron-management/cron-management.routes').then(
        m => m.GET_CRON_ROUTES
      ),
  },
  {
    // data-sync.view opens the page; the page itself shows whether this server may pull prod data.
    path: ROUTE_BASE_PATHS.SETTINGS.DATA_SYNC.BASE,
    children: [
      {
        path: '',
        redirectTo: ROUTES.SETTINGS.DATA_SYNC.PROD_TO_UAT,
        pathMatch: 'full',
      },
      {
        path: ROUTES.SETTINGS.DATA_SYNC.PROD_TO_UAT,
        loadComponent: () =>
          import(
            './data-sync-management/components/get-data-sync/get-data-sync.component'
          ).then(m => m.GetDataSyncComponent),
        canActivate: [permissionGuard],
        data: { permissions: [APP_PERMISSION.DATA_SYNC.VIEW] },
      },
    ],
  },
  {
    path: ROUTE_BASE_PATHS.SETTINGS.DELEGATION.BASE,
    loadChildren: () =>
      import('./delegation-management/delegation-management.routes').then(
        m => m.DELEGATION_MANAGEMENT_ROUTES
      ),
  },
];
