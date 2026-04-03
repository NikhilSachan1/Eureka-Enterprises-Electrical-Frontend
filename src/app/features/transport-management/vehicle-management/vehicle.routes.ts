import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { GetVehicleDetailResolver } from './resolvers/get-vehicle-detail.resolver';
import { permissionGuard } from '@core/guards';
import { APP_PERMISSION } from '@core/constants';

export const VEHICLE_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.VEHICLE.LIST,
    pathMatch: 'full',
  },
  {
    path: ROUTES.VEHICLE.LIST,
    loadComponent: () =>
      import('./components/get-vehicle/get-vehicle.component').then(
        m => m.GetVehicleComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.VEHICLE.TABLE_VIEW],
    },
  },
  {
    path: ROUTES.VEHICLE.ADD,
    loadComponent: () =>
      import('./components/add-vehicle/add-vehicle.component').then(
        m => m.AddVehicleComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.VEHICLE.ADD],
    },
  },
  {
    path: `${ROUTES.VEHICLE.EDIT}/:vehicleId`,
    loadComponent: () =>
      import('./components/edit-vehicle/edit-vehicle.component').then(
        m => m.EditVehicleComponent
      ),
    resolve: {
      vehicleDetail: GetVehicleDetailResolver,
    },
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.VEHICLE.EDIT],
    },
  },
  {
    path: ROUTES.VEHICLE.EVENT_HISTORY,
    loadComponent: () =>
      import(
        './components/get-vehicle-event-history/get-vehicle-event-history.component'
      ).then(m => m.GetVehicleEventHistoryComponent),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.VEHICLE.EVENT_HISTORY],
    },
  },
];
