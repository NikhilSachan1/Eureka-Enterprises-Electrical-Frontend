import { Routes } from '@angular/router';
import { APP_PERMISSION } from '@core/constants';
import { permissionGuard } from '@core/guards';
import { ROUTES } from '@shared/constants';

const { ENTRIES, PROJECT_WISE } = ROUTES.SITE.PROJECT.DAILY_PROGRESS_TAB;

/** Workspace daily progress: the DSR entries, and reporting per project. */
export const DSR_MANAGEMENT_DAILY_PROGRESS_ROUTES: Routes = [
  {
    path: ROUTES.SITE.PROJECT.DAILY_PROGRESS,
    loadComponent: () =>
      import('./components/dsr-tabs/dsr-tabs.component').then(
        m => m.DsrTabsComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.DSR.TABLE_VIEW],
    },
    children: [
      { path: '', redirectTo: ENTRIES, pathMatch: 'full' },
      {
        path: ENTRIES,
        loadComponent: () =>
          import('./components/get-dsr/get-dsr.component').then(
            m => m.GetDsrComponent
          ),
      },
      {
        path: PROJECT_WISE,
        loadComponent: () =>
          import(
            './components/get-dsr-project-wise/get-dsr-project-wise.component'
          ).then(m => m.GetDsrProjectWiseComponent),
      },
    ],
  },
];
