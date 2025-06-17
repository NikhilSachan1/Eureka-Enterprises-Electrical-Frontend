import { Routes } from '@angular/router';
import { ROUTES } from '../../../shared/constants';

export const PROJECT_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.SITE.PROJECT.LIST,
    pathMatch: 'full'
  },
  {
    path: ROUTES.SITE.PROJECT.LIST,
    loadComponent: () => import('./project-list/project-list.component')
      .then(m => m.ProjectListComponent)
  },
  {
    path: ROUTES.SITE.PROJECT.ADD,
    loadComponent: () => import('./project-add/project-add.component')
      .then(m => m.ProjectAddComponent)
  },
]; 