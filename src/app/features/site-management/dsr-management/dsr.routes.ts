import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';

export const DSR_MANAGEMENT_ROUTES: Routes = [
  {
    path: `${ROUTES.SITE.DSR.ADD}/:projectId`,
    loadComponent: () =>
      import('./components/add-dsr/add-dsr.component').then(
        m => m.AddDsrComponent
      ),
  },
  {
    path: `${ROUTES.SITE.DSR.EDIT}/:dsrId`,
    loadComponent: () =>
      import('./components/edit-dsr/edit-dsr.component').then(
        m => m.EditDsrComponent
      ),
  },
];

/** Project workspace child: daily progress (DSR list for project). */
export const DSR_MANAGEMENT_DAILY_PROGRESS_ROUTES: Routes = [
  {
    path: ROUTES.SITE.PROJECT.DAILY_PROGRESS,
    loadComponent: () =>
      import('./components/get-dsr/get-dsr.component').then(
        m => m.GetDsrComponent
      ),
  },
];
