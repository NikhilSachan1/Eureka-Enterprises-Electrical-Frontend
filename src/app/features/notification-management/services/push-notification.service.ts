import { inject, Injectable, signal } from '@angular/core';
import { APP_CONFIG } from '@core/config';
import { API_ROUTES } from '@core/constants';
import { ApiService, EnvironmentService, LoggerService } from '@core/services';
import { NotificationService } from '@shared/services';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import {
  getMessaging,
  getToken,
  isSupported,
  Messaging,
  onMessage,
  unregister,
} from 'firebase/messaging';
import {
  catchError,
  finalize,
  from,
  Observable,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import {
  NotificationRegisterDeviceRequestSchema,
  NotificationRegisterDeviceResponseSchema,
  NotificationUnregisterDeviceResponseSchema,
} from '../schemas';
import { NotificationInboxService } from './notification-inbox.service';

export type PushPermissionState =
  | 'unsupported'
  | 'unconfigured'
  | 'default'
  | 'granted'
  | 'denied';

const PUSH_OPT_OUT_STORAGE_KEY = 'push_notifications_opt_out';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  private readonly apiService = inject(ApiService);
  private readonly environmentService = inject(EnvironmentService);
  private readonly logger = inject(LoggerService);
  private readonly inbox = inject(NotificationInboxService);
  private readonly notificationService = inject(NotificationService);

  private messaging: Messaging | null = null;
  private currentToken: string | null = null;
  private foregroundSubscribed = false;
  private initPromise: Promise<boolean> | null = null;

  private readonly _permissionState = signal<PushPermissionState>('default');
  readonly permissionState = this._permissionState.asReadonly();

  /** True after a successful device registration this session (and not opted out). */
  private readonly _isPushActive = signal(false);
  readonly isPushActive = this._isPushActive.asReadonly();

  private readonly _enabling = signal(false);
  readonly enabling = this._enabling.asReadonly();

  private readonly _disabling = signal(false);
  readonly disabling = this._disabling.asReadonly();

  constructor() {
    this.syncPermissionState();
  }

  /**
   * Register the FCM token if the browser already granted permission.
   * Safe on every authenticated load — does not show a permission prompt.
   */
  registerIfPermitted(): Observable<boolean> {
    if (this.isOptedOut()) {
      this._isPushActive.set(false);
      return of(false);
    }

    return from(this.ensureReady()).pipe(
      switchMap(ready => {
        if (!ready) {
          return of(false);
        }
        if (typeof Notification === 'undefined') {
          return of(false);
        }
        if (Notification.permission !== 'granted') {
          this.syncPermissionState();
          return of(false);
        }
        return this.registerCurrentToken();
      }),
      catchError(error => {
        this.logger.logUserAction('Push registerIfPermitted failed', error);
        return of(false);
      })
    );
  }

  /**
   * Ask for notification permission (must run from a user click), then register.
   */
  enablePush(): Observable<boolean> {
    this._enabling.set(true);
    this.clearOptOut();

    return from(this.ensureReady()).pipe(
      switchMap(ready => {
        if (!ready) {
          this.notificationService.warning(
            'Browser push is not available on this device'
          );
          return of(false);
        }
        if (
          typeof Notification !== 'undefined' &&
          Notification.permission === 'granted'
        ) {
          return this.registerCurrentToken();
        }
        return from(Notification.requestPermission()).pipe(
          switchMap(permission => {
            this.syncPermissionState();
            if (permission !== 'granted') {
              return of(false);
            }
            return this.registerCurrentToken();
          })
        );
      }),
      tap(ok => {
        if (ok) {
          this.notificationService.success('Browser notifications enabled');
        }
      }),
      catchError(error => {
        this.logger.logUserAction('Push enablePush failed', error);
        this.notificationService.error('Could not enable browser notifications');
        return of(false);
      }),
      finalize(() => this._enabling.set(false))
    );
  }

  /**
   * Opt out of push on this browser: unregister device, then stop auto-register on load.
   */
  disablePush(): Observable<boolean> {
    this._disabling.set(true);
    this.setOptOut();

    return this.unregisterDeviceAndToken().pipe(
      tap(() => {
        this._isPushActive.set(false);
        this.notificationService.success('Browser notifications turned off');
      }),
      switchMap(() => of(true)),
      catchError(error => {
        this.logger.logUserAction('Push disablePush failed', error);
        this.notificationService.error('Could not turn off browser notifications');
        return of(false);
      }),
      finalize(() => this._disabling.set(false))
    );
  }

  /**
   * Unregister this browser on the server, then clear the FCM token.
   * Call while the auth header is still valid (before clearAuthState).
   */
  unregisterOnLogout(): Observable<void> {
    return this.unregisterDeviceAndToken().pipe(
      tap(() => this._isPushActive.set(false)),
      switchMap(() => of(undefined))
    );
  }

  private unregisterDeviceAndToken(): Observable<void> {
    const token = this.currentToken;
    if (!token) {
      return from(this.deleteLocalToken()).pipe(
        catchError(() => of(undefined)),
        tap(() => {
          this.currentToken = null;
          this.syncPermissionState();
        }),
        switchMap(() => of(undefined))
      );
    }

    return this.apiService
      .deleteValidated(
        API_ROUTES.NOTIFICATION.UNREGISTER_DEVICE(token),
        { response: NotificationUnregisterDeviceResponseSchema },
        undefined,
        { silent: true }
      )
      .pipe(
        catchError(error => {
          this.logger.logUserAction('Push device unregister failed', error);
          return of(null);
        }),
        switchMap(() =>
          from(this.deleteLocalToken()).pipe(
            catchError(error => {
              this.logger.logUserAction('Push unregister failed', error);
              return of(undefined);
            })
          )
        ),
        tap(() => {
          this.currentToken = null;
          this.syncPermissionState();
        }),
        switchMap(() => of(undefined))
      );
  }

  private isOptedOut(): boolean {
    try {
      return localStorage.getItem(PUSH_OPT_OUT_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  }

  private setOptOut(): void {
    try {
      localStorage.setItem(PUSH_OPT_OUT_STORAGE_KEY, '1');
    } catch {
      // ignore storage failures
    }
  }

  private clearOptOut(): void {
    try {
      localStorage.removeItem(PUSH_OPT_OUT_STORAGE_KEY);
    } catch {
      // ignore storage failures
    }
  }

  private async ensureReady(): Promise<boolean> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.initialize();
    return this.initPromise;
  }

  private async initialize(): Promise<boolean> {
    if (!this.isConfigured()) {
      this._permissionState.set('unconfigured');
      this.logger.warn('Firebase push is not configured in environment');
      return false;
    }

    const supported = await isSupported().catch(() => false);
    if (!supported) {
      this._permissionState.set('unsupported');
      return false;
    }

    try {
      const env = this.environmentService.environment;
      const app = this.getOrInitApp(env.FIREBASE);
      this.messaging = getMessaging(app);
      this.syncPermissionState();
      this.subscribeForeground();
      return true;
    } catch (error) {
      this.logger.error('Firebase messaging init failed', error);
      this._permissionState.set('unsupported');
      return false;
    }
  }

  private isConfigured(): boolean {
    const { FIREBASE, FIREBASE_VAPID_KEY } =
      this.environmentService.environment;
    return Boolean(
      FIREBASE.apiKey &&
        FIREBASE.projectId &&
        FIREBASE.appId &&
        FIREBASE.messagingSenderId &&
        FIREBASE_VAPID_KEY
    );
  }

  private getOrInitApp(config: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  }): FirebaseApp {
    return getApps().length > 0 ? getApp() : initializeApp(config);
  }

  private registerCurrentToken(): Observable<boolean> {
    if (!this.messaging) {
      return of(false);
    }

    const vapidKey = this.environmentService.environment.FIREBASE_VAPID_KEY;

    return from(
      getToken(this.messaging, {
        vapidKey,
      })
    ).pipe(
      switchMap(token => {
        if (!token) {
          return of(false);
        }
        this.currentToken = token;
        return this.postDevice(token);
      }),
      tap(ok => {
        this._isPushActive.set(ok);
        if (ok) {
          this.syncPermissionState();
        }
      }),
      catchError(error => {
        this.logger.logUserAction('Push getToken/register failed', error);
        this._isPushActive.set(false);
        return of(false);
      })
    );
  }

  private postDevice(token: string): Observable<boolean> {
    const body = {
      token,
      platform: 'web' as const,
      deviceName: this.buildDeviceName(),
      appVersion: APP_CONFIG.version,
    };

    this.logger.logUserAction('Push Register Device Request');

    return this.apiService
      .postValidated(
        API_ROUTES.NOTIFICATION.REGISTER_DEVICE,
        {
          request: NotificationRegisterDeviceRequestSchema,
          response: NotificationRegisterDeviceResponseSchema,
        },
        body,
        { silent: true }
      )
      .pipe(
        tap(response => {
          this.logger.logUserAction('Push Register Device Response', response);
          if (!response.pushEnabled) {
            this.logger.warn(
              'Server returned pushEnabled: false (push may be off for this env)'
            );
          }
        }),
        switchMap(() => of(true)),
        catchError(error => {
          this.logger.logUserAction('Push Register Device Error', error);
          return throwError(() => error);
        })
      );
  }

  private subscribeForeground(): void {
    if (!this.messaging || this.foregroundSubscribed) {
      return;
    }

    this.foregroundSubscribed = true;
    onMessage(this.messaging, payload => {
      this.inbox.refreshOnPush();
      const title = payload.notification?.title?.trim();
      if (title) {
        this.notificationService.info(title, 'Notification');
      }
    });
  }

  private async deleteLocalToken(): Promise<void> {
    if (!this.messaging) {
      return;
    }
    await unregister(this.messaging);
  }

  private syncPermissionState(): void {
    if (!this.isConfigured()) {
      this._permissionState.set('unconfigured');
      return;
    }
    if (typeof Notification === 'undefined') {
      this._permissionState.set('unsupported');
      return;
    }
    this._permissionState.set(Notification.permission);
  }

  private buildDeviceName(): string {
    const ua = navigator.userAgent;
    let browser = 'Browser';
    if (ua.includes('Edg/')) {
      browser = 'Edge';
    } else if (ua.includes('Chrome/')) {
      browser = 'Chrome';
    } else if (ua.includes('Firefox/')) {
      browser = 'Firefox';
    } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
      browser = 'Safari';
    }

    let os = 'Unknown';
    if (ua.includes('Windows')) {
      os = 'Windows';
    } else if (ua.includes('Mac OS')) {
      os = 'macOS';
    } else if (ua.includes('Android')) {
      os = 'Android';
    } else if (ua.includes('iPhone') || ua.includes('iPad')) {
      os = 'iOS';
    } else if (ua.includes('Linux')) {
      os = 'Linux';
    }

    return `${browser} on ${os}`.slice(0, 120);
  }
}
