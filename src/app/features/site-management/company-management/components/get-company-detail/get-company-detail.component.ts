import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import {
  ICompanyDetailGetFormDto,
  ICompanyDetailGetResponseDto,
  ICompanyGetBaseResponseDto,
} from '../../types/company.dto';
import { CompanyService } from '../../services/company.service';
import { AppConfigurationService, LoadingService } from '@shared/services';
import {
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEntityViewDetails,
} from '@shared/types';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';
import { ECompanyStatus } from '../../types/company.enum';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';

@Component({
  selector: 'app-get-company-detail',
  imports: [ViewDetailComponent],
  templateUrl: './get-company-detail.component.html',
  styleUrl: './get-company-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetCompanyDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    company: ICompanyGetBaseResponseDto;
  };
  private readonly companyService = inject(CompanyService);
  private readonly loadingService = inject(LoadingService);
  protected readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly _companyDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  override onDrawerShow(): void {
    this.loadCompanyDetails();
  }

  private loadCompanyDetails(): void {
    this.loadingService.show({
      title: 'Loading Company Details',
      message: 'Please wait while we load the company details...',
    });

    const paramData = this.prepareParamData();

    this.companyService
      .getCompanyDetailById(paramData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ICompanyDetailGetResponseDto) => {
          const mappedData = this.mapDetailData(response);
          this._companyDetails.set(mappedData);
        },
        error: error => {
          console.error('error', error);
        },
      });
  }

  private prepareParamData(): ICompanyDetailGetFormDto {
    return {
      companyId: this.drawerData.company.id,
    };
  }

  private mapDetailData(
    response: ICompanyDetailGetResponseDto
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
            ? ECompanyStatus.ACTIVE
            : ECompanyStatus.ARCHIVED,
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
      entity: this.getCompanyDetails(),
    };
  }

  protected getCompanyDetails(): IEntityViewDetails {
    const { name, parentCompany } = this.drawerData.company;
    const parentCompanyName = parentCompany?.name;
    return {
      name,
      subtitle: parentCompanyName,
    };
  }
}
