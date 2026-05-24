import {
  ChangeDetectionStrategy,
  Component,
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
import { defer, finalize, mergeMap, of } from 'rxjs';
import { VERIFY_GST_ENTRY_FORM_CONFIG } from '../../config';
import { GstService } from '../../services/gst.service';
import {
  IGstEntryGetBaseResponseDto,
  IVerifyGstEntryFormDto,
  IVerifyGstEntryResponseDto,
  IVerifyGstEntryUIFormDto,
} from '../../types/gst.dto';

@Component({
  selector: 'app-verify-gst-entry',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './verify-gst-entry.component.html',
  styleUrl: './verify-gst-entry.component.scss',
})
export class VerifyGstEntryComponent
  extends FormBase<IVerifyGstEntryUIFormDto>
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

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to verify GST entry but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IVerifyGstEntryUIFormDto>(
      VERIFY_GST_ENTRY_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    this.executeVerifyAction();
  }

  private executeVerifyAction(): void {
    const gstEntryId = this.selectedRecord()[0].id;
    const file = this.form.getFieldData('verificationAttachment') as
      | File[]
      | undefined;

    this.loadingService.show({
      title: 'Approving GST entry',
      message:
        "We're marking this entry as verified. This will just take a moment.",
    });
    this.form.disable();

    defer(() =>
      file?.length
        ? this.attachmentsService.uploadFinancialDocument(file[0])
        : of<IFinancialFileUploadResponseDto | null>(null)
    )
      .pipe(
        mergeMap((attachmentResponse: IFinancialFileUploadResponseDto | null) =>
          this.gstService.verifyGstEntry(
            gstEntryId,
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
        next: (response: IVerifyGstEntryResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: (error: unknown) => {
          this.logger.error('Failed to approve GST entry', error);
          this.notificationService.error('Failed to approve GST entry.');
        },
      });
  }

  private prepareFormData(
    attachmentResponse?: IFinancialFileUploadResponseDto | null
  ): IVerifyGstEntryFormDto {
    const formData = this.form.getData();
    const record = { ...formData };
    delete (record as Record<string, unknown>)['verificationAttachment'];
    return {
      ...record,
      remarks: record.remarks ?? null,
      fileKey: attachmentResponse?.fileKey ?? null,
      fileName: attachmentResponse?.fileName ?? null,
    };
  }
}
