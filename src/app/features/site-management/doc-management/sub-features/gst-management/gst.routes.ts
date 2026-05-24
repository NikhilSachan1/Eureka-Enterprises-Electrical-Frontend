import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';

/** Project workspace child: GST summary register. */
export const GST_MANAGEMENT_ROUTES: Routes = [
  {
    path: ROUTES.SITE.PROJECT.GST_SUMMARY,
    loadComponent: () =>
      import('./components/get-gst-entry/get-gst-entry.component').then(
        m => m.GetGstEntryComponent
      ),
  },
];
