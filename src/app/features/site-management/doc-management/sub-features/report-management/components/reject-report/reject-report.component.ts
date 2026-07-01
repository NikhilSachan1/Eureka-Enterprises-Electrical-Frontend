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
  IRejectReportFormDto,
  IRejectReportResponseDto,
  IReportGetBaseResponseDto,
} from '../../types/report.dto';
import { REJECT_ACTION_REPORT_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-reject-report',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './reject-report.component.html',
  styleUrl: './reject-report.component.scss',
})
export class RejectReportComponent
  extends FormBase<IRejectReportFormDto>
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
        'Selected record is required to reject report but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IRejectReportFormDto>(
      REJECT_ACTION_REPORT_FORM_CONFIG,
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
    this.executeReportRejectAction(formData, reportId);
  }

  private prepareFormData(): IRejectReportFormDto {
    return this.form.getData();
  }

  private executeReportRejectAction(
    formData: IRejectReportFormDto,
    reportId: string
  ): void {
    this.loadingService.show({
      title: 'Rejecting report',
      message: "We're rejecting the report. This will just take a moment.",
    });
    this.form.disable();

    this.reportService
      .rejectReport(formData, reportId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IRejectReportResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to reject report', error);
          this.notificationService.error('Failed to reject report.');
        },
      });
  }
}
