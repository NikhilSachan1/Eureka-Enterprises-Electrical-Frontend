import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, signal } from '@angular/core';
import { APP_CONFIG } from '@core/config';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { RouterNavigationService } from '@shared/services';
import { MessageService } from 'primeng/api';
import {
  catchError,
  distinctUntilChanged,
  EMPTY,
  exhaustMap,
  forkJoin,
  fromEvent,
  map,
  Observable,
  of,
  startWith,
  Subscription,
  switchMap,
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
  NOTIFICATION_TOAST_KEY,
  NOTIFICATION_TOAST_LIFE_MS,
} from '../constants/notification-toast.constants';
import { INotificationToastData } from '../types/notification-toast.interface';
import {
  INotificationGetFormDto,
  INotificationGetResponseDto,
  INotificationListItemDto,
  INotificationMarkStateResponseDto,
  INotificationReadAllResponseDto,
  NotificationListStatus,
} from '../types/notification.dto';
import {
  buildUnreadCountsByMenuKey,
  formatMenuBadgeCount,
} from '../utils/notification-menu-badge.util';

interface NotificationBucket {
  records: INotificationListItemDto[];
  totalRecords: number;
}

const EMPTY_BUCKET: NotificationBucket = { records: [], totalRecords: 0 };

@Injectable({
  providedIn: 'root',
})
export class NotificationInboxService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);
  private readonly messageService = inject(MessageService);
  private readonly routerNavigation = inject(RouterNavigationService);
  private readonly document = inject(DOCUMENT);

  /** Open bell panel (registered by NotificationBellComponent). */
  private viewNotificationsHandler?: () => void;
  /** Bell panel is open: new items show there, so no toast on top of it. */
  private panelOpen = false;

  private readonly _unreadCount = signal(0);
  readonly unreadCount = this._unreadCount.asReadonly();

  private readonly _bootstrapLoading = signal(false);
  readonly bootstrapLoading = this._bootstrapLoading.asReadonly();

  private readonly _bootstrapError = signal(false);
  readonly bootstrapError = this._bootstrapError.asReadonly();

  private readonly _bootstrapped = signal(false);

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

  /** Unread counts by sidebar menu `basePath` (from loaded unread bucket). */
  readonly unreadCountByMenuKey = computed(() =>
    buildUnreadCountsByMenuKey(this._unreadBucket().records)
  );

  private pollSubscription?: Subscription;
  /** When the last poll tick fired (ms epoch); 0 before the first one. */
  private lastPollAt = 0;

  /** Badge label for a menu item `basePath`, or empty when none. */
  menuBadgeLabel(menuKey: string | undefined | null): string {
    if (!menuKey) {
      return '';
    }
    return formatMenuBadgeCount(this.unreadCountByMenuKey().get(menuKey) ?? 0);
  }

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
   *
   * Polling pauses while the tab is hidden. When the tab comes back, the next
   * refresh runs once the interval since the last one has elapsed (immediately
   * if it already has), so quick tab switches don't each fire a request.
   */
  startUnreadPolling(): void {
    if (this.pollSubscription && !this.pollSubscription.closed) {
      return;
    }

    const intervalMs =
      APP_CONFIG.BELL_NOTIFICATION_CONFIG.UNREAD_POLL_INTERVAL_MS;

    const isVisible$ = fromEvent(this.document, 'visibilitychange').pipe(
      startWith(null),
      map(() => this.document.visibilityState !== 'hidden'),
      distinctUntilChanged()
    );

    this.pollSubscription = isVisible$
      .pipe(
        switchMap(isVisible => {
          if (!isVisible) {
            return EMPTY;
          }
          const sinceLastPoll = Date.now() - this.lastPollAt;
          return timer(Math.max(0, intervalMs - sinceLastPoll), intervalMs);
        }),
        tap(() => (this.lastPollAt = Date.now())),
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
    this.lastPollAt = 0;
    this.clearNotificationToast();
    this._allBucket.set(EMPTY_BUCKET);
    this._unreadBucket.set(EMPTY_BUCKET);
    this._unreadCount.set(0);
    this.lastSeenUnreadCount = 0;
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

  /** Bell tells the inbox when its panel opens or closes. */
  setPanelOpen(open: boolean): void {
    this.panelOpen = open;
  }

  /** The user has looked (opened the panel): stop the pulse and drop the toast. */
  dismissAlert(): void {
    this.clearNotificationToast();
    this._badgePulse.set(false);
  }

  /**
   * Toast click. One notification with a page: go straight there and mark it read (as a
   * click in the bell panel does). Several, or no page: open the bell panel.
   */
  openFromToast(data: INotificationToastData | null): void {
    this.clearNotificationToast();

    if (!data?.route) {
      this.viewNotificationsHandler?.();
      return;
    }

    this._badgePulse.set(false);
    void this.routerNavigation.navigateByUrl(data.route);

    if (data.notificationId) {
      // Best effort: the page opens either way; a failed mark leaves it unread.
      this.markAsRead(data.notificationId)
        .pipe(catchError(() => EMPTY))
        .subscribe();
    }
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
   * Bootstrap (login): no toast; the badge count and pulse already say there is unread.
   * Background: a toast only when unread rises above what the user last saw
   * (read → 1, then a new one → 2 still alerts).
   */
  private notifyIfNewUnread(nextCount: number, isBootstrap: boolean): void {
    this._unreadCount.set(nextCount);

    if (isBootstrap) {
      if (nextCount > 0) {
        this._badgePulse.set(true);
      }
      this.lastSeenUnreadCount = nextCount;
      return;
    }

    if (nextCount > this.lastSeenUnreadCount) {
      this.showNewNotificationToast(nextCount - this.lastSeenUnreadCount);
    }

    this.lastSeenUnreadCount = nextCount;
  }

  /** Non-blocking toast for new notifications; never covers a dialog the user is in. */
  private showNewNotificationToast(added: number): void {
    this._badgePulse.set(true);

    if (this.panelOpen) {
      return;
    }

    const newest = this.newestUnread();
    const single = added === 1 ? newest : null;
    // A blank route means "no page": the click then opens the bell panel.
    const singleRoute = single?.route?.trim();
    const data: INotificationToastData = single
      ? {
          heading: single.title,
          detail: single.message === '' ? null : single.message,
          count: 1,
          notificationId: single.id,
          route: singleRoute === '' ? null : (singleRoute ?? null),
        }
      : {
          heading:
            added === 1 ? 'New notification' : `${added} new notifications`,
          detail: newest ? `Latest: ${newest.title}` : null,
          count: added,
          notificationId: null,
          route: null,
        };

    this.addNotificationToast(data);
  }

  private addNotificationToast(data: INotificationToastData): void {
    // One toast at a time: a newer arrival replaces the previous one.
    this.clearNotificationToast();
    this.messageService.add({
      key: NOTIFICATION_TOAST_KEY,
      severity: 'info',
      summary: data.heading,
      detail: data.detail ?? undefined,
      life: NOTIFICATION_TOAST_LIFE_MS,
      data,
    });
  }

  private newestUnread(): INotificationListItemDto | null {
    const { records } = this._unreadBucket();

    if (!records.length) {
      return null;
    }

    return records.reduce((newest, record) =>
      record.createdAt > newest.createdAt ? record : newest
    );
  }

  private clearNotificationToast(): void {
    this.messageService.clear(NOTIFICATION_TOAST_KEY);
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
