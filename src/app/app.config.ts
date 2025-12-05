import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
  withInMemoryScrolling,
  withComponentInputBinding,
} from '@angular/router';
import {
  provideHttpClient,
  withInterceptors,
  withFetch,
} from '@angular/common/http';
import { AuthInterceptor, ErrorInterceptor } from '@core/interceptors';
import {
  provideAnimations,
  BrowserAnimationsModule,
} from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import { ConfirmationService, MessageService } from 'primeng/api';
import Aura from '@primeng/themes/aura';
import { routes } from './app.routes';
import { AppPermissionService, TimezoneService } from '@core/services';
import { AuthService } from '@features/auth-management/services/auth.service';
import { UserPermissionService } from '@features/settings-management/permission-management/sub-features/user-permission-management/services/user-permission.service';
import { APP_CONFIG } from '@core/config';
import { lastValueFrom, tap } from 'rxjs';
import { FinancialYearService } from '@core/services/financial-year.service';

export const appConfig: ApplicationConfig = {
  providers: [
    // Animations with async loading
    provideAnimations(),

    // PrimeNG configuration
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.my-app-dark',
          cssLayer: {
            name: 'primeng',
            order: 'tailwind, primeng',
          },
        },
      },
    }),

    // Angular V19: Optimized change detection with event coalescing
    provideZoneChangeDetection({
      eventCoalescing: true,
      runCoalescing: true,
    }),

    // Angular V19: HTTP client with Fetch API and interceptors
    provideHttpClient(
      withFetch(),
      withInterceptors([
        AuthInterceptor, // Handle authentication tokens
        ErrorInterceptor, // Handle HTTP errors
      ])
    ),

    // Angular V19: Enhanced router with component input binding
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
      withEnabledBlockingInitialNavigation()
    ),

    // Services
    {
      provide: ConfirmationService,
      useClass: ConfirmationService,
    },
    {
      provide: MessageService,
      useClass: MessageService,
    },

    importProvidersFrom(BrowserAnimationsModule),
    provideAppInitializer(() => {
      const timezoneService = inject(TimezoneService);
      const authService = inject(AuthService);
      const userPermissionService = inject(UserPermissionService);
      const financialYearService = inject(FinancialYearService);
      const appPermissionService = inject(AppPermissionService);

      const financialYear = financialYearService.getFinancialYear();
      financialYearService.setFinancialYear(financialYear);
      timezoneService.getTimezone();

      if (authService.isAuthenticated()) {
        appPermissionService.setUIPermissions();
        if (APP_CONFIG.USER_PERMISSION_CONFIG.wantPeriodicRefresh) {
          return lastValueFrom(
            userPermissionService.fetchAndStoreLoggedInUserPermissions().pipe(
              tap(() => {
                if (APP_CONFIG.USER_PERMISSION_CONFIG.wantPeriodicRefresh) {
                  userPermissionService.startPeriodicRefresh();
                }
              })
            )
          );
        }
        return lastValueFrom(
          userPermissionService.fetchAndStoreLoggedInUserPermissions()
        );
      }

      return Promise.resolve();
    }),
  ],
};
