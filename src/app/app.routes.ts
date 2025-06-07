import { Routes } from '@angular/router';
import { ROUTE_BASE_PATHS } from './shared/constants/index';
import { PublicLayoutComponent } from './shared/components/layouts/public-layout/public-layout.component';
import { PrivateLayoutComponent } from './shared/components/layouts/private-layout/private-layout.component';

export const routes: Routes = [
  // Public routes (no sidebar)
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: ROUTE_BASE_PATHS.AUTH,
        pathMatch: 'full'
      }
    ]
  },
  
  // Private routes (with sidebar)
  {
    path: '',
    component: PrivateLayoutComponent,
    children: [
      {
        path: ROUTE_BASE_PATHS.EMPLOYEE,
        loadChildren: () => import('./features/employee-management/employee-management.routes')
          .then(m => m.EMPLOYEE_MANAGEMENT_ROUTES)
      },
    ]
  },
  
  {
    path: '**',
    redirectTo: ROUTE_BASE_PATHS.AUTH
  }
];
