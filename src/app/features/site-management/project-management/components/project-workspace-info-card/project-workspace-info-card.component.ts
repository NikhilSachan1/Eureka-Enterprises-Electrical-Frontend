import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { APP_CONFIG } from '@core/config';
import { LoggerService } from '@core/services';
import { ChipComponent } from '@shared/components/chip/chip.component';
import { SectionLoaderComponent } from '@shared/components/section-loader/section-loader.component';
import { ICONS } from '@shared/constants/icon.constants';
import { ProjectService } from '../../services/project.service';
import { ProjectWorkspaceContextService } from '../../services/project-workspace-context.service';
import { IProjectDetailGetResponseDto } from '../../types/project.dto';

@Component({
  selector: 'app-project-workspace-info-card',
  imports: [DatePipe, ChipComponent, SectionLoaderComponent],
  templateUrl: './project-workspace-info-card.component.html',
  styleUrl: './project-workspace-info-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectWorkspaceInfoCardComponent {
  private readonly projectService = inject(ProjectService);
  private readonly workspaceContext = inject(ProjectWorkspaceContextService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly projectDetail =
    signal<IProjectDetailGetResponseDto | null>(null);
  protected readonly isLoading = signal(false);

  readonly dateFormat = APP_CONFIG.DATE_FORMATS.DEFAULT;
  protected readonly icons = ICONS;

  protected readonly contractorNames = computed(() => {
    const list = this.projectDetail()?.siteContractors;
    if (!list?.length) {
      return [];
    }
    return list.map(item => item.contractor.name);
  });

  protected readonly vendorNames = computed(() => {
    const list = this.projectDetail()?.siteVendors;
    if (!list?.length) {
      return [];
    }
    return list.map(item => item.vendor.name);
  });

  constructor() {
    effect(() => {
      const projectId = this.workspaceContext.selectedProjectId();

      if (!projectId) {
        this.isLoading.set(false);
        this.projectDetail.set(null);
        return;
      }

      this.loadProjectDetail(projectId);
    });
  }

  private loadProjectDetail(projectId: string): void {
    this.isLoading.set(true);
    this.projectDetail.set(null);

    this.projectService
      .getProjectDetailById({ projectId })
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (detail: IProjectDetailGetResponseDto) => {
          this.projectDetail.set(detail);
        },
        error: error => {
          this.projectDetail.set(null);
          this.logger.error('Failed to load project detail', error);
        },
      });
  }
}
