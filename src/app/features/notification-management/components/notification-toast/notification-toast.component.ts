import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ICONS } from '@shared/constants';
import { ToastModule } from 'primeng/toast';
import {
  NOTIFICATION_TOAST_KEY,
  NOTIFICATION_TOAST_LIFE_MS,
} from '../../constants/notification-toast.constants';
import { NotificationInboxService } from '../../services/notification-inbox.service';
import { INotificationToastData } from '../../types/notification-toast.interface';

/**
 * New-notification toast (PrimeNG Toast on its own key), top centre.
 * Clicking it opens the notification's page, or the bell panel when several arrived.
 * Replaces the old modal popup: it never blocks the page or a dialog the user has open.
 */
@Component({
  selector: 'app-notification-toast',
  imports: [ToastModule],
  templateUrl: './notification-toast.component.html',
  styleUrl: './notification-toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationToastComponent {
  private readonly inbox = inject(NotificationInboxService);

  protected readonly ICONS = ICONS;
  protected readonly toastKey = NOTIFICATION_TOAST_KEY;
  protected readonly toastLife = NOTIFICATION_TOAST_LIFE_MS;

  protected toastData(data: unknown): INotificationToastData | null {
    return (data as INotificationToastData | undefined) ?? null;
  }

  protected onOpen(data: INotificationToastData | null): void {
    this.inbox.openFromToast(data);
  }
}
