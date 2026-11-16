import { EnvironmentInjector, inject, Injectable } from '@angular/core';
import type { AnnouncementService } from '@features/announcement-management/services/announcement.service';
import type { NotificationInboxService } from '@features/notification-management/services/notification-inbox.service';
import type { PushNotificationService } from '@features/notification-management/services/push-notification.service';
import { from, Observable, switchMap } from 'rxjs';

interface IBackgroundServices {
  announcement: AnnouncementService;
  notificationInbox: NotificationInboxService;
  push: PushNotificationService;
}

/**
 * Announcements, the notification inbox and push registration run in the background after
 * sign-in. They are loaded with `import()` instead of being part of the start-up bundle, so the
 * first screen does not wait for their code.
 */
@Injectable({ providedIn: 'root' })
export class BackgroundServicesLoader {
  private readonly injector = inject(EnvironmentInjector);
  private loading?: Promise<IBackgroundServices>;

  /** Loads the services once (later calls reuse the same load). */
  load(): Promise<IBackgroundServices> {
    this.loading ??= Promise.all([
      import('@features/announcement-management/services/announcement.service'),
      import(
        '@features/notification-management/services/notification-inbox.service'
      ),
      import(
        '@features/notification-management/services/push-notification.service'
      ),
    ]).then(([announcement, inbox, push]) => ({
      announcement: this.injector.get(announcement.AnnouncementService),
      notificationInbox: this.injector.get(inbox.NotificationInboxService),
      push: this.injector.get(push.PushNotificationService),
    }));
    return this.loading;
  }

  /**
   * Starts unread polling, and — unless a super admin is signed in as someone else — the
   * announcement check and push registration (both would act on the real user's account).
   */
  async start(options: { impersonating: boolean }): Promise<void> {
    const services = await this.load();
    services.notificationInbox.startUnreadPolling();
    if (!options.impersonating) {
      services.announcement.startPeriodicUnacknowledgedCheck();
      services.push.registerIfPermitted().subscribe();
    }
  }

  /** Stops polling; nothing to stop when the services were never loaded. */
  stopIfLoaded(): void {
    void this.loading?.then(services => {
      services.announcement.stopPeriodicUnacknowledgedCheck();
      services.notificationInbox.stopUnreadPolling();
    });
  }

  /** Drops this device's push registration (loads the service if needed: a token may exist). */
  unregisterPushOnLogout(): Observable<unknown> {
    return from(this.load()).pipe(
      switchMap(services => services.push.unregisterOnLogout())
    );
  }
}
