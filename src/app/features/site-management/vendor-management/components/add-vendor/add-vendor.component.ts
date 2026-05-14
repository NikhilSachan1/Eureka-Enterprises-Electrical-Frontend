import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  Signal,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import { IVendorAddFormDto } from '../../types/vendor.dto';
import { VendorService } from '../../services/vendor.service';
import {
  AppConfigurationService,
  RouterNavigationService,
} from '@shared/services';
import { ADD_VENDOR_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { IPageHeaderConfig } from '@shared/types';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { NgClass } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { EVendorType } from '../../types/vendor.enum';

@Component({
  selector: 'app-add-vendor',
  imports: [
    ButtonComponent,
    InputFieldComponent,
    NgClass,
    PageHeaderComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './add-vendor.component.html',
  styleUrl: './add-vendor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddVendorComponent
  extends FormBase<IVendorAddFormDto>
  implements OnInit
{
  private readonly vendorService = inject(VendorService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  private vendorTypeTracked!: Signal<string | null | undefined>;

  protected readonly showVendorGstField = computed(
    () => this.vendorTypeTracked() !== EVendorType.FREELANCER
  );

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  ngOnInit(): void {
    this.form = this.formService.createForm<IVendorAddFormDto>(
      ADD_VENDOR_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    this.vendorTypeTracked = this.formService.trackFieldChanges(
      this.form.formGroup,
      'vendorType',
      this.destroyRef
    );
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeAddVendor(formData);
  }

  private prepareFormData(): IVendorAddFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeAddVendor(formData: IVendorAddFormDto): void {
    this.loadingService.show({
      title: 'Add Vendor',
      message: "We're adding vendor. This will just take a moment.",
    });
    this.form.disable();

    this.vendorService
      .addVendor(formData)
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
          this.notificationService.success('Vendor added successfully');
          this.appConfigurationService.refreshVendorDropdowns();
          const routeSegments = [
            ROUTE_BASE_PATHS.SITE.BASE,
            ROUTE_BASE_PATHS.SITE.VENDOR,
            ROUTES.SITE.VENDOR.LIST,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to add vendor');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm();
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Add Vendor',
      subtitle: 'Add a new vendor',
    };
  }
}
