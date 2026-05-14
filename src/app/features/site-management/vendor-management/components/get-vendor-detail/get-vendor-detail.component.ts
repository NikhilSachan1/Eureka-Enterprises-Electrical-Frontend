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
import { AppConfigurationService, LoadingService } from '@shared/services';
import {
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEntityViewDetails,
} from '@shared/types';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
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
  private readonly loadingService = inject(LoadingService);
  protected readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly _vendorDetails = signal<
    IDataViewDetailsWithEntity | undefined
  >(undefined);

  override onDrawerShow(): void {
    this.loadVendorDetails();
  }

  private loadVendorDetails(): void {
    this.loadingService.show({
      title: 'Loading Vendor Details',
      message:
        "We're loading the vendor details. This will just take a moment.",
    });

    const paramData = this.prepareParamData();

    this.vendorService
      .getVendorDetailById(paramData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
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
