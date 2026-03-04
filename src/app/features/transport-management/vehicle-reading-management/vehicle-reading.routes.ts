import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { GetLinkedUserVehicleDetailResolver } from '../fuel-expense-management/resolvers/get-linked-user-vehicle-detail.resolver';

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
  },
  {
    path: `${ROUTES.VEHICLE_READING.EDIT}/:vehicleReadingId`,
    loadComponent: () =>
      import(
        './components/edit-vehicle-reading/edit-vehicle-reading.component'
      ).then(m => m.EditVehicleReadingComponent),
    // resolve: {
    //     vehicleReadingDetail: GetVehicleReadingDetailResolver,
    // },
  },
];
