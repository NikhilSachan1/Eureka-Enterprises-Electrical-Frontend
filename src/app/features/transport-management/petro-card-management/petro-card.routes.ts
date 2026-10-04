import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { permissionGuard } from '@core/guards';
import { APP_PERMISSION } from '@core/constants';

export const PETRO_CARD_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.PETRO_CARD.LIST,
    pathMatch: 'full',
  },
  {
    path: ROUTES.PETRO_CARD.LIST,
    loadComponent: () =>
      import('./components/get-petro-card/get-petro-card.component').then(
        m => m.GetPetroCardComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.PETRO_CARD.TABLE_VIEW],
    },
  },
  {
    path: ROUTES.PETRO_CARD.ADD,
    loadComponent: () =>
      import('./components/add-petro-card/add-petro-card.component').then(
        m => m.AddPetroCardComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.PETRO_CARD.ADD],
    },
  },
  {
    path: `${ROUTES.PETRO_CARD.EDIT}/:petroCardId`,
    loadComponent: () =>
      import('./components/edit-petro-card/edit-petro-card.component').then(
        m => m.EditPetroCardComponent
      ),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.PETRO_CARD.EDIT],
    },
  },
  {
    path: ROUTES.PETRO_CARD.WALLET,
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            './wallet/components/get-petro-card-wallet/get-petro-card-wallet.component'
          ).then(m => m.GetPetroCardWalletComponent),
        canActivate: [permissionGuard],
        data: {
          permissions: [APP_PERMISSION.PETRO_CARD.WALLET_VIEW],
        },
      },
      {
        path: ROUTES.PETRO_CARD.WALLET_ADD,
        loadComponent: () =>
          import(
            './wallet/components/add-wallet-recharge/add-wallet-recharge.component'
          ).then(m => m.AddWalletRechargeComponent),
        canActivate: [permissionGuard],
        data: {
          permissions: [APP_PERMISSION.PETRO_CARD.WALLET_MANAGE],
        },
      },
      {
        path: `${ROUTES.PETRO_CARD.WALLET_EDIT}/:rechargeId`,
        loadComponent: () =>
          import(
            './wallet/components/edit-wallet-recharge/edit-wallet-recharge.component'
          ).then(m => m.EditWalletRechargeComponent),
        canActivate: [permissionGuard],
        data: {
          permissions: [APP_PERMISSION.PETRO_CARD.WALLET_MANAGE],
        },
      },
    ],
  },
];
