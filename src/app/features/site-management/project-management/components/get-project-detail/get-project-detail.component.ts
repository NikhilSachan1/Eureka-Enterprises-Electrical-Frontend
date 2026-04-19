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
import { AppConfigurationService, LoadingService } from '@shared/services';
import {
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEntityViewDetails,
} from '@shared/types';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
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
  private readonly loadingService = inject(LoadingService);
  protected readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly _projectDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  override onDrawerShow(): void {
    this.loadProjectDetails();
  }

  private loadProjectDetails(): void {
    this.loadingService.show({
      title: 'Loading Project Details',
      message:
        "We're loading the project details. This will just take a moment.",
    });

    const paramData = this.prepareParamData();

    this.projectService
      .getProjectDetailById(paramData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
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
          label: 'Estimated Budget',
          type: EDataType.CURRENCY,
          format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
          value: record.estimatedBudget,
        },
        {
          label: 'Expected Vehicle Daily (Km)',
          value: record.expectedVehicleDailyKm,
        },
        {
          label: 'Work Types',
          value: record.workTypes.join(', '),
        },
        {
          label: 'City',
          value: getMappedValueFromArrayOfObjects(
            this.appConfigurationService.cities(),
            record.city
          ),
        },
        {
          label: 'State',
          value: getMappedValueFromArrayOfObjects(
            this.appConfigurationService.states(),
            record.state
          ),
        },
        {
          label: 'Pincode',
          value: record.pincode,
        },
        {
          label: 'Full Address',
          value: record.fullAddress,
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
    const { name, state, city } = this.drawerData.project;
    const cityName = getMappedValueFromArrayOfObjects(
      this.appConfigurationService.cities(),
      city
    );
    const stateName = getMappedValueFromArrayOfObjects(
      this.appConfigurationService.states(),
      state
    );
    return {
      name,
      subtitle: `${cityName} - ${stateName}`,
    };
  }
}
