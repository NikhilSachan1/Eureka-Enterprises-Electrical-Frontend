import { Routes } from '@angular/router';
import { ROUTES } from '../../shared/constants';

export const ASSET_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.ASSET.LIST,
    pathMatch: 'full'
  },
  {
    path: ROUTES.ASSET.LIST,
    loadComponent: () => import('./asset-list/asset-list.component')
      .then(m => m.AssetListComponent)
  },
  {
    path: ROUTES.ASSET.ADD,
    loadComponent: () => import('./add-asset/add-asset.component')
      .then(m => m.AddAssetComponent)
  }
]; 