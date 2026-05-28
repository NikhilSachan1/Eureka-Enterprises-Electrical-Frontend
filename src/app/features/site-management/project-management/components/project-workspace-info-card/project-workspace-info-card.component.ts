import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { APP_CONFIG } from '@core/config';
import { ChipComponent } from '@shared/components/chip/chip.component';
import { SectionLoaderComponent } from '@shared/components/section-loader/section-loader.component';
import { ICONS } from '@shared/constants';
import { AppConfigurationService } from '@shared/services';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { IProjectOverviewGetResponseDto } from '../../types/project.dto';

@Component({
  selector: 'app-project-workspace-info-card',
  imports: [CommonModule, ChipComponent, DatePipe, SectionLoaderComponent],
  templateUrl: './project-workspace-info-card.component.html',
  styleUrl: './project-workspace-info-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectWorkspaceInfoCardComponent {
  readonly overview = input<IProjectOverviewGetResponseDto | null>(null);
  readonly loading = input(false);

  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly icons = ICONS;
  protected readonly dateFormat = APP_CONFIG.DATE_FORMATS.DEFAULT;

  protected readonly site = computed(() => this.overview()?.site ?? null);

  protected readonly projectStatusLabel = computed(() => {
    const status = this.site()?.status;
    if (!status) {
      return '';
    }
    return String(
      getMappedValueFromArrayOfObjects(
        this.appConfigurationService.projectStatus(),
        status
      )
    );
  });

  protected readonly projectStatusCssKey = computed(() =>
    this.normalizeProjectStatusKey(this.site()?.status)
  );

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

  private normalizeProjectStatusKey(status: unknown): string {
    if (typeof status !== 'string') {
      return 'inactive';
    }
    const key = status
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, '');
    return key || 'inactive';
  }
}
