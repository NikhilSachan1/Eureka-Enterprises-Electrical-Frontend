import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import {
  IContractorDetailGetFormDto,
  IContractorDetailGetResponseDto,
  IContractorGetBaseResponseDto,
} from '../../types/contractor.dto';
import { ContractorService } from '../../services/contractor.service';
import { AppConfigurationService, LoadingService } from '@shared/services';
import {
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEntityViewDetails,
} from '@shared/types';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { EContractorStatus } from '../../types/contractor.enum';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';

@Component({
  selector: 'app-get-contractor-detail',
  imports: [ViewDetailComponent],
  templateUrl: './get-contractor-detail.component.html',
  styleUrl: './get-contractor-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetContractorDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    contractor: IContractorGetBaseResponseDto;
  };
  private readonly contractorService = inject(ContractorService);
  private readonly loadingService = inject(LoadingService);
  protected readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly _contractorDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  override onDrawerShow(): void {
    this.loadContractorDetails();
  }

  private loadContractorDetails(): void {
    this.loadingService.show({
      title: 'Loading Contractor Details',
      message: 'Please wait while we load the contractor details...',
    });

    const paramData = this.prepareParamData();

    this.contractorService
      .getContractorDetailById(paramData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IContractorDetailGetResponseDto) => {
          const mappedData = this.mapDetailData(response);
          this._contractorDetails.set(mappedData);
          this.logger.logUserAction('Contractor details loaded successfully');
        },
        error: error => {
          console.error('error', error);
        },
      });
  }

  private prepareParamData(): IContractorDetailGetFormDto {
    return {
      contractorId: this.drawerData.contractor.id,
    };
  }

  private mapDetailData(
    response: IContractorDetailGetResponseDto
  ): IDataViewDetailsWithEntity {
    const mappedDetails = [response].map(record => {
      const entryData: IDataViewDetails['entryData'] = [
        {
          label: 'Contact Number',
          value: record.contactNumber,
        },
        {
          label: 'Email',
          value: record.email,
        },
        {
          label: 'GST Number',
          value: record.gstNumber,
        },
        {
          label: 'Block Number',
          value: record.blockNumber,
        },
        {
          label: 'Street Name',
          value: record.streetName,
        },
        {
          label: 'Landmark',
          value: record.landmark,
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
          approvalStatus: record.isActive
            ? EContractorStatus.ACTIVE
            : EContractorStatus.ARCHIVED,
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
      entity: this.getContractorDetails(),
    };
  }

  protected getContractorDetails(): IEntityViewDetails {
    const { name } = this.drawerData.contractor;
    return {
      name,
    };
  }
}
