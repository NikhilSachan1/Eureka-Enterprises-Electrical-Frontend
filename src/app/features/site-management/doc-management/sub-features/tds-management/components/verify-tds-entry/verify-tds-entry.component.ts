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
import { finalize, switchMap } from 'rxjs';
import { VERIFY_TDS_ENTRY_FORM_CONFIG } from '../../config';
import { TdsService } from '../../services/tds.service';
import {
  ITdsEntryGetBaseResponseDto,
  IVerifyTdsEntryFormDto,
  IVerifyTdsEntryResponseDto,
  IVerifyTdsEntryUIFormDto,
} from '../../types/tds.dto';

@Component({
  selector: 'app-verify-tds-entry',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './verify-tds-entry.component.html',
  styleUrl: './verify-tds-entry.component.scss',
})
export class VerifyTdsEntryComponent
  extends FormBase<IVerifyTdsEntryUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly tdsService = inject(TdsService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<ITdsEntryGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to verify TDS entry but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IVerifyTdsEntryUIFormDto>(
      VERIFY_TDS_ENTRY_FORM_CONFIG,
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
    const tdsEntryId = this.selectedRecord()[0].id;
    const file = this.form.getFieldData('verificationAttachment');

    this.loadingService.show({
      title: 'Approving TDS entry',
      message:
        "We're marking this entry as verified. This will just take a moment.",
    });
    this.form.disable();

    this.attachmentsService
      .uploadFinancialDocument(file[0])
      .pipe(
        switchMap(attachmentResponse => {
          const formData = this.prepareFormData(attachmentResponse);
          return this.tdsService.verifyTdsEntry(tdsEntryId, formData);
        }),
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IVerifyTdsEntryResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to approve TDS entry', error);
          this.notificationService.error('Failed to approve TDS entry.');
        },
      });
  }

  private prepareFormData(
    attachmentResponse: IFinancialFileUploadResponseDto
  ): IVerifyTdsEntryFormDto {
    const formData = this.form.getData();
    const record = { ...formData };
    delete (record as Record<string, unknown>)['verificationAttachment'];
    return {
      ...record,
      remarks: record.remarks ?? null,
      fileKey: attachmentResponse.fileKey,
      fileName: attachmentResponse.fileName,
    };
  }
}
