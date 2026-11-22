import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { APP_CONFIG } from '@core/config';
import { ICONS } from '@shared/constants';
import { IUserInfo } from '@shared/types';
import { formatRelativeTime } from '@shared/utility';

/**
 * Lock status cell for site documents (PO, invoice, JMC, report, book payment), as a
 * tiny timeline: one step (Locked / Unlocked), or — when someone asked to unlock — a
 * second step with who asked, when, and why.
 */
@Component({
  selector: 'app-unlock-request',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  templateUrl: './unlock-request.component.html',
  styleUrl: './unlock-request.component.scss',
})
export class UnlockRequestComponent {
  protected readonly icons = ICONS;
  protected readonly APP_CONFIG = APP_CONFIG;

  readonly isLocked = input.required<boolean>();
  readonly requestedAt = input<string | null | undefined>(null);
  readonly requestedByUser = input<IUserInfo | null | undefined>(null);
  readonly reason = input<string | null | undefined>(null);

  protected readonly hasUnlockRequest = computed<boolean>(() => {
    const at = this.requestedAt();
    const by = this.requestedByUser();
    const why = this.reason();
    return !!(at && by && why && why.trim().length > 0);
  });

  protected readonly requestedByName = computed<string>(() => {
    const user = this.requestedByUser();
    if (!user) {
      return '';
    }
    return `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  });

  /** "2h ago"; the exact date and time is in the tooltip. */
  protected readonly requestedAgo = computed<string>(() =>
    formatRelativeTime(this.requestedAt())
  );
}
