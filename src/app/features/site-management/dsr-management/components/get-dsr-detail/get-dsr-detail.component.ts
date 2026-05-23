import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DsrService } from '@features/site-management/dsr-management/services/dsr.service';
import {
  IDsrDetailGetFormDto,
  IDsrDetailGetResponseDto,
  IDsrGetBaseResponseDto,
} from '@features/site-management/dsr-management/types/dsr.dto';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import {
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEntityViewDetails,
} from '@shared/types';
import { finalize } from 'rxjs';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';
import { DocWorkspaceContextComponent } from '@features/site-management/doc-management/shared/components/doc-workspace-context/doc-workspace-context.component';

@Component({
  selector: 'app-get-dsr-detail',
  imports: [ViewDetailComponent, DocWorkspaceContextComponent],
  templateUrl: './get-dsr-detail.component.html',
  styleUrl: './get-dsr-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetDsrDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    dsr: IDsrGetBaseResponseDto;
  };
  private readonly dsrService = inject(DsrService);

  protected readonly _dsrDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  protected readonly ALL_DATA_TYPES = EDataType;

  override onDrawerShow(): void {
    this.loadDsrDetails();
  }

  private loadDsrDetails(): void {
    this.setDrawerLoading(true);
    const paramData = this.prepareParamData();

    this.dsrService
      .getDsrDetailById(paramData)
      .pipe(
        finalize(() => {
          this.setDrawerLoading(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IDsrDetailGetResponseDto) => {
          const mappedData = this.mapDetailData(response);
          this._dsrDetails.set(mappedData);
          this.logger.logUserAction('DSR details loaded successfully');
        },
        error: error => {
          this.logger.error('Failed to load DSR details', error);
        },
      });
  }

  private prepareParamData(): IDsrDetailGetFormDto {
    return {
      dsrId: this.drawerData.dsr.id,
    };
  }

  private mapDetailData(
    response: IDsrDetailGetResponseDto
  ): IDataViewDetailsWithEntity {
    const mappedDetails = response.map(record => {
      const { site } = record;

      const entryData: IDataViewDetails['entryData'] = [
        {
          label: 'Workspace overview',
          value: {
            companyName: site.company?.name,
            projectName: site.name,
            siteLocationSubtitle: `${site.city}, ${site.state}`,
          },
          customTemplateKey: 'docWorkspaceContextDetail',
          detailTemplateFullRow: true,
        },
        {
          label: 'Work Types',
          value: record.workTypes.join(', '),
        },
        {
          label: 'Work Description',
          value: record.workDescription,
        },
        {
          label: 'Remarks',
          value: record.remarks,
        },
        {
          label: 'Attachment(s)',
          value: record.fileKeys,
          type: EDataType.ATTACHMENTS,
        },
      ];

      return {
        status: {
          entryType: record.dsrEntryType,
        },
        entryData,
        createdBy: {
          user: record.createdBy,
          date: record.createdAt,
        },
        updatedBy: {
          user: record.updatedBy,
          date: record.updatedAt,
        },
      };
    });

    return {
      details: mappedDetails,
      entity: this.getEmployeeDetails(),
    };
  }

  protected getEmployeeDetails(): IEntityViewDetails {
    const { createdByUser } = this.drawerData.dsr;
    return {
      name: `${createdByUser.firstName} ${createdByUser.lastName}`,
      subtitle: createdByUser.employeeId ?? 'N/A',
    };
  }
}
