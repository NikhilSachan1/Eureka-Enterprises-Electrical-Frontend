import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';
import { ThemeService } from '@core/services';
import { PushNotificationService } from '@features/notification-management/services/push-notification.service';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ICONS } from '@shared/constants';
import { IPageHeaderConfig } from '@shared/types';

@Component({
  selector: 'app-preferences-page',
  imports: [NgClass, PageHeaderComponent],
  templateUrl: './preferences-page.component.html',
  styleUrl: './preferences-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreferencesPageComponent {
  private readonly themeService = inject(ThemeService);
  private readonly push = inject(PushNotificationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly ICONS = ICONS;

  protected readonly pageHeaderConfig: IPageHeaderConfig = {
    title: 'Preferences',
    subtitle: 'Appearance and browser notification settings for this device',
  };

  readonly isDarkMode = this.themeService.isDarkMode;
  readonly pushPermission = this.push.permissionState;
  readonly isPushActive = this.push.isPushActive;
  readonly pushEnabling = this.push.enabling;
  readonly pushDisabling = this.push.disabling;

  readonly appearanceLabel = computed(() =>
    this.isDarkMode() ? 'Dark' : 'Light'
  );

  readonly appearanceIcon = computed(() =>
    this.isDarkMode() ? ICONS.THEME.MOON : ICONS.THEME.SUN
  );

  readonly showPushUnavailable = computed(() => {
    const state = this.pushPermission();
    return state === 'unsupported' || state === 'unconfigured';
  });

  readonly showPushDenied = computed(() => this.pushPermission() === 'denied');

  readonly showPushToggle = computed(() => {
    const state = this.pushPermission();
    return state === 'default' || state === 'granted';
  });

  readonly pushBusy = computed(
    () => this.pushEnabling() || this.pushDisabling()
  );

  toggleAppearance(): void {
    this.themeService.toggleTheme();
  }

  enablePush(): void {
    if (this.pushBusy()) {
      return;
    }
    this.push
      .enablePush()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  disablePush(): void {
    if (this.pushBusy()) {
      return;
    }
    this.push
      .disablePush()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
