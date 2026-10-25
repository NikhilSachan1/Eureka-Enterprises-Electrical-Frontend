import { computed, inject, Injectable, NgZone, signal } from '@angular/core';
import { APP_CONFIG } from '@core/config';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { ICONS } from '@shared/constants';
import { ConfirmationDialogService } from '@shared/services';
import {
  EButtonActionType,
  EButtonSeverity,
  EDialogSize,
} from '@shared/types';
import {
  catchError,
  exhaustMap,
  forkJoin,
  Observable,
  of,
  Subscription,
  tap,
  throwError,
  timer,
} from 'rxjs';
import {
  NotificationGetRequestSchema,
  NotificationGetResponseSchema,
  NotificationMarkStateResponseSchema,
  NotificationReadAllResponseSchema,
} from '../schemas';
import {
  INotificationGetFormDto,
  INotificationGetResponseDto,
  INotificationListItemDto,
  INotificationMarkStateResponseDto,
  INotificationReadAllResponseDto,
  NotificationListStatus,
} from '../types/notification.dto';

interface NotificationBucket {
  records: INotificationListItemDto[];
  totalRecords: number;
}

const EMPTY_BUCKET: NotificationBucket = { records: [], totalRecords: 0 };

/** Same idea as announcements: wait for ConfirmDialog host after app init. */
const ALERT_DIALOG_OPEN_DELAY_MS = 600;

@Injectable({
  providedIn: 'root',
})
export class NotificationInboxService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);
  private readonly confirmationDialog = inject(ConfirmationDialogService);
  private readonly ngZone = inject(NgZone);

  /** Open bell panel (registered by NotificationBellComponent). */
  private viewNotificationsHandler?: () => void;
  private alertDialogTimer?: ReturnType<typeof setTimeout>;
  private alertDialogMessage: string | null = null;

  private readonly _unreadCount = signal(0);
  readonly unreadCount = this._unreadCount.asReadonly();

  private readonly _bootstrapLoading = signal(false);
  readonly bootstrapLoading = this._bootstrapLoading.asReadonly();

  private readonly _bootstrapError = signal(false);
  readonly bootstrapError = this._bootstrapError.asReadonly();

  private readonly _bootstrapped = signal(false);

  /** Inline tip next to the bell (not a global toast). */
  private readonly _alertMessage = signal<string | null>(null);
  readonly alertMessage = this._alertMessage.asReadonly();

  private readonly _badgePulse = signal(false);
  readonly badgePulse = this._badgePulse.asReadonly();

  /** Last unread count the user was made aware of (bootstrap / popup / local read). */
  private lastSeenUnreadCount = 0;

  private readonly _allBucket = signal<NotificationBucket>(EMPTY_BUCKET);
  private readonly _unreadBucket = signal<NotificationBucket>(EMPTY_BUCKET);

  private readonly _statusFilter = signal<'all' | 'unread'>('all');
  readonly statusFilter = this._statusFilter.asReadonly();

  readonly records = computed(() =>
    this._statusFilter() === 'unread'
      ? this._unreadBucket().records
      : this._allBucket().records
  );

  private pollSubscription?: Subscription;

  setStatusFilter(status: NotificationListStatus): void {
    if (status === 'all' || status === 'unread') {
      this._statusFilter.set(status);
    }
  }

  markAsRead(
    notificationId: string
  ): Observable<INotificationMarkStateResponseDto> {
    return this.patchReadState(
      API_ROUTES.NOTIFICATION.MARK_READ(notificationId),
      'Mark Notification Read',
      notificationId,
      true
    );
  }

  markAsUnread(
    notificationId: string
  ): Observable<INotificationMarkStateResponseDto> {
    return this.patchReadState(
      API_ROUTES.NOTIFICATION.MARK_UNREAD(notificationId),
      'Mark Notification Unread',
      notificationId,
      false
    );
  }

  markAllAsRead(): Observable<INotificationReadAllResponseDto> {
    this.logger.logUserAction('Mark All Notifications Read Request');

    return this.apiService
      .patchValidated(
        API_ROUTES.NOTIFICATION.READ_ALL,
        { response: NotificationReadAllResponseSchema },
        {}
      )
      .pipe(
        tap(response => {
          this.logger.logUserAction(
            'Mark All Notifications Read Response',
            response
          );
          this.setUnreadCount(response.count);
          this._allBucket.update(b => ({
            ...b,
            records: b.records.map(item => ({ ...item, isRead: true })),
          }));
          this._unreadBucket.set(EMPTY_BUCKET);
        }),
        catchError(error => this.rethrow('Mark All Notifications Read', error))
      );
  }

  /**
   * Bootstrap: fetch all + unread once (badge loader).
   * Then silently refresh both on the poll interval — including when
   * unread/total is 0, so newly created notifications are still picked up.
   */
  startUnreadPolling(): void {
    if (this.pollSubscription && !this.pollSubscription.closed) {
      return;
    }

    const intervalMs =
      APP_CONFIG.BELL_NOTIFICATION_CONFIG.UNREAD_POLL_INTERVAL_MS;

    this.pollSubscription = timer(0, intervalMs)
      .pipe(
        exhaustMap(() =>
          this.refreshBothLists(!this._bootstrapped()).pipe(
            catchError(error => {
              this.logger.logUserAction(
                'Notification background refresh failed',
                error
              );
              return of({ all: null, unread: null });
            })
          )
        )
      )
      .subscribe();
  }

  stopUnreadPolling(): void {
    this.pollSubscription?.unsubscribe();
    this.pollSubscription = undefined;
    this.clearAlertDialogTimer();
    this._allBucket.set(EMPTY_BUCKET);
    this._unreadBucket.set(EMPTY_BUCKET);
    this._unreadCount.set(0);
    this.lastSeenUnreadCount = 0;
    this._alertMessage.set(null);
    this.alertDialogMessage = null;
    this._badgePulse.set(false);
    this._bootstrapped.set(false);
    this._bootstrapLoading.set(false);
    this._bootstrapError.set(false);
    this._statusFilter.set('all');
  }

  /** Bell calls this so "View" can open the panel. */
  registerViewHandler(handler: () => void): void {
    this.viewNotificationsHandler = handler;
  }

  unregisterViewHandler(): void {
    this.viewNotificationsHandler = undefined;
  }

  dismissAlert(): void {
    this.clearAlertDialogTimer();
    this.alertDialogMessage = null;
    this._alertMessage.set(null);
    this._badgePulse.set(false);
  }

  retryBootstrap(): void {
    if (!this._bootstrapLoading()) {
      this.refreshBothLists(true).subscribe();
    }
  }

  private patchReadState(
    endpoint: string,
    label: string,
    notificationId: string,
    isRead: boolean
  ): Observable<INotificationMarkStateResponseDto> {
    this.logger.logUserAction(`${label} Request`, { notificationId });

    return this.apiService
      .patchValidated(
        endpoint,
        { response: NotificationMarkStateResponseSchema },
        {}
      )
      .pipe(
        tap(response => {
          this.logger.logUserAction(`${label} Response`, response);
          this.setUnreadCount(response.count);
          this.applyLocalReadState(notificationId, isRead);
        }),
        catchError(error => this.rethrow(label, error))
      );
  }

  private refreshBothLists(showLoader: boolean): Observable<{
    all: INotificationGetResponseDto | null;
    unread: INotificationGetResponseDto | null;
  }> {
    const wasBootstrapped = this._bootstrapped();

    if (showLoader) {
      this._bootstrapLoading.set(true);
      this._bootstrapError.set(false);
    }

    const pageSize = APP_CONFIG.BELL_NOTIFICATION_CONFIG.DROPDOWN_PAGE_SIZE;

    return forkJoin({
      all: this.fetchList({ status: 'all', page: 1, pageSize }).pipe(
        catchError(() => of(null))
      ),
      unread: this.fetchList({ status: 'unread', page: 1, pageSize }).pipe(
        catchError(() => of(null))
      ),
    }).pipe(
      tap(({ all, unread }) => {
        if (all) {
          this._allBucket.set({
            records: all.records,
            totalRecords: all.totalRecords,
          });
        }
        if (unread) {
          this._unreadBucket.set({
            records: unread.records,
            totalRecords: unread.totalRecords,
          });
        }

        const nextCount =
          unread?.unreadCount ?? all?.unreadCount ?? this._unreadCount();
        const ok = all !== null || unread !== null;

        if (ok) {
          this.notifyIfNewUnread(nextCount, !wasBootstrapped);
          this._bootstrapped.set(true);
        }

        this._bootstrapError.set(!ok && !this._bootstrapped());
        this._bootstrapLoading.set(false);
      }),
      catchError(() => {
        this._bootstrapLoading.set(false);
        if (!this._bootstrapped()) {
          this._bootstrapError.set(true);
        }
        return of({ all: null, unread: null });
      })
    );
  }

  /**
   * Bootstrap: tip when any unread exist.
   * Background: tip only when unread rises above what the user last saw
   * (read → 1, then a new one → 2 still alerts).
   */
  private notifyIfNewUnread(nextCount: number, isBootstrap: boolean): void {
    this._unreadCount.set(nextCount);

    if (isBootstrap) {
      if (nextCount > 0) {
        this.showAlert(
          nextCount === 1
            ? 'You have 1 unread notification'
            : `You have ${nextCount} unread notifications`
        );
      }
      this.lastSeenUnreadCount = nextCount;
      return;
    }

    if (nextCount > this.lastSeenUnreadCount) {
      const added = nextCount - this.lastSeenUnreadCount;
      this.showAlert(
        added === 1
          ? 'New notification received'
          : `${added} new notifications received`
      );
      this.lastSeenUnreadCount = nextCount;
      return;
    }

    this.lastSeenUnreadCount = nextCount;
  }

  private showAlert(message: string): void {
    this._alertMessage.set(message);
    this._badgePulse.set(true);
    this.scheduleAlertDialog(message);
  }

  private scheduleAlertDialog(message: string): void {
    this.clearAlertDialogTimer();
    this.alertDialogMessage = message;

    this.ngZone.runOutsideAngular(() => {
      this.alertDialogTimer = setTimeout(() => {
        this.ngZone.run(() => this.openAlertDialog(message));
      }, ALERT_DIALOG_OPEN_DELAY_MS);
    });
  }

  private openAlertDialog(message: string): void {
    if (this.alertDialogMessage !== message) {
      return;
    }

    this.confirmationDialog.showConfirmationDialog(
      EButtonActionType.VIEW,
      {
        dialogConfig: {
          header: 'Notifications',
          message,
          icon: ICONS.COMMON.BELL,
          size: EDialogSize.SMALL,
          dismissableMask: true,
          acceptButtonProps: {
            label: 'View',
            id: EButtonActionType.VIEW,
            icon: ICONS.ACTIONS.EYE,
            severity: EButtonSeverity.PRIMARY,
          },
          rejectButtonProps: {
            label: 'Later',
            icon: ICONS.ACTIONS.TIMES,
            severity: EButtonSeverity.SECONDARY,
          },
        },
        onAccept: () => this.viewNotificationsHandler?.(),
      },
      null,
      false,
      false
    );

    this.alertDialogMessage = null;
    this._alertMessage.set(null);
  }

  private clearAlertDialogTimer(): void {
    if (this.alertDialogTimer !== undefined) {
      clearTimeout(this.alertDialogTimer);
      this.alertDialogTimer = undefined;
    }
  }

  private setUnreadCount(count: number): void {
    this._unreadCount.set(count);
    this.lastSeenUnreadCount = count;
  }

  private fetchList(
    params: INotificationGetFormDto
  ): Observable<INotificationGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.NOTIFICATION.LIST,
        {
          response: NotificationGetResponseSchema,
          request: NotificationGetRequestSchema,
        },
        params
      )
      .pipe(
        catchError(error => {
          this.logger.logUserAction('Get Notifications Error', error);
          return throwError(() => error);
        })
      );
  }

  private applyLocalReadState(id: string, isRead: boolean): void {
    this._allBucket.update(b => ({
      ...b,
      records: b.records.map(item =>
        item.id === id ? { ...item, isRead } : item
      ),
    }));

    if (isRead) {
      this._unreadBucket.update(b => ({
        records: b.records.filter(item => item.id !== id),
        totalRecords: Math.max(0, b.totalRecords - 1),
      }));
      return;
    }

    const fromAll = this._allBucket().records.find(item => item.id === id);
    if (!fromAll) {
      return;
    }

    this._unreadBucket.update(b => {
      if (b.records.some(item => item.id === id)) {
        return {
          ...b,
          records: b.records.map(item =>
            item.id === id ? { ...item, isRead: false } : item
          ),
        };
      }
      return {
        records: [{ ...fromAll, isRead: false }, ...b.records],
        totalRecords: b.totalRecords + 1,
      };
    });
  }

  private rethrow(label: string, error: unknown): Observable<never> {
    this.logger.logUserAction(`${label} Error`, error);
    return throwError(() => error);
  }
}
