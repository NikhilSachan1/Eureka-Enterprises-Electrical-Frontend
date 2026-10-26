import { Routes } from '@angular/router';

export const PREFERENCES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/preferences-page/preferences-page.component').then(
        m => m.PreferencesPageComponent
      ),
  },
];
