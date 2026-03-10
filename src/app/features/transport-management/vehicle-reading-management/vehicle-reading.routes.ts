import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { GetLinkedUserVehicleDetailResolver } from '../fuel-expense-management/resolvers/get-linked-user-vehicle-detail.resolver';
import { permissionGuard } from '@core/guards';
import { APP_PERMISSION } from '@core/constants';
import { GetVehicleReadingDetailResolver } from './resolvers/get-vehicle-reading-detail.resolver';

export const VEHICLE_READING_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.VEHICLE_READING.LIST,
    pathMatch: 'full',
  },
  {
    path: ROUTES.VEHICLE_READING.LIST,
    loadComponent: () =>
      import(
        './components/get-vehicle-reading/get-vehicle-reading.component'
      ).then(m => m.GetVehicleReadingComponent),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.VEHICLE_READING.TABLE_VIEW],
    },
  },
  {
    path: ROUTES.VEHICLE_READING.FORCE,
    loadComponent: () =>
      import(
        './components/add-vehicle-reading/add-vehicle-reading.component'
      ).then(m => m.AddVehicleReadingComponent),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.VEHICLE_READING.ADD],
    },
  },
  {
    path: ROUTES.VEHICLE_READING.ADD,
    loadComponent: () =>
      import(
        './components/add-vehicle-reading/add-vehicle-reading.component'
      ).then(m => m.AddVehicleReadingComponent),
    resolve: {
      linkedUserVehicleDetail: GetLinkedUserVehicleDetailResolver,
    },
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.VEHICLE_READING.EDIT],
    },
  },
  {
    path: `${ROUTES.VEHICLE_READING.EDIT}/:vehicleReadingId`,
    loadComponent: () =>
      import(
        './components/edit-vehicle-reading/edit-vehicle-reading.component'
      ).then(m => m.EditVehicleReadingComponent),
    resolve: {
      vehicleReadingDetail: GetVehicleReadingDetailResolver,
    },
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.VEHICLE_READING.EDIT],
    },
  },
];
