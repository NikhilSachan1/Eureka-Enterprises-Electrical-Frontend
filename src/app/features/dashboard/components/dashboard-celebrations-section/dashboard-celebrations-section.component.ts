import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { ICONS } from '@shared/constants';
import { IDashboardCelebrationRow } from '@features/dashboard/types/dashboard.interface';
import { AvatarService } from '@shared/services';

type CelebrationVariant = 'birthdays' | 'anniversaries' | 'holidays';

@Component({
  selector: 'app-dashboard-celebrations-section',
  imports: [NgClass, DatePipe],
  templateUrl: './dashboard-celebrations-section.component.html',
  styleUrls: ['./dashboard-celebrations-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardCelebrationsSectionComponent {
  protected readonly ICONS = ICONS;
  private readonly avatarService = inject(AvatarService);

  readonly variant = input.required<CelebrationVariant>();
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly rows = input<readonly IDashboardCelebrationRow[]>([]);
  readonly loading = input<boolean>(false);
  readonly emptyText = input<string>('No items available');

  protected trackByIndex(index: number): number {
    return index;
  }

  protected getInitials(label: string): string {
    const chunks = label.trim().split(/\s+/).filter(Boolean).slice(0, 2);
    return chunks.map(chunk => chunk[0]?.toUpperCase() ?? '').join('') || 'NA';
  }

  protected rowBadge(daysLeft: number): 'Today' | 'Upcoming' {
    return daysLeft === 0 ? 'Today' : 'Upcoming';
  }

  protected rowWhen(daysLeft: number): string {
    if (daysLeft <= 0) {
      return 'Today';
    }
    return `In ${daysLeft} days`;
  }

  protected anniversaryCopy(years: number): string {
    return `${years} ${years === 1 ? 'year' : 'years'} with us`;
  }

  protected avatarBgColor(seed: string): string {
    return `#${this.avatarService.getConsistentColor(seed)}`;
  }
}
