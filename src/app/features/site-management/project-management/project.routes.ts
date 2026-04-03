import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { GetProjectDetailResolver } from './resolvers/get-project-detail.resolver';
import { permissionGuard } from '@core/guards';
import { APP_PERMISSION } from '@core/constants';

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
    path: `${ROUTES.SITE.PROJECT.ANALYSIS}/:projectId`,
    loadComponent: () =>
      import(
        './components/get-project-analysis/get-project-analysis.component'
      ).then(m => m.GetProjectAnalysisComponent),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.PROJECT.ANALYSIS],
    },
  },
];
