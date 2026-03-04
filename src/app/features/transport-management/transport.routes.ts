import { Routes } from '@angular/router';
import { ROUTE_BASE_PATHS } from '@shared/constants';

export const TRANSPORT_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTE_BASE_PATHS.VEHICLE,
    pathMatch: 'full',
  },
  {
    path: ROUTE_BASE_PATHS.VEHICLE,
    loadChildren: () =>
      import('./vehicle-management/vehicle.routes').then(
        m => m.VEHICLE_MANAGEMENT_ROUTES
      ),
  },
  {
    path: ROUTE_BASE_PATHS.VEHICLE_SERVICE,
    loadChildren: () =>
      import('./vehicle-service-management/vehicle-service.routes').then(
        m => m.VEHICLE_SERVICE_MANAGEMENT_ROUTES
      ),
  },
  {
    path: ROUTE_BASE_PATHS.PETRO_CARD,
    loadChildren: () =>
      import('./petro-card-management/petro-card.routes').then(
        m => m.PETRO_CARD_MANAGEMENT_ROUTES
      ),
  },
  {
    path: ROUTE_BASE_PATHS.VEHICLE_READING,
    loadChildren: () =>
      import('./vehicle-reading-management/vehicle-reading.routes').then(
        m => m.VEHICLE_READING_MANAGEMENT_ROUTES
      ),
  },
  {
    path: ROUTE_BASE_PATHS.FUEL,
    loadChildren: () =>
      import('./fuel-expense-management/fuel-expense.routes').then(
        m => m.FUEL_EXPENSE_MANAGEMENT_ROUTES
      ),
  },
];
