import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, switchMap } from 'rxjs';

import { FormBase } from '@shared/base/form.base';
import {
  IDialogActionHandler,
  IFinancialFileUploadResponseDto,
} from '@shared/types';
import {
  AttachmentsService,
  ConfirmationDialogService,
} from '@shared/services';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';

import { UPLOAD_JMC_SIGNED_COPY_FORM_CONFIG } from '../../config';
import { JmcService } from '../../services/jmc.service';
import {
  IJmcGetBaseResponseDto,
  IUploadJmcSignedCopyFormDto,
  IUploadJmcSignedCopyResponseDto,
  IUploadJmcSignedCopyUIFormDto,
} from '../../types/jmc.dto';

@Component({
  selector: 'app-upload-jmc-signed-copy',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './upload-jmc-signed-copy.component.html',
  styleUrl: './upload-jmc-signed-copy.component.scss',
})
export class UploadJmcSignedCopyComponent
  extends FormBase<IUploadJmcSignedCopyUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly jmcService = inject(JmcService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IJmcGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord()?.[0];
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to upload signed copy but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IUploadJmcSignedCopyUIFormDto>(
      UPLOAD_JMC_SIGNED_COPY_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const jmcId = this.selectedRecord()[0]?.id;
    if (!jmcId) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      return;
    }

    this.executeUploadSignedCopyAction(jmcId);
  }

  private executeUploadSignedCopyAction(jmcId: string): void {
    const file = this.form.getFieldData('signedCopyAttachment');

    this.loadingService.show({
      title: 'Uploading signed copy',
      message:
        'Please wait while we upload the signed copy. This will just take a moment.',
    });
    this.form.disable();

    this.attachmentsService
      .uploadFinancialDocument(file[0])
      .pipe(
        switchMap((attachmentResponse: IFinancialFileUploadResponseDto) =>
          this.jmcService.uploadJmcSignedCopy(
            jmcId,
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
        next: (response: IUploadJmcSignedCopyResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to upload JMC signed copy', error);
          this.notificationService.error(
            'Could not upload the signed copy. Please try again.'
          );
        },
      });
  }

  private prepareFormData(
    attachmentResponse: IFinancialFileUploadResponseDto
  ): IUploadJmcSignedCopyFormDto {
    return {
      fileKey: attachmentResponse.fileKey,
      fileName: attachmentResponse.fileName,
    };
  }
}
