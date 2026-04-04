import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';

export const DOC_MANAGEMENT_ROUTES: Routes = [
  {
    path: `${ROUTES.SITE.DOC.ADD}/:projectId`,
    loadComponent: () =>
      import('./components/add-doc/add-doc.component').then(
        m => m.AddDocComponent
      ),
  },
  {
    path: `${ROUTES.SITE.DOC.EDIT}/:docId`,
    loadComponent: () =>
      import('./components/edit-doc/edit-doc.component').then(
        m => m.EditDocComponent
      ),
  },
];
