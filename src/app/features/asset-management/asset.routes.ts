import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { GetAssetDetailResolver } from './resolvers/get-asset-detail.resolver';
import { permissionGuard } from '@core/guards';
import { APP_PERMISSION } from '@core/constants';

export const ASSET_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.ASSET.LIST,
    pathMatch: 'full',
  },
  {
    path: ROUTES.ASSET.LIST,
    loadComponent: () =>
      import('./components/get-asset/get-asset.component').then(
        m => m.GetAssetComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.ASSET.TABLE_VIEW],
    },
  },
  {
    path: ROUTES.ASSET.ADD,
    loadComponent: () =>
      import('./components/add-asset/add-asset.component').then(
        m => m.AddAssetComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.ASSET.ADD],
    },
  },
  {
    path: `${ROUTES.ASSET.EDIT}/:assetId`,
    loadComponent: () =>
      import('./components/edit-asset/edit-asset.component').then(
        m => m.EditAssetComponent
      ),
    resolve: {
      assetDetail: GetAssetDetailResolver,
    },
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.ASSET.EDIT],
    },
  },
  {
    path: ROUTES.ASSET.EVENT_HISTORY,
    loadComponent: () =>
      import(
        './components/get-asset-event-history/get-asset-event-history.component'
      ).then(m => m.GetAssetEventHistoryComponent),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.ASSET.EVENT_HISTORY],
    },
  },
];
