import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DsrService } from '@features/site-management/project-management/services/dsr.service';
import {
  IDsrGetBaseResponseDto,
  IDsrVersionItemDto,
} from '@features/site-management/project-management/types/project.dto';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import { LoadingService } from '@shared/services';
import {
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEntityViewDetails,
} from '@shared/types';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-get-dsr-detail',
  imports: [ViewDetailComponent],
  templateUrl: './get-dsr-detail.component.html',
  styleUrl: './get-dsr-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetDsrDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    dsr: IDsrGetBaseResponseDto;
  };
  private readonly dsrService = inject(DsrService);
  private readonly loadingService = inject(LoadingService);

  protected readonly _dsrDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  protected readonly ALL_DATA_TYPES = EDataType;

  override onDrawerShow(): void {
    this.loadDsrVersions();
  }

  private loadDsrVersions(): void {
    this.loadingService.show({
      title: 'Loading DSR Versions',
      message: 'Please wait while we load the DSR version history...',
    });

    const dsrId = this.drawerData.dsr.id;

    this.dsrService
      .getDsrVersions(dsrId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: versions => {
          const mappedData = this.mapVersionsToDetails(versions);
          this._dsrDetails.set(mappedData);
        },
        error: error => {
          console.error('error', error);
        },
      });
  }

  private mapVersionsToDetails(
    versions: IDsrVersionItemDto[]
  ): IDataViewDetailsWithEntity {
    if (versions.length === 0) {
      return {
        details: [],
        entity: this.getEntityFromDsr(),
      };
    }

    const mappedDetails = versions.map(record => {
      const fileKeys =
        record.files?.map(f => f.fileKey).filter((k): k is string => !!k) ?? [];
      const workTypesLabel =
        record.workTypes && record.workTypes.length > 0
          ? record.workTypes.join(', ')
          : null;

      const entryData: IDataViewDetails['entryData'] = [
        {
          label: 'Version',
          value: record.versionNumber,
        },
        {
          label: 'Work Types',
          value: workTypesLabel,
        },
        {
          label: 'Remarks',
          value: record.remarks ?? null,
        },
        {
          label: 'Attachment(s)',
          value: fileKeys,
          type: EDataType.ATTACHMENTS,
        },
      ];

      const createdByUser = record.createdBy
        ? {
            id: record.createdBy.id,
            firstName: record.createdBy.firstName,
            lastName: record.createdBy.lastName,
          }
        : null;
      const updatedByUser = record.updatedBy
        ? {
            id: record.updatedBy.id,
            firstName: record.updatedBy.firstName,
            lastName: record.updatedBy.lastName,
          }
        : null;

      return {
        entryData,
        createdBy: {
          user: createdByUser,
          date: record.createdAt,
          notes: null,
        },
        updatedBy: {
          user: updatedByUser,
          date: record.updatedAt,
          notes: record.editReason ?? null,
        },
      };
    });

    const firstVersion = versions[0];
    const entity: IEntityViewDetails = firstVersion?.createdBy
      ? {
          name: `${firstVersion.createdBy.firstName} ${firstVersion.createdBy.lastName}`,
          subtitle: `Version ${firstVersion.versionNumber}`,
        }
      : this.getEntityFromDsr();

    return {
      details: mappedDetails,
      entity,
    };
  }

  private getEntityFromDsr(): IEntityViewDetails {
    const user = this.drawerData.dsr?.createdByUser;
    if (user) {
      return {
        name: `${user.firstName} ${user.lastName}`,
        subtitle: (user as { employeeId?: string }).employeeId ?? 'N/A',
      };
    }
    return {
      name: 'N/A',
      subtitle: 'N/A',
    };
  }
}
