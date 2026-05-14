import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { GetVendorDetailResolver } from './resolvers/get-vendor-detail.resolver';
// import { permissionGuard } from '@core/guards';
// import { APP_PERMISSION } from '@core/constants';

export const VENDOR_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.SITE.VENDOR.LIST,
    pathMatch: 'full',
  },
  {
    path: ROUTES.SITE.VENDOR.LIST,
    loadComponent: () =>
      import('./components/get-vendor/get-vendor.component').then(
        m => m.GetVendorComponent
      ),
    // canActivate: [permissionGuard],
    // data: {
    //   permissions: [APP_PERMISSION.VENDOR.TABLE_VIEW],
    // },
  },
  {
    path: ROUTES.SITE.VENDOR.ADD,
    loadComponent: () =>
      import('./components/add-vendor/add-vendor.component').then(
        m => m.AddVendorComponent
      ),
    // canActivate: [permissionGuard],
    // data: {
    //   permissions: [APP_PERMISSION.VENDOR.ADD],
    // },
  },
  {
    path: `${ROUTES.SITE.VENDOR.EDIT}/:vendorId`,
    loadComponent: () =>
      import('./components/edit-vendor/edit-vendor.component').then(
        m => m.EditVendorComponent
      ),
    resolve: {
      vendorDetail: GetVendorDetailResolver,
    },
    // canActivate: [permissionGuard],
    // data: {
    //   permissions: [APP_PERMISSION.VENDOR.EDIT],
    // },
  },
];
