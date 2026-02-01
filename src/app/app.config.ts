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
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import {
  provideAnimations,
  BrowserAnimationsModule,
} from '@angular/platform-browser/animations';
import { providePrimeNG } from 'primeng/config';
import { ConfirmationService, MessageService } from 'primeng/api';
import Aura from '@primeng/themes/aura';
import { routes } from './app.routes';
import { AuthInterceptor, ErrorInterceptor } from '@core/interceptors';
import { TimezoneService } from '@core/services';
import { AuthService } from '@features/auth-management/services/auth.service';
import { UserPermissionService } from '@features/settings-management/permission-management/sub-features/user-permission-management/services/user-permission.service';
import { AppConfigurationService } from '@shared/services';
import { APP_CONFIG } from '@core/config';
import { lastValueFrom, take } from 'rxjs';
import { FinancialYearService } from '@core/services/financial-year.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    importProvidersFrom(BrowserAnimationsModule),
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
    provideZoneChangeDetection({
      eventCoalescing: true,
      runCoalescing: true,
    }),
    provideHttpClient(
      withFetch(),
      withInterceptors([AuthInterceptor, ErrorInterceptor])
    ),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
      withEnabledBlockingInitialNavigation()
    ),
    ConfirmationService,
    MessageService,

    provideAppInitializer(async () => {
      const timezoneService = inject(TimezoneService);
      const authService = inject(AuthService);
      const userPermissionService = inject(UserPermissionService);
      const financialYearService = inject(FinancialYearService);
      const appConfigurationService = inject(AppConfigurationService);

      timezoneService.getTimezone();

      const financialYear = financialYearService.getFinancialYear();
      financialYearService.setFinancialYear(financialYear);

      if (!authService.isAuthenticated()) {
        return;
      }

      if (APP_CONFIG.USER_PERMISSION_CONFIG.wantPeriodicRefresh) {
        userPermissionService.startPeriodicRefresh();
      }

      const blockingTasks: Promise<unknown>[] = [
        lastValueFrom(
          userPermissionService
            .fetchAndStoreLoggedInUserPermissions()
            .pipe(take(1))
        ),
        lastValueFrom(
          appConfigurationService.loadAppConfiguration().pipe(take(1))
        ),
        lastValueFrom(appConfigurationService.loadEmployeeList().pipe(take(1))),
        lastValueFrom(appConfigurationService.loadAllAppRoles().pipe(take(1))),
        lastValueFrom(appConfigurationService.loadAssetList().pipe(take(1))),
        lastValueFrom(appConfigurationService.loadVehicleList().pipe(take(1))),
        lastValueFrom(appConfigurationService.loadCompanyList().pipe(take(1))),
      ];

      try {
        await Promise.all(blockingTasks);
      } catch (error) {
        console.error(error);
      }
    }),
  ],
};
