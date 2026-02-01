import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { GetContractorDetailResolver } from './resolvers/get-contractor-detail.resolver';

export const CONTRACTOR_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.SITE.CONTRACTOR.LIST,
    pathMatch: 'full',
  },
  {
    path: ROUTES.SITE.CONTRACTOR.LIST,
    loadComponent: () =>
      import('./components/get-contractor/get-contractor.component').then(
        m => m.GetContractorComponent
      ),
  },
  {
    path: ROUTES.SITE.CONTRACTOR.ADD,
    loadComponent: () =>
      import('./components/add-contractor/add-contractor.component').then(
        m => m.AddContractorComponent
      ),
  },
  {
    path: `${ROUTES.SITE.CONTRACTOR.EDIT}/:contractorId`,
    loadComponent: () =>
      import('./components/edit-contractor/edit-contractor.component').then(
        m => m.EditContractorComponent
      ),
    resolve: {
      contractorDetail: GetContractorDetailResolver,
    },
  },
];
