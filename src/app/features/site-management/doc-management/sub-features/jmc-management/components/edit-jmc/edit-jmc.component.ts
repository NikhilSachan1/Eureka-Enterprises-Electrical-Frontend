import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import {
  IEditJmcFormDto,
  IEditJmcResponseDto,
  IEditJmcUIFormDto,
  IJmcGetBaseResponseDto,
} from '../../types/jmc.dto';
import {
  IDialogActionHandler,
  IFinancialFileUploadResponseDto,
} from '@shared/types';
import { JmcService } from '../../services/jmc.service';
import {
  AttachmentsService,
  ConfirmationDialogService,
} from '@shared/services';
import { EDIT_JMC_FORM_CONFIG } from '../../config';
import { finalize, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';

@Component({
  selector: 'app-edit-jmc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './edit-jmc.component.html',
  styleUrl: './edit-jmc.component.scss',
})
export class EditJmcComponent
  extends FormBase<IEditJmcUIFormDto>
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
    const rows = this.selectedRecord();
    const record = rows?.[0];
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error('Edit JMC: selected record was not provided');
      return;
    }

    this.form = this.formService.createForm<IEditJmcUIFormDto>(
      EDIT_JMC_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: {
          poNumber: record.po.poNumber,
          jmcNumber: record.jmcNumber,
          jmcDate: new Date(record.jmcDate),
          jmcAttachment: [],
          remarks: record.remarks ?? null,
        },
      }
    );

    this.loadPrefillAttachmentFromKey(record.fileKey);
  }

  private loadPrefillAttachmentFromKey(fileKey: string): void {
    this.loadingService.show({
      title: 'Loading JMC data',
      message: 'Fetching the JMC data. Please wait…',
    });
    this.attachmentsService
      .loadFilesFromKeys([fileKey])
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: files => {
          this.form.patch({ jmcAttachment: files });
        },
        error: error => {
          this.logger.error('Failed to prefetch JMC attachment', error);
          this.notificationService.error(
            'Could not load the attachment. You can upload a new file.'
          );
        },
      });
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const record = this.selectedRecord()[0];
    if (!record?.id) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      return;
    }
    this.executeEditJmcAction(record.id);
  }

  private executeEditJmcAction(jmcId: string): void {
    const file = this.form.getFieldData('jmcAttachment');

    this.loadingService.show({
      title: 'Updating JMC',
      message:
        'Please wait while we update the JMC. This will just take a moment.',
    });
    this.form.disable();

    this.attachmentsService
      .uploadFinancialDocument(file[0])
      .pipe(
        switchMap(attachmentResponse => {
          const formData = this.prepareFormData(attachmentResponse);
          return this.jmcService.editJmc(formData, jmcId);
        }),
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IEditJmcResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to edit JMC', error);
          this.notificationService.error(
            'Could not update the JMC. Please try again.'
          );
        },
      });
  }

  private prepareFormData(
    attachmentResponse: IFinancialFileUploadResponseDto
  ): IEditJmcFormDto {
    const formData = this.form.getData();
    const record = { ...formData };
    delete (record as Record<string, unknown>)['jmcAttachment'];
    delete (record as Record<string, unknown>)['poNumber'];
    return {
      ...record,
      jmcFileKey: attachmentResponse.fileKey,
      jmcFileName: attachmentResponse.fileName,
    };
  }
}
