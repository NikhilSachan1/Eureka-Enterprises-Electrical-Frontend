import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';
import { ButtonComponent } from '@shared/components/button/button.component';
import { IButtonConfig, EButtonActionType } from '@shared/types';
import { ICONS } from '@shared/constants';
import { NetworkMonitorService } from '@core/services';

@Component({
  selector: 'app-offline',
  standalone: true,
  imports: [NgClass, ButtonComponent, CardModule, AvatarModule, RippleModule],
  templateUrl: './offline.component.html',
  styleUrl: './offline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfflineComponent {
  private readonly networkMonitor = inject(NetworkMonitorService);

  protected readonly isOnline = this.networkMonitor.isOnline;
  protected readonly isChecking = signal(false);

  protected readonly retryButtonConfig: Partial<IButtonConfig> = {
    id: EButtonActionType.SUBMIT,
    label: 'Retry Connection',
    icon: ICONS.COMMON.SYNC,
  };

  retryConnection(): void {
    this.isChecking.set(true);

    setTimeout(() => {
      this.isChecking.set(false);
      if (navigator.onLine) {
        setTimeout(() => window.location.reload(), 2000);
      }
    }, 1500);
  }
}
