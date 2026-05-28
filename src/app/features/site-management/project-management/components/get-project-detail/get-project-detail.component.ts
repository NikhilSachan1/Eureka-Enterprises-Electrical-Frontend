import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import {
  IProjectDetailGetFormDto,
  IProjectDetailGetResponseDto,
  IProjectGetBaseResponseDto,
} from '../../types/project.dto';
import { ProjectService } from '../../services/project.service';
import { AppConfigurationService } from '@shared/services';
import {
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEntityViewDetails,
} from '@shared/types';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { formatLocation } from '@shared/utility';
import { APP_CONFIG } from '@core/config';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';

@Component({
  selector: 'app-get-project-detail',
  imports: [ViewDetailComponent],
  templateUrl: './get-project-detail.component.html',
  styleUrl: './get-project-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetProjectDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    project: IProjectGetBaseResponseDto;
  };
  private readonly projectService = inject(ProjectService);
  protected readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly _projectDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  override onDrawerShow(): void {
    this.loadProjectDetails();
  }

  private loadProjectDetails(): void {
    this.setDrawerLoading(true);
    const paramData = this.prepareParamData();

    this.projectService
      .getProjectDetailById(paramData)
      .pipe(
        finalize(() => {
          this.setDrawerLoading(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IProjectDetailGetResponseDto) => {
          const mappedData = this.mapDetailData(response);
          this._projectDetails.set(mappedData);
          this.logger.logUserAction('Project details loaded successfully');
        },
        error: error => {
          console.error('error', error);
        },
      });
  }

  private prepareParamData(): IProjectDetailGetFormDto {
    return {
      projectId: this.drawerData.project.id,
    };
  }

  private mapDetailData(
    response: IProjectDetailGetResponseDto
  ): IDataViewDetailsWithEntity {
    const mappedDetails = [response].map(record => {
      const entryData: IDataViewDetails['entryData'] = [
        {
          label: 'Time Line',
          value: [record.startDate, record.endDate],
          type: EDataType.RANGE,
          dataType: EDataType.DATE,
          format: APP_CONFIG.DATE_FORMATS.DEFAULT,
        },
        {
          label: 'Manager Name',
          value: record.managerName,
        },
        {
          label: 'Manager Contact',
          value: record.managerContact,
        },
        {
          label: 'Base Distance (Km)',
          value: record.baseDistanceKm,
        },
        {
          label: 'Work Types',
          value: record.workTypes.join(', '),
        },
        {
          label: 'Address',
          value: formatLocation(
            record,
            this.appConfigurationService.states(),
            this.appConfigurationService.cities()
          ),
        },
      ];

      return {
        status: {
          approvalStatus: record.status,
        },
        entryData,
        createdBy: {
          user: record.createdByUser,
          date: record.createdAt,
        },
        updatedBy: {
          user: record.updatedByUser,
          date: record.updatedAt,
        },
      };
    });

    return {
      details: mappedDetails,
      entity: this.getProjectDetails(),
    };
  }

  protected getProjectDetails(): IEntityViewDetails {
    const { name } = this.drawerData.project;
    return {
      name,
      subtitle: formatLocation(
        this.drawerData.project,
        this.appConfigurationService.states(),
        this.appConfigurationService.cities()
      ),
    };
  }
}
