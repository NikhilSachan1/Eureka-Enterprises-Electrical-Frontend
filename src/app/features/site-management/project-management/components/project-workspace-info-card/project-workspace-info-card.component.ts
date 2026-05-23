import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { APP_CONFIG } from '@core/config';
import { ChipComponent } from '@shared/components/chip/chip.component';
import { ICONS } from '@shared/constants';
import { IProjectOverviewGetResponseDto } from '../../types/project.dto';

@Component({
  selector: 'app-project-workspace-info-card',
  imports: [CommonModule, ChipComponent, DatePipe],
  templateUrl: './project-workspace-info-card.component.html',
  styleUrl: './project-workspace-info-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectWorkspaceInfoCardComponent {
  readonly overview = input<IProjectOverviewGetResponseDto | null>(null);

  protected readonly icons = ICONS;
  protected readonly dateFormat = APP_CONFIG.DATE_FORMATS.DEFAULT;

  protected readonly site = computed(() => this.overview()?.site ?? null);

  protected readonly workTypeLabels = computed(
    () => this.overview()?.site?.workTypes ?? []
  );

  protected readonly contractorNames = computed(() =>
    (this.overview()?.contractors ?? [])
      .map(contractor => contractor?.name)
      .filter((name): name is string => !!name)
  );

  protected readonly vendorNames = computed(() =>
    (this.overview()?.vendors ?? [])
      .map(vendor => vendor?.name)
      .filter((name): name is string => !!name)
  );
}
