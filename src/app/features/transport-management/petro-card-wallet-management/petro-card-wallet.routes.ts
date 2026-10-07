import { Routes } from '@angular/router';
import { ROUTES } from '@shared/constants';
import { permissionGuard } from '@core/guards';
import { APP_PERMISSION } from '@core/constants';

export const PETRO_CARD_WALLET_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: ROUTES.PETRO_CARD_WALLET.LIST,
    pathMatch: 'full',
  },
  {
    path: ROUTES.PETRO_CARD_WALLET.LIST,
    loadComponent: () =>
      import(
        './components/get-petro-card-wallet/get-petro-card-wallet.component'
      ).then(m => m.GetPetroCardWalletComponent),
    canActivate: [permissionGuard],
    data: {
      permissions: [APP_PERMISSION.PETRO_CARD.WALLET_VIEW],
    },
  },
];
