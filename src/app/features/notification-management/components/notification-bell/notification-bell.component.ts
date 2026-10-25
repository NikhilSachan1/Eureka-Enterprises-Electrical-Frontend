import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';
import { ICONS } from '@shared/constants';
import {
  ConfirmationDialogService,
  RouterNavigationService,
} from '@shared/services';
import { formatRelativeTime } from '@shared/utility';
import { Popover, PopoverModule } from 'primeng/popover';
import { TooltipModule } from 'primeng/tooltip';
import { finalize } from 'rxjs';
import { NotificationInboxService } from '../../services/notification-inbox.service';
import {
  INotificationListItemDto,
  NotificationListStatus,
} from '../../types/notification.dto';
import { getNotificationReferenceIcon } from '../../utils/notification-icon.util';

@Component({
  selector: 'app-notification-bell',
  imports: [NgClass, PopoverModule, TooltipModule],
  templateUrl: './notification-bell.component.html',
  styleUrl: './notification-bell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationBellComponent {
  @ViewChild('bellPopover') bellPopover!: Popover;
  @ViewChild('bellTrigger') bellTrigger!: ElementRef<HTMLButtonElement>;

  private readonly inbox = inject(NotificationInboxService);
  private readonly routerNavigation = inject(RouterNavigationService);
  private readonly confirmationDialog = inject(ConfirmationDialogService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly ICONS = ICONS;
  protected readonly panelOpen = signal(false);
  protected readonly markingAll = signal(false);
  protected readonly actingId = signal<string | null>(null);

  readonly unreadCount = this.inbox.unreadCount;
  readonly records = this.inbox.records;
  readonly statusFilter = this.inbox.statusFilter;
  readonly bootstrapLoading = this.inbox.bootstrapLoading;
  readonly bootstrapError = this.inbox.bootstrapError;
  readonly badgePulse = this.inbox.badgePulse;

  readonly badgeLabel = computed(() => {
    const count = this.unreadCount();
    if (count <= 0) {
      return '';
    }
    return count > 99 ? '99+' : String(count);
  });

  readonly hasUnread = computed(() => this.unreadCount() > 0);

  readonly emptyMessage = computed(() =>
    this.statusFilter() === 'unread'
      ? 'No unread notifications'
      : 'No notifications yet'
  );

  constructor() {
    this.inbox.registerViewHandler(() => this.openPanelFromAlert());
    this.destroyRef.onDestroy(() => this.inbox.unregisterViewHandler());
  }

  togglePanel(event: Event): void {
    event.stopPropagation();
    if (this.bootstrapLoading()) {
      return;
    }
    this.confirmationDialog.closeDialog();
    this.inbox.dismissAlert();
    this.bellPopover.toggle(event);
  }

  closePanel(): void {
    this.bellPopover?.hide();
  }

  onPanelShow(): void {
    this.panelOpen.set(true);
    this.confirmationDialog.closeDialog();
    this.inbox.dismissAlert();
    this.inbox.setStatusFilter(this.hasUnread() ? 'unread' : 'all');
  }

  onPanelHide(): void {
    this.panelOpen.set(false);
  }

  /** Tab switch uses bootstrap cache only — no API. */
  setStatusFilter(status: NotificationListStatus): void {
    this.inbox.setStatusFilter(status);
  }

  retryBootstrap(): void {
    this.inbox.retryBootstrap();
  }

  onRowClick(item: INotificationListItemDto): void {
    if (this.actingId()) {
      return;
    }

    const navigate = (): void => {
      this.bellPopover.hide();
      const route = item.route?.trim();
      if (route) {
        void this.routerNavigation.navigateByUrl(route);
      }
    };

    if (item.isRead) {
      navigate();
      return;
    }

    this.actingId.set(item.id);
    this.inbox
      .markAsRead(item.id)
      .pipe(
        finalize(() => this.actingId.set(null)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => navigate(),
        error: () => navigate(),
      });
  }

  toggleReadState(event: Event, item: INotificationListItemDto): void {
    event.stopPropagation();
    if (this.actingId()) {
      return;
    }

    this.actingId.set(item.id);
    const request$ = item.isRead
      ? this.inbox.markAsUnread(item.id)
      : this.inbox.markAsRead(item.id);

    request$
      .pipe(
        finalize(() => this.actingId.set(null)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  markAllAsRead(): void {
    if (!this.hasUnread() || this.markingAll()) {
      return;
    }

    this.markingAll.set(true);
    this.inbox
      .markAllAsRead()
      .pipe(
        finalize(() => this.markingAll.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  iconFor(item: INotificationListItemDto): string {
    return getNotificationReferenceIcon(item.referenceType);
  }

  relativeTime(item: INotificationListItemDto): string {
    return formatRelativeTime(item.createdAt);
  }

  private openPanelFromAlert(): void {
    if (this.panelOpen() || !this.bellTrigger?.nativeElement) {
      return;
    }
    this.bellPopover.show(
      new Event('click'),
      this.bellTrigger.nativeElement
    );
  }
}
