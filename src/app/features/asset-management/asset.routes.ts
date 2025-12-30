import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { GetAssetDetailResolver } from './resolvers/get-asset-detail.resolver';

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
  },
  {
    path: ROUTES.ASSET.ADD,
    loadComponent: () =>
      import('./components/add-asset/add-asset.component').then(
        m => m.AddAssetComponent
      ),
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
  },
];
