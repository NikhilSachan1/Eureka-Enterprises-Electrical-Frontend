import { Routes } from '@angular/router';

export const USER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/get-user/get-user.component').then(
        m => m.GetUserComponent
      ),
  },
];
