import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';

export const MY_FILES_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.MY_FILES.LIST,
    pathMatch: 'full',
  },
  {
    path: ROUTES.MY_FILES.LIST,
    loadComponent: () =>
      import(
        '@features/my-files-management/components/get-my-files/get-my-files.component'
      ).then(m => m.GetMyFilesComponent),
  },
];
