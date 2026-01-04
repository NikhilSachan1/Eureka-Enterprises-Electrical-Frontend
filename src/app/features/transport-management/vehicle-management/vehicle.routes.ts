import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { GetVehicleDetailResolver } from './resolvers/get-vehicle-detail.resolver';

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
  },
  {
    path: ROUTES.VEHICLE.ADD,
    loadComponent: () =>
      import('./components/add-vehicle/add-vehicle.component').then(
        m => m.AddVehicleComponent
      ),
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
  },
  {
    path: `${ROUTES.VEHICLE.EVENT_HISTORY}/:vehicleId`,
    loadComponent: () =>
      import(
        './components/get-vehicle-event-history/get-vehicle-event-history.component'
      ).then(m => m.GetVehicleEventHistoryComponent),
  },
  {
    path: `${ROUTES.VEHICLE.SERVICE_INFO}/:vehicleId`,
    loadComponent: () =>
      import(
        './components/get-vehicle-service-history/get-vehicle-service-history.component'
      ).then(m => m.GetVehicleServiceHistoryComponent),
  },
  {
    path: ROUTES.VEHICLE.ADD_SERVICE,
    loadComponent: () =>
      import(
        './components/add-vehicle-service/add-vehicle-service.component'
      ).then(m => m.AddVehicleServiceComponent),
  },
  {
    path: ROUTES.VEHICLE.EDIT_SERVICE,
    loadComponent: () =>
      import(
        './components/edit-vehicle-service/edit-vehicle-service.component'
      ).then(m => m.EditVehicleServiceComponent),
  },
];
