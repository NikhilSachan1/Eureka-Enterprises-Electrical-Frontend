import { Routes } from '@angular/router';
import { APP_PERMISSION } from '@core/constants';
import { permissionGuard } from '@core/guards';
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
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.MY_FILES.TABLE_VIEW],
    },
  },
];
