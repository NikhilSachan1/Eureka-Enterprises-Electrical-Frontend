import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
  isDevMode,
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
import { AppPreset, APP_CONFIG } from '@core/config';
import { routes } from './app.routes';
import {
  CriticalStartupBlockInterceptor,
  AuthInterceptor,
  ErrorInterceptor,
  RolePayloadSanitizerInterceptor,
} from '@core/interceptors';
import {
  CriticalStartupStateService,
  ThemeService,
  TimezoneService,
} from '@core/services';
import { AuthService } from '@features/auth-management/services/auth.service';
import { UserPermissionService } from '@features/settings-management/permission-management/sub-features/user-permission-management/services/user-permission.service';
import { AnnouncementService } from '@features/announcement-management/services/announcement.service';
import { AppConfigurationService } from '@shared/services';
import { lastValueFrom, take } from 'rxjs';
import { FinancialYearService } from '@core/services/financial-year.service';
import { provideServiceWorker } from '@angular/service-worker';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    importProvidersFrom(BrowserAnimationsModule),
    providePrimeNG({
      theme: {
        preset: AppPreset,
        options: {
          darkModeSelector: '.dark-theme',
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
      withInterceptors([
        CriticalStartupBlockInterceptor,
        AuthInterceptor,
        RolePayloadSanitizerInterceptor,
        ErrorInterceptor,
      ])
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

    provideAppInitializer(() => {
      inject(ThemeService);
    }),
    provideAppInitializer(async () => {
      const timezoneService = inject(TimezoneService);
      const authService = inject(AuthService);
      const userPermissionService = inject(UserPermissionService);
      const financialYearService = inject(FinancialYearService);
      const appConfigurationService = inject(AppConfigurationService);
      const announcementService = inject(AnnouncementService);
      const criticalStartupState = inject(CriticalStartupStateService);
      const isStartupErrorPath = criticalStartupState.isStartupErrorPath();
      const requestedUrl = criticalStartupState.getCurrentUrl();

      if (criticalStartupState.criticalLoadFailed()) {
        criticalStartupState.setRedirectUrl(requestedUrl);
        if (!isStartupErrorPath) {
          window.location.replace(
            criticalStartupState.buildStartupErrorUrl(requestedUrl)
          );
        }
        return;
      }

      timezoneService.getTimezone();

      const financialYear = financialYearService.getFinancialYear();
      financialYearService.setFinancialYear(financialYear);

      if (!authService.isAuthenticated()) {
        criticalStartupState.clearCriticalLoadFailure();
        return;
      }

      if (isStartupErrorPath) {
        return;
      }

      if (APP_CONFIG.USER_PERMISSION_CONFIG.wantPeriodicRefresh) {
        userPermissionService.startPeriodicRefresh();
      }

      try {
        criticalStartupState.clearCriticalLoadFailure();
        await lastValueFrom(
          appConfigurationService.loadCriticalAppData().pipe(take(1))
        );
      } catch (error) {
        console.error('Failed to load app data during initialization:', error);
        window.location.replace(
          criticalStartupState.markFailedAndBuildRedirectUrl(requestedUrl)
        );
        return;
      }

      appConfigurationService.prefetchReferenceListsInBackground();

      announcementService.startPeriodicUnacknowledgedCheck();
    }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
