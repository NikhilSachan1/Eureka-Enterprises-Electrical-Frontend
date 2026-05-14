import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  Signal,
  signal,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import { VendorService } from '../../services/vendor.service';
import {
  AppConfigurationService,
  RouterNavigationService,
} from '@shared/services';
import { ActivatedRoute } from '@angular/router';
import {
  IVendorDetailGetResponseDto,
  IVendorEditFormDto,
} from '../../types/vendor.dto';
import { EDIT_VENDOR_FORM_CONFIG } from '../../config';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IPageHeaderConfig } from '@shared/types';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { NgClass } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EVendorType } from '../../types/vendor.enum';

@Component({
  selector: 'app-edit-vendor',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    NgClass,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-vendor.component.html',
  styleUrl: './edit-vendor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditVendorComponent
  extends FormBase<IVendorEditFormDto>
  implements OnInit
{
  private readonly vendorService = inject(VendorService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  private vendorTypeTracked!: Signal<string | null | undefined>;

  protected readonly showVendorGstField = computed(
    () => this.vendorTypeTracked() !== EVendorType.FREELANCER
  );

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly initialVendorData = signal<IVendorEditFormDto | null>(
    null
  );

  ngOnInit(): void {
    this.loadVendorDataFromRoute();

    this.form = this.formService.createForm<IVendorEditFormDto>(
      EDIT_VENDOR_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: this.initialVendorData(),
      }
    );

    this.vendorTypeTracked = this.formService.trackFieldChanges(
      this.form.formGroup,
      'vendorType',
      this.destroyRef
    );
  }

  private loadVendorDataFromRoute(): void {
    const vendorDetailFromResolver = this.activatedRoute.snapshot.data[
      'vendorDetail'
    ] as IVendorDetailGetResponseDto;

    if (!vendorDetailFromResolver) {
      this.logger.logUserAction('No vendor data found in route');
      const routeSegments = [
        ROUTE_BASE_PATHS.SITE.BASE,
        ROUTE_BASE_PATHS.SITE.VENDOR,
        ROUTES.SITE.VENDOR.LIST,
      ];
      void this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    const prefilledVendorData = this.preparePrefilledFormData(
      vendorDetailFromResolver
    );
    this.initialVendorData.set(prefilledVendorData);
  }

  private preparePrefilledFormData(
    vendorDetailFromResolver: IVendorDetailGetResponseDto
  ): IVendorEditFormDto {
    const {
      name,
      contactNumber,
      email,
      gstNumber,
      blockNumber,
      streetName,
      landmark,
      state,
      city,
      pincode,
      vendorType,
    } = vendorDetailFromResolver;

    return {
      vendorType: vendorType ?? '',
      vendorName: name,
      contactNumber: contactNumber ?? '',
      emailAddress: email,
      vendorGSTNumber: gstNumber,
      blockNumber,
      streetName,
      landmark,
      state,
      city,
      pincode: Number(pincode),
    };
  }

  protected override handleSubmit(): void {
    const vendorId = this.activatedRoute.snapshot.params['vendorId'] as string;
    if (!vendorId) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeEditVendor(formData, vendorId);
  }

  private prepareFormData(): IVendorEditFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeEditVendor(
    formData: IVendorEditFormDto,
    vendorId: string
  ): void {
    this.loadingService.show({
      title: 'Updating vendor',
      message: "We're updating vendor details. This will just take a moment.",
    });
    this.form.disable();

    this.vendorService
      .editVendor(formData, vendorId)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.form.enable();
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.notificationService.success('Vendor updated successfully');
          this.appConfigurationService.refreshVendorDropdowns();
          const routeSegments = [
            ROUTE_BASE_PATHS.SITE.BASE,
            ROUTE_BASE_PATHS.SITE.VENDOR,
            ROUTES.SITE.VENDOR.LIST,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to update vendor');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm(this.initialVendorData() ?? {});
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Edit Vendor',
      subtitle: 'Edit a vendor',
    };
  }
}
