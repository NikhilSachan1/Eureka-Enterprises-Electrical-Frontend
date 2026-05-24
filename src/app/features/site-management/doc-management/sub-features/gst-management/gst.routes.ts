import { Routes } from '@angular/router';
import { APP_PERMISSION } from '@core/constants';
import { permissionGuard } from '@core/guards';
import { ROUTES } from '@shared/constants';

/** Project workspace child: GST summary register. */
export const GST_MANAGEMENT_ROUTES: Routes = [
  {
    path: ROUTES.SITE.PROJECT.GST_SUMMARY,
    loadComponent: () =>
      import('./components/get-gst-entry/get-gst-entry.component').then(
        m => m.GetGstEntryComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.GST.TABLE_VIEW],
    },
  },
];
