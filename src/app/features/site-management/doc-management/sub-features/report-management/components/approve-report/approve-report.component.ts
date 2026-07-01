import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import { IDialogActionHandler } from '@shared/types';
import { ReportService } from '../../services/report.service';
import { ConfirmationDialogService } from '@shared/services';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import {
  IApproveReportFormDto,
  IApproveReportResponseDto,
  IReportGetBaseResponseDto,
} from '../../types/report.dto';
import { APPROVE_ACTION_REPORT_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-approve-report',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './approve-report.component.html',
  styleUrl: './approve-report.component.scss',
})
export class ApproveReportComponent
  extends FormBase<IApproveReportFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly reportService = inject(ReportService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IReportGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to approve report but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IApproveReportFormDto>(
      APPROVE_ACTION_REPORT_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const reportId = this.selectedRecord()[0].id;
    const formData = this.prepareFormData();
    this.executeReportApprovalAction(formData, reportId);
  }

  private prepareFormData(): IApproveReportFormDto {
    return this.form.getData();
  }

  private executeReportApprovalAction(
    formData: IApproveReportFormDto,
    reportId: string
  ): void {
    this.loadingService.show({
      title: 'Approving report',
      message: "We're approving the report. This will just take a moment.",
    });
    this.form.disable();

    this.reportService
      .approveReport(formData, reportId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IApproveReportResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to approve report', error);
          this.notificationService.error('Failed to approve report.');
        },
      });
  }
}
