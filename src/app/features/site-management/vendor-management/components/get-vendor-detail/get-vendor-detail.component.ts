import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { DrawerDetailBase } from '@shared/base/drawer-detail.base';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import {
  IVendorDetailGetFormDto,
  IVendorDetailGetResponseDto,
  IVendorGetBaseResponseDto,
} from '../../types/vendor.dto';
import { VendorService } from '../../services/vendor.service';
import { AppConfigurationService } from '@shared/services';
import {
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEntityViewDetails,
} from '@shared/types';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  formatFullAddress,
  getMappedValueFromArrayOfObjects,
} from '@shared/utility';
import { EVendorStatus } from '../../types/vendor.enum';
import { ViewDetailComponent } from '@shared/components/view-detail/view-detail.component';

@Component({
  selector: 'app-get-vendor-detail',
  imports: [ViewDetailComponent],
  templateUrl: './get-vendor-detail.component.html',
  styleUrl: './get-vendor-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetVendorDetailComponent extends DrawerDetailBase {
  protected readonly drawerData = inject(DRAWER_DATA) as {
    vendor: IVendorGetBaseResponseDto;
  };
  private readonly vendorService = inject(VendorService);
  protected readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly _vendorDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  override onDrawerShow(): void {
    this.loadVendorDetails();
  }

  private loadVendorDetails(): void {
    this.setDrawerLoading(true);
    const paramData = this.prepareParamData();

    this.vendorService
      .getVendorDetailById(paramData)
      .pipe(
        finalize(() => {
          this.setDrawerLoading(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IVendorDetailGetResponseDto) => {
          const mappedData = this.mapDetailData(response);
          this._vendorDetails.set(mappedData);
          this.logger.logUserAction('Vendor details loaded successfully');
        },
        error: error => {
          console.error('error', error);
        },
      });
  }

  private prepareParamData(): IVendorDetailGetFormDto {
    return {
      vendorId: this.drawerData.vendor.id,
    };
  }

  private mapDetailData(
    response: IVendorDetailGetResponseDto
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
          label: 'Full Address',
          value: formatFullAddress(
            record,
            this.appConfigurationService.states(),
            this.appConfigurationService.cities()
          ),
        },
        {
          label: 'Bank Name',
          value: record.bankName
            ? getMappedValueFromArrayOfObjects(
                this.appConfigurationService.bankNames(),
                record.bankName
              )
            : null,
        },
        {
          label: 'Account Holder Name',
          value: record.accountHolderName,
        },
        {
          label: 'Account Number',
          value: record.accountNumber,
        },
        {
          label: 'IFSC Code',
          value: record.ifscCode,
        },
      ];

      return {
        status: {
          approvalStatus: record.isActive
            ? EVendorStatus.ACTIVE
            : EVendorStatus.ARCHIVED,
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
      entity: this.getVendorDetails(),
    };
  }

  protected getVendorDetails(): IEntityViewDetails {
    const { name } = this.drawerData.vendor;
    return {
      name,
    };
  }
}
