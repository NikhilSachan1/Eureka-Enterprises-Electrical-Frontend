import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';

export const DSR_MANAGEMENT_DAILY_PROGRESS_ROUTES: Routes = [
  {
    path: ROUTES.SITE.PROJECT.DAILY_PROGRESS,
    loadComponent: () =>
      import('./components/get-dsr/get-dsr.component').then(
        m => m.GetDsrComponent
      ),
  },
];
