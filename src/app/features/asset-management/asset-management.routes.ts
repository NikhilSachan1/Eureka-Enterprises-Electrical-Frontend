import { Routes } from '@angular/router';
import { ROUTES } from '../../shared/constants';
export const ASSET_MANAGEMENT_ROUTES: Routes = [
  {
    path: ROUTES.ASSET.LIST,
    loadComponent: () => import('./asset-list/asset-list.component')
      .then(m => m.AssetListComponent)
  },
  {
    path: ROUTES.ASSET.ADD,
    loadComponent: () => import('./add-edit-asset/add-edit-asset.component')
      .then(m => m.AddEditAssetComponent)
  },
  {
    path: ROUTES.ASSET.EDIT,
    loadComponent: () => import('./add-edit-asset/add-edit-asset.component')
      .then(m => m.AddEditAssetComponent)
  }
]; 