import { Routes } from '@angular/router';
import { ROUTE_BASE_PATHS } from '@shared/constants';

export const SITE_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTE_BASE_PATHS.SITE.BASE,
    pathMatch: 'full',
  },
  {
    path: ROUTE_BASE_PATHS.SITE.COMPANY,
    loadChildren: () =>
      import('./company-management/company.routes').then(
        m => m.COMPANY_MANAGEMENT_ROUTES
      ),
  },
  {
    path: ROUTE_BASE_PATHS.SITE.CONTRACTOR,
    loadChildren: () =>
      import('./contractor-management/contractor.routes').then(
        m => m.CONTRACTOR_MANAGEMENT_ROUTES
      ),
  },
  {
    path: ROUTE_BASE_PATHS.SITE.PROJECT,
    loadChildren: () =>
      import('./project-management/project.routes').then(
        m => m.PROJECT_MANAGEMENT_ROUTES
      ),
  },
  {
    path: ROUTE_BASE_PATHS.SITE.DSR,
    loadChildren: () =>
      import('./dsr-management/dsr.routes').then(m => m.DSR_MANAGEMENT_ROUTES),
  },
  {
    path: ROUTE_BASE_PATHS.SITE.DOC,
    loadChildren: () =>
      import('./doc-management/doc.routes').then(m => m.DOC_MANAGEMENT_ROUTES),
  },
];
