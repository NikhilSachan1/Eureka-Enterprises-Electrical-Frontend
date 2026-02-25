import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';

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
  },
  {
    path: ROUTES.VEHICLE_SERVICE.ADD,
    loadComponent: () =>
      import(
        './components/add-vehicle-service/add-vehicle-service.component'
      ).then(m => m.AddVehicleServiceComponent),
  },
  {
    path: `${ROUTES.VEHICLE_SERVICE.EDIT}/:serviceId`,
    loadComponent: () =>
      import(
        './components/edit-vehicle-service/edit-vehicle-service.component'
      ).then(m => m.EditVehicleServiceComponent),
  },
];
