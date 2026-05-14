import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import {
  IVendorDeleteFormDto,
  IVendorDeleteResponseDto,
  IVendorGetBaseResponseDto,
} from '../../types/vendor.dto';
import {
  AppConfigurationService,
  ConfirmationDialogService,
} from '@shared/services';
import { VendorService } from '../../services/vendor.service';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { EButtonActionType } from '@shared/types';

@Component({
  selector: 'app-delete-vendor',
  imports: [],
  templateUrl: './delete-vendor.component.html',
  styleUrl: './delete-vendor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteVendorComponent
  extends FormBase<IVendorDeleteFormDto>
  implements OnInit
{
  private readonly vendorService = inject(VendorService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly selectedRecord =
    input.required<IVendorGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to delete vendor but was not provided'
      );
      return;
    }
  }

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData(this.selectedRecord());
    this.executeVendorDeleteAction(formData);
  }

  private prepareFormData(
    record: IVendorGetBaseResponseDto[]
  ): IVendorDeleteFormDto {
    return {
      vendorIds: record.map((row: IVendorGetBaseResponseDto) => row.id),
    };
  }

  private executeVendorDeleteAction(formData: IVendorDeleteFormDto): void {
    const loadingMessage = {
      title: 'Deleting Vendor',
      message: "We're removing the vendor. This will just take a moment.",
    };
    this.loadingService.show(loadingMessage);

    this.vendorService
      .deleteVendor(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IVendorDeleteResponseDto) => {
          this.notificationService.bulkOperationFromApiResponse(
            response,
            'vendor',
            EButtonActionType.DELETE
          );

          this.appConfigurationService.refreshVendorDropdowns();

          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
      });
  }
}
