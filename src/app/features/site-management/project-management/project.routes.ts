import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { GetProjectDetailResolver } from './resolvers/get-project-detail.resolver';

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
  },
  {
    path: ROUTES.SITE.PROJECT.ADD,
    loadComponent: () =>
      import('./components/add-project/add-project.component').then(
        m => m.AddProjectComponent
      ),
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
  },
];
