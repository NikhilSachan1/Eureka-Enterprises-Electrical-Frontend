import { Routes } from '@angular/router';
import { APP_PERMISSION } from '@core/constants';
import { permissionGuard } from '@core/guards';
import { ROUTES } from '@shared/constants';

/** Contractor / vendor workspace tab: TDS summary register for that side. */
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
