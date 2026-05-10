import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { GetProjectDetailResolver } from './resolvers/get-project-detail.resolver';
import { permissionGuard } from '@core/guards';
import { APP_PERMISSION } from '@core/constants';
import {
  DOC_MANAGEMENT_CONTRACTOR_DOC_ROUTES,
  DOC_MANAGEMENT_VENDOR_DOC_ROUTES,
} from '@features/site-management/doc-management/doc.routes';
import { DSR_MANAGEMENT_DAILY_PROGRESS_ROUTES } from '@features/site-management/dsr-management/dsr.routes';
import { PROJECT_WORKSPACE_PROFITABILITY_ROUTES } from '@features/site-management/project-profitability/profitability.routes';

export const PROJECT_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.SITE.PROJECT.LIST,
    pathMatch: 'full',
  },
  {
    path: ROUTES.SITE.PROJECT.LIST,
    loadComponent: () =>
      import('./components/get-project/get-project.component').then(
        m => m.GetProjectComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.PROJECT.TABLE_VIEW],
    },
  },
  {
    path: ROUTES.SITE.PROJECT.ADD,
    loadComponent: () =>
      import('./components/add-project/add-project.component').then(
        m => m.AddProjectComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.PROJECT.ADD],
    },
  },
  {
    path: `${ROUTES.SITE.PROJECT.EDIT}/:projectId`,
    loadComponent: () =>
      import('./components/edit-project/edit-project.component').then(
        m => m.EditProjectComponent
      ),
    resolve: {
      projectDetail: GetProjectDetailResolver,
    },
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.PROJECT.EDIT],
    },
  },
  {
    path: ROUTES.SITE.PROJECT.WORKSPACE,
    loadComponent: () =>
      import(
        './components/get-project-workspace/get-project-workspace.component'
      ).then(m => m.GetProjectWorkspaceComponent),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.PROJECT.WORKSPACE],
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: ROUTES.SITE.PROJECT.PROFITABILITY,
      },
      ...PROJECT_WORKSPACE_PROFITABILITY_ROUTES,
      ...DOC_MANAGEMENT_CONTRACTOR_DOC_ROUTES,
      ...DOC_MANAGEMENT_VENDOR_DOC_ROUTES,
      ...DSR_MANAGEMENT_DAILY_PROGRESS_ROUTES,
    ],
  },
];
