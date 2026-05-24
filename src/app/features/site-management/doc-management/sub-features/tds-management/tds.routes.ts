import { Routes } from '@angular/router';
import { APP_PERMISSION } from '@core/constants';
import { permissionGuard } from '@core/guards';
import { ROUTES } from '@shared/constants';

/** Project workspace child: TDS summary register. */
export const TDS_MANAGEMENT_ROUTES: Routes = [
  {
    path: ROUTES.SITE.PROJECT.TDS_SUMMARY,
    loadComponent: () =>
      import('./components/get-tds-entry/get-tds-entry.component').then(
        m => m.GetTdsEntryComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.TDS.TABLE_VIEW],
    },
  },
];
