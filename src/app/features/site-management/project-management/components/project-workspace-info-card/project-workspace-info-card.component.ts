import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { APP_CONFIG } from '@core/config';
import { SectionLoaderComponent } from '@shared/components/section-loader/section-loader.component';
import { StatusTagComponent } from '@shared/components/status-tag/status-tag.component';
import { ICONS } from '@shared/constants';
import { AvatarService } from '@shared/services';
import { Popover, PopoverModule } from 'primeng/popover';
import { TooltipModule } from 'primeng/tooltip';
import { ProjectSiteTypeChipsComponent } from '../project-site-type-chips/project-site-type-chips.component';
import { IProjectOverviewGetResponseDto } from '../../types/project.dto';

type TPeopleKind = 'contractors' | 'vendors' | 'team';

interface IPeopleItem {
  name: string;
  sub: string | null;
  avatar: string;
}

interface IPeopleList {
  title: string;
  icon: string;
  tone: 'contractor' | 'vendor' | 'team';
  empty: string;
  items: IPeopleItem[];
}

/** Allocated employee as the overview API sends it (the schema keeps only the id). */
interface IAllocatedEmployee {
  firstName?: string | null;
  lastName?: string | null;
  employeeId?: string | null;
  role?: string | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;
/** Work types shown by name; the rest are counted. */
const VISIBLE_WORK_TYPES = 3;

/**
 * Project overview in the workspace, as one compact strip: who, where, when, and how far through
 * the schedule. The contractor / vendor / on-site counts open a list of the people behind them.
 */
@Component({
  selector: 'app-project-workspace-info-card',
  imports: [
    DatePipe,
    PopoverModule,
    SectionLoaderComponent,
    StatusTagComponent,
    TooltipModule,
    ProjectSiteTypeChipsComponent,
  ],
  templateUrl: './project-workspace-info-card.component.html',
  styleUrl: './project-workspace-info-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectWorkspaceInfoCardComponent {
  readonly overview = input<IProjectOverviewGetResponseDto | null>(null);
  readonly loading = input(false);

  private readonly avatarService = inject(AvatarService);

  protected readonly icons = ICONS;
  protected readonly dateFormat = APP_CONFIG.DATE_FORMATS.DEFAULT;

  protected readonly site = computed(() => this.overview()?.site ?? null);

  protected readonly workTypes = computed(() => {
    const all = this.site()?.workTypes ?? [];
    return {
      shown: all.slice(0, VISIBLE_WORK_TYPES),
      more: all.slice(VISIBLE_WORK_TYPES),
    };
  });

  protected readonly contractors = computed(() =>
    this.partyItems(this.overview()?.contractors ?? [])
  );

  protected readonly vendors = computed(() =>
    this.partyItems(this.overview()?.vendors ?? [])
  );

  /** Staff currently allocated to the site. */
  protected readonly team = computed<IPeopleItem[]>(() =>
    (this.overview()?.employees.allocated ?? [])
      .filter(row => !!row)
      .map(row => {
        const person = row as IAllocatedEmployee;
        const fullName = [person.firstName, person.lastName]
          .filter(Boolean)
          .join(' ')
          .trim();
        const name =
          fullName !== '' ? fullName : (person.employeeId ?? 'Employee');
        return {
          name,
          sub:
            [person.employeeId, person.role].filter(Boolean).join(' · ') ||
            null,
          avatar: this.avatarService.getAvatarFromName(name),
        };
      })
  );

  /** List in the people popover, set by the count that opened it. */
  protected readonly people = signal<IPeopleList>({
    title: '',
    icon: '',
    tone: 'team',
    empty: '',
    items: [],
  });

  /** Where today falls in the schedule: day X of Y, and the share elapsed. */
  protected readonly schedule = computed(() => {
    const site = this.site();
    if (!site) {
      return null;
    }
    const start = this.dayOf(site.startDate);
    const end = this.dayOf(site.endDate);
    if (start === null || end === null || end < start) {
      return null;
    }
    const today = this.dayOf(new Date().toISOString().slice(0, 10)) ?? start;
    const totalDays = Math.round((end - start) / DAY_MS) + 1;
    const elapsed = Math.min(
      Math.max(Math.round((today - start) / DAY_MS) + 1, 0),
      totalDays
    );
    let label: string;
    if (today < start) {
      const days = Math.round((start - today) / DAY_MS);
      label = `Starts in ${days} ${days === 1 ? 'day' : 'days'}`;
    } else if (today > end) {
      const days = Math.round((today - end) / DAY_MS);
      label = `Ended ${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
      label = `Day ${elapsed} of ${totalDays}`;
    }
    return {
      percent: Math.round((elapsed / totalDays) * 100),
      label,
      overdue: today > end,
    };
  });

  protected showPeople(
    kind: TPeopleKind,
    event: Event,
    popover: Popover
  ): void {
    const lists: Record<TPeopleKind, IPeopleList> = {
      contractors: {
        title: 'Contractors',
        icon: 'pi pi-users',
        tone: 'contractor',
        empty: 'No contractor linked to this project.',
        items: this.contractors(),
      },
      vendors: {
        title: 'Vendors',
        icon: 'pi pi-truck',
        tone: 'vendor',
        empty: 'No vendor linked to this project.',
        items: this.vendors(),
      },
      team: {
        title: 'On site',
        icon: 'pi pi-id-card',
        tone: 'team',
        empty: 'No one is allocated to this site right now.',
        items: this.team(),
      },
    };
    this.people.set(lists[kind]);
    popover.toggle(event);
  }

  private partyItems(rows: ({ name?: string | null } | null)[]): IPeopleItem[] {
    return rows
      .map(row => row?.name)
      .filter((name): name is string => !!name)
      .map(name => ({
        name,
        sub: null,
        avatar: this.avatarService.getAvatarFromName(name),
      }));
  }

  private dayOf(value: string | null | undefined): number | null {
    if (!value) {
      return null;
    }
    const ms = Date.parse(`${value.slice(0, 10)}T00:00:00`);
    return Number.isFinite(ms) ? ms : null;
  }
}
