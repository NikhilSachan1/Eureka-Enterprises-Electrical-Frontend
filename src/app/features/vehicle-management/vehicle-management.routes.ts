import { Routes } from '@angular/router';
import { ROUTES } from '../../shared/constants';

export const VEHICLE_MANAGEMENT_ROUTES: Routes = [
  {
    path: ROUTES.VEHICLE.LIST,
    loadComponent: () => import('./vehicle-list/vehicle-list.component')
      .then(m => m.VehicleListComponent)
  },
  {
    path: ROUTES.VEHICLE.ADD,
    loadComponent: () => import('./add-edit-vehicle/add-edit-vehicle.component')
      .then(m => m.AddEditVehicleComponent)
  },
  {
    path: ROUTES.VEHICLE.EDIT,
    loadComponent: () => import('./add-edit-vehicle/add-edit-vehicle.component')
      .then(m => m.AddEditVehicleComponent)
  }
]; 