import { Routes } from '@angular/router';
import { ROUTE_BASE_PATHS, ROUTES } from '../../shared/constants';

export const SITE_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.SITE.PROJECT.LIST,
    pathMatch: 'full'
  },
  {
    path: ROUTE_BASE_PATHS.SITE.COMPANY,
    loadChildren: () => import('./company-management/company-management.routes')
      .then(m => m.COMPANY_MANAGEMENT_ROUTES)
  },
  {
    path: ROUTE_BASE_PATHS.SITE.CONTRACTOR,
    loadChildren: () => import('./contractor-management/contractor-management.routes')
      .then(m => m.CONTRACTOR_MANAGEMENT_ROUTES)
  },
  {
    path: ROUTE_BASE_PATHS.SITE.PROJECT,
    loadChildren: () => import('./project-management/project-management.routes')
      .then(m => m.PROJECT_MANAGEMENT_ROUTES)
  }
]; 