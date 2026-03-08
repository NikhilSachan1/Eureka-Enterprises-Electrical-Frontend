import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { GetVehicleServiceDetailResolver } from './resolvers/get-vehicle-service-detail.resolver';
import { permissionGuard } from '@core/guards';
import { APP_PERMISSION } from '@core/constants';

export const VEHICLE_SERVICE_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.VEHICLE_SERVICE.LIST,
    pathMatch: 'full',
  },
  {
    path: `${ROUTES.VEHICLE_SERVICE.LIST}`,
    loadComponent: () =>
      import(
        './components/get-vehicle-service/get-vehicle-service.component'
      ).then(m => m.GetVehicleServiceComponent),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.VEHICLE_SERVICE.TABLE_VIEW],
    },
  },
  {
    path: ROUTES.VEHICLE_SERVICE.ADD,
    loadComponent: () =>
      import(
        './components/add-vehicle-service/add-vehicle-service.component'
      ).then(m => m.AddVehicleServiceComponent),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.VEHICLE_SERVICE.ADD],
    },
  },
  {
    path: `${ROUTES.VEHICLE_SERVICE.EDIT}/:vehicleServiceId`,
    loadComponent: () =>
      import(
        './components/edit-vehicle-service/edit-vehicle-service.component'
      ).then(m => m.EditVehicleServiceComponent),
    resolve: {
      vehicleServiceDetail: GetVehicleServiceDetailResolver,
    },
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.VEHICLE_SERVICE.EDIT],
    },
  },
];
