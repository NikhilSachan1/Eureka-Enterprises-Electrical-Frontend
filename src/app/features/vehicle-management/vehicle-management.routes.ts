import { Routes } from '@angular/router';
import { ROUTES } from '../../shared/constants';

export const VEHICLE_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.VEHICLE.LIST,
    pathMatch: 'full'
  },
  {
    path: ROUTES.VEHICLE.LIST,
    loadComponent: () => import('./vehicle-list/vehicle-list.component')
      .then(m => m.VehicleListComponent)
  },
  {
    path: ROUTES.VEHICLE.ADD,
    loadComponent: () => import('./add-vehicle/add-vehicle.component')
      .then(m => m.AddVehicleComponent)
  }
]; 