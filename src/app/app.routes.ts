import { Routes } from '@angular/router';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants/index';
import { PublicLayoutComponent } from '@shared/components/layouts/public-layout/public-layout.component';
import { PrivateLayoutComponent } from '@shared/components/layouts/private-layout/private-layout.component';
import { authGuard } from '@core/guards/auth.guard';
import { GuestGuard } from '@core/guards/guest.guard';

export const routes: Routes = [
  // Public routes (no sidebar)
  {
    path: '',
    component: PublicLayoutComponent,
    canActivate: [GuestGuard],
    children: [
      {
        path: '',
        redirectTo: `${ROUTE_BASE_PATHS.AUTH}/${ROUTES.AUTH.LOGIN}`,
        pathMatch: 'full'
      },
      {
        path: ROUTE_BASE_PATHS.AUTH,
        loadChildren: () => import('./features/auth-management/auth-management.routes')
          .then(m => m.AUTH_MANAGEMENT_ROUTES)
      }
    ]
  },
  
  // Private routes (with sidebar)
  {
    path: '',
    component: PrivateLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: ROUTE_BASE_PATHS.SETTINGS.BASE,
        loadChildren: () => import('./features/settings-management/setting-management.routes')
          .then(m => m.SETTING_MANAGEMENT_ROUTES)
      },
      {
        path: '**',
        redirectTo: `${ROUTE_BASE_PATHS.SETTINGS.BASE}`
      }
    ]
  },
  
  {
    path: '**',
    redirectTo: `${ROUTE_BASE_PATHS.AUTH}/${ROUTES.AUTH.LOGIN}`
  }
];
