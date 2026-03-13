import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { GetProjectDetailResolver } from './resolvers/get-project-detail.resolver';
import { GetProjectDocDetailResolver } from './resolvers/get-project-doc-detail.resolver';
import { permissionGuard } from '@core/guards';
import { APP_PERMISSION } from '@core/constants';
import { GetDsrDetailResolver } from './resolvers/get-dsr-detail.resolver';

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
  {
    path: `${ROUTES.SITE.PROJECT.DAILY_STATUS.ADD}/:projectId`,
    loadComponent: () =>
      import('./components/project-dsr/add-dsr/add-dsr.component').then(
        m => m.AddDsrComponent
      ),
  },
  {
    path: `${ROUTES.SITE.PROJECT.DAILY_STATUS.EDIT}/:dsrId`,
    loadComponent: () =>
      import('./components/project-dsr/edit-dsr/edit-dsr.component').then(
        m => m.EditDsrComponent
      ),
    resolve: {
      dsrDetail: GetDsrDetailResolver,
    },
  },
  {
    path: `${ROUTES.SITE.PROJECT.DOCUMENT.ADD}/:projectId`,
    loadComponent: () =>
      import(
        './components/project-doc/add-project-doc/add-project-doc.component'
      ).then(m => m.AddProjectDocComponent),
  },
  {
    path: `${ROUTES.SITE.PROJECT.DOCUMENT.EDIT}/:id`,
    loadComponent: () =>
      import(
        './components/project-doc/edit-project-doc/edit-project-doc.component'
      ).then(m => m.EditProjectDocComponent),
    resolve: {
      projectDocDetail: GetProjectDocDetailResolver,
    },
  },
];
