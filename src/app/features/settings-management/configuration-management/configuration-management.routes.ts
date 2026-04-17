import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { GetConfigurationDetailResolver } from './resolvers/get-configuration-detail.resolver';
import { permissionGuard } from '@core/guards';
import { APP_PERMISSION } from '@core/constants';

export const CONFIGURATION_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.SETTINGS.CONFIGURATION.LIST,
    pathMatch: 'full',
  },
  {
    path: ROUTES.SETTINGS.CONFIGURATION.LIST,
    loadComponent: () =>
      import('./components/get-configuration/get-configuration.component').then(
        m => m.GetConfigurationComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.CONFIGURATION.TABLE_VIEW],
    },
  },
  {
    path: ROUTES.SETTINGS.CONFIGURATION.ADD,
    loadComponent: () =>
      import('./components/add-configuration/add-configuration.component').then(
        m => m.AddConfigurationComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.CONFIGURATION.ADD],
    },
  },
  {
    path: `${ROUTES.SETTINGS.CONFIGURATION.EDIT}/:configurationId`,
    loadComponent: () =>
      import(
        './components/edit-configuration/edit-configuration.component'
      ).then(m => m.EditConfigurationComponent),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.CONFIGURATION.EDIT],
    },
    resolve: {
      configurationDetail: GetConfigurationDetailResolver,
    },
  },
];
