import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import {
  AppConfigurationService,
  ConfirmationDialogService,
} from '@shared/services';
import { VendorService } from '../../services/vendor.service';
import {
  IVendorChangeStatusFormDto,
  IVendorChangeStatusResponseDto,
  IVendorGetBaseResponseDto,
} from '../../types/vendor.dto';
import { EVendorStatus } from '../../types/vendor.enum';
import { FORM_VALIDATION_MESSAGES, ICONS } from '@shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-change-status-vendor',
  imports: [NgClass],
  templateUrl: './change-status-vendor.component.html',
  styleUrl: './change-status-vendor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeStatusVendorComponent extends FormBase implements OnInit {
  private readonly vendorService = inject(VendorService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly selectedRecord =
    input.required<IVendorGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  protected readonly ALL_VENDOR_STATUS = EVendorStatus;
  protected readonly ICONS = ICONS;

  protected readonly currentStatus = computed(() => {
    const record = this.selectedRecord();
    return record?.[0].isActive
      ? this.ALL_VENDOR_STATUS.ACTIVE
      : this.ALL_VENDOR_STATUS.ARCHIVED;
  });

  protected readonly newStatus = computed(() => {
    const current = this.currentStatus();
    return current === this.ALL_VENDOR_STATUS.ACTIVE
      ? this.ALL_VENDOR_STATUS.ARCHIVED
      : this.ALL_VENDOR_STATUS.ACTIVE;
  });

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to change status of vendor but was not provided'
      );
      return;
    }
  }

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    const { id: vendorId } = this.selectedRecord()[0];

    const formData = this.prepareFormData();
    this.executeVendorChangeStatusAction(formData, vendorId);
  }

  private prepareFormData(): IVendorChangeStatusFormDto {
    return {
      vendorStatus: this.newStatus(),
    };
  }

  private executeVendorChangeStatusAction(
    formData: IVendorChangeStatusFormDto,
    vendorId: string
  ): void {
    const loadingMessage = {
      title: 'Changing Vendor Status',
      message:
        "We're updating the vendor status. This will just take a moment.",
    };
    this.loadingService.show(loadingMessage);

    this.vendorService
      .changeVendorStatus(formData, vendorId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (_response: IVendorChangeStatusResponseDto) => {
          this.notificationService.success(
            'Vendor status changed successfully'
          );

          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to change vendor status', error);
          this.notificationService.error('Failed to change vendor status');
        },
      });
  }

  protected getStatusLabel(status: string): string {
    return getMappedValueFromArrayOfObjects(
      this.appConfigurationService.contractorStatus(),
      status
    );
  }
}
