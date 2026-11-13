import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBase } from '@shared/base/form.base';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import {
  AttachmentsService,
  ConfirmationDialogService,
} from '@shared/services';
import {
  IDialogActionHandler,
  IFinancialFileUploadResponseDto,
} from '@shared/types';
import { finalize, defer, mergeMap, of } from 'rxjs';
import { buildAddGstPaymentReleaseFormConfig } from '../../config/form/add-gst-payment-release.config';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { GstService } from '../../services/gst.service';
import {
  IAddGstPaymentReleaseFormDto,
  IAddGstPaymentReleaseResponseDto,
  IAddGstPaymentReleaseUIFormDto,
  IGstEntryGetBaseResponseDto,
} from '../../types/gst.dto';

@Component({
  selector: 'app-add-gst-payment-release',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './add-gst-payment-release.component.html',
  styleUrl: './add-gst-payment-release.component.scss',
})
export class AddGstPaymentReleaseComponent
  extends FormBase<IAddGstPaymentReleaseUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly gstService = inject(GstService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IGstEntryGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  /** Vendor release → GST book payment (no UTR / proof here). Contractor → GST bank transfer. */
  protected readonly isPurchase = computed(
    () => this.selectedRecord()?.[0]?.partyType === EDocContext.PURCHASE
  );

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record?.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to release GST payment but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IAddGstPaymentReleaseUIFormDto>(
      buildAddGstPaymentReleaseFormConfig(record[0].partyType),
      {
        destroyRef: this.destroyRef,
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    this.executeAddGstPaymentReleaseAction();
  }

  private prepareFormData(
    attachmentResponse?: IFinancialFileUploadResponseDto | null
  ): IAddGstPaymentReleaseFormDto {
    const record = this.selectedRecord();
    const formData = this.form.getData();
    const payload = { ...formData };
    delete (payload as Record<string, unknown>)['paymentAttachment'];

    return {
      ...payload,
      // A vendor release gets its UTR on the bank transfer, not here.
      utrNumber: this.isPurchase() ? null : payload.utrNumber,
      entryIds: record.map(row => row.id),
      fileKey: attachmentResponse?.fileKey ?? null,
      fileName: attachmentResponse?.fileName ?? null,
    };
  }

  private executeAddGstPaymentReleaseAction(): void {
    const file = this.isPurchase()
      ? undefined
      : (this.form.getFieldData('paymentAttachment') as File[] | undefined);

    this.loadingService.show({
      title: this.isPurchase()
        ? 'Booking GST release'
        : 'Recording GST receipt',
      message:
        "Please wait while we're recording the held GST settlement. This will just take a moment.",
    });
    this.form.disable();

    defer(() =>
      file?.length
        ? this.attachmentsService.uploadFinancialDocument(file[0])
        : of<IFinancialFileUploadResponseDto | null>(null)
    )
      .pipe(
        mergeMap((attachmentResponse: IFinancialFileUploadResponseDto | null) =>
          this.gstService.addGstPaymentRelease(
            this.prepareFormData(attachmentResponse)
          )
        ),
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAddGstPaymentReleaseResponseDto) => {
          const normalized =
            response.result?.length || response.errors?.length
              ? response
              : {
                  ...response,
                  result: [{ message: response.message }],
                };

          this.notificationService.bulkOperationFromResponse(normalized, {
            successItemsPath: 'result',
            errorItemsPath: 'errors',
            successMessageKey: 'message',
            errorMessageKey: 'error',
            fallbacks: {
              success: (count: number) =>
                count === 1
                  ? 'Held GST recorded successfully.'
                  : `Held GST recorded for ${count} entries.`,
              error: 'Failed to settle held GST.',
              empty: 'Failed to settle held GST.',
            },
          });

          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to release GST payment', error);
          this.notificationService.error(
            'Could not record the held GST settlement. Please try again.'
          );
        },
      });
  }
}
