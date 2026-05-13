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
  IInputFieldsConfig,
} from '@shared/types';
import {
  AttachmentsService,
  ConfirmationDialogService,
} from '@shared/services';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';

import { EDIT_REPORT_FORM_CONFIG } from '../../config';
import { ReportService } from '../../services/report.service';
import {
  IEditReportFormDto,
  IEditReportResponseDto,
  IEditReportUIFormDto,
  IReportGetBaseResponseDto,
} from '../../types/report.dto';

@Component({
  selector: 'app-edit-report',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './edit-report.component.html',
  styleUrl: './edit-report.component.scss',
})
export class EditReportComponent
  extends FormBase<IEditReportUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly reportService = inject(ReportService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IReportGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  ngOnInit(): void {
    const rows = this.selectedRecord();
    const record = rows?.[0];
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error('Edit report: selected record was not provided');
      return;
    }

    this.form = this.formService.createForm<IEditReportUIFormDto>(
      EDIT_REPORT_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: {
          projectName: record.siteId,
          jmcNumber: record.jmc.jmcNumber,
          reportNumber: record.reportNumber,
          reportDate: new Date(record.reportDate),
          reportAttachment: [],
          remarks: record.remarks ?? null,
        },
      }
    );

    this.seedJmcOption(record.jmc.jmcNumber);

    this.loadPrefillAttachmentFromKey(record.fileKey);
  }

  private seedJmcOption(jmcNumber: string): void {
    const base = this.form.fieldConfigs.jmcNumber;
    this.form.fieldConfigs.jmcNumber = {
      ...base,
      selectConfig: {
        ...base.selectConfig,
        optionsDropdown: [
          {
            label: jmcNumber,
            value: jmcNumber,
          },
        ],
      },
    } as IInputFieldsConfig;
  }

  private loadPrefillAttachmentFromKey(fileKey: string): void {
    this.loadingService.show({
      title: 'Loading report data',
      message: 'Fetching the report data. Please wait…',
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
          this.form.patch({ reportAttachment: files });
        },
        error: error => {
          this.logger.error('Failed to prefetch report attachment', error);
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
    this.executeEditReportAction(record.id);
  }

  private executeEditReportAction(reportId: string): void {
    const file = this.form.getFieldData('reportAttachment');

    this.loadingService.show({
      title: 'Updating report',
      message:
        'Please wait while we update the report. This will just take a moment.',
    });
    this.form.disable();

    this.attachmentsService
      .uploadFinancialDocument(file[0])
      .pipe(
        switchMap(attachmentResponse => {
          const formData = this.prepareFormData(attachmentResponse);
          return this.reportService.editReport(formData, reportId);
        }),
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IEditReportResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to edit report', error);
          this.notificationService.error(
            'Could not update the report. Please try again.'
          );
        },
      });
  }

  private prepareFormData(
    attachmentResponse: IFinancialFileUploadResponseDto
  ): IEditReportFormDto {
    const formData = this.form.getData();
    const record = { ...formData };
    delete (record as Record<string, unknown>)['reportAttachment'];
    delete (record as Record<string, unknown>)['jmcId'];
    delete (record as Record<string, unknown>)['projectName'];
    return {
      ...record,
      reportFileKey: attachmentResponse.fileKey,
      reportFileName: attachmentResponse.fileName,
    } as IEditReportFormDto;
  }
}
