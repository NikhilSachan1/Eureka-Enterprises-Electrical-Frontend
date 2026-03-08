import { Routes } from '@angular/router';
import { APP_PERMISSION } from '@core/constants';
import { permissionGuard } from '@core/guards';
import { ROUTES } from '@shared/constants';
import { GetAnnouncementDetailResolver } from './resolvers/get-announcement-detail.resolver';

export const ANNOUNCEMENT_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.ANNOUNCEMENT.LIST,
    pathMatch: 'full',
  },
  {
    path: ROUTES.ANNOUNCEMENT.LIST,
    loadComponent: () =>
      import('./components/get-announcement/get-announcement.component').then(
        m => m.GetAnnouncementComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.ANNOUNCEMENT.TABLE_VIEW],
    },
  },
  {
    path: ROUTES.ANNOUNCEMENT.ADD,
    loadComponent: () =>
      import('./components/add-announcement/add-announcement.component').then(
        m => m.AddAnnouncementComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.ANNOUNCEMENT.ADD],
    },
  },
  {
    path: `${ROUTES.ANNOUNCEMENT.EDIT}/:announcementId`,
    loadComponent: () =>
      import('./components/edit-announcement/edit-announcement.component').then(
        m => m.EditAnnouncementComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.ANNOUNCEMENT.EDIT],
    },
    resolve: {
      announcementDetail: GetAnnouncementDetailResolver,
    },
  },
];
