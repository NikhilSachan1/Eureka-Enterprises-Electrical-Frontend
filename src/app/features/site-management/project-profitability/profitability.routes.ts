import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';

/** Project workspace child: profitability. */
export const PROJECT_WORKSPACE_PROFITABILITY_ROUTES: Routes = [
  {
    path: ROUTES.SITE.PROJECT.PROFITABILITY,
    loadComponent: () =>
      import('./components/get-profitability/get-profitability.component').then(
        m => m.GetProfitabilityComponent
      ),
  },
];
