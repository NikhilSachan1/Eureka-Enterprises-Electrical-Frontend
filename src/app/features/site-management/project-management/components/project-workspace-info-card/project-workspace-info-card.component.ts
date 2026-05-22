import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { APP_CONFIG } from '@core/config';
import { ChipComponent } from '@shared/components/chip/chip.component';
import { SectionLoaderComponent } from '@shared/components/section-loader/section-loader.component';
import { ICONS } from '@shared/constants/icon.constants';
import { AppConfigurationService } from '@shared/services';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { ProjectWorkspaceContextService } from '../../services/project-workspace-context.service';

@Component({
  selector: 'app-project-workspace-info-card',
  imports: [DatePipe, ChipComponent, SectionLoaderComponent],
  templateUrl: './project-workspace-info-card.component.html',
  styleUrl: './project-workspace-info-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectWorkspaceInfoCardComponent {
  private readonly workspaceContext = inject(ProjectWorkspaceContextService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly projectOverview = this.workspaceContext.projectOverview;
  protected readonly isLoading = this.workspaceContext.projectOverviewLoading;
  protected readonly site = computed(
    () => this.projectOverview()?.site ?? null
  );

  readonly dateFormat = APP_CONFIG.DATE_FORMATS.DEFAULT;
  protected readonly icons = ICONS;

  protected readonly contractorNames = computed(() => {
    const contractors = this.projectOverview()?.contractors ?? [];
    return contractors
      .map(contractor => contractor?.name?.trim() ?? '')
      .filter(name => name.length > 0);
  });

  protected readonly vendorNames = computed(() => {
    const vendors = this.projectOverview()?.vendors ?? [];
    return vendors
      .map(vendor => vendor?.name?.trim() ?? '')
      .filter(name => name.length > 0);
  });

  protected readonly workTypeLabels = computed(() => {
    const workTypes = this.site()?.workTypes ?? [];
    return workTypes.map(workType =>
      String(
        getMappedValueFromArrayOfObjects(
          this.appConfigurationService.projectWorkTypes(),
          workType
        )
      )
    );
  });
}
