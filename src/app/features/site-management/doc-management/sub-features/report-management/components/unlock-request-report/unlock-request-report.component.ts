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
  IUnlockRequestReportFormDto,
  IUnlockRequestReportResponseDto,
  IReportGetBaseResponseDto,
} from '../../types/report.dto';
import { UNLOCK_REQUEST_ACTION_REPORT_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-unlock-request-report',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './unlock-request-report.component.html',
  styleUrl: './unlock-request-report.component.scss',
})
export class UnlockRequestReportComponent
  extends FormBase<IUnlockRequestReportFormDto>
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
        'Selected record is required to request report unlock but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IUnlockRequestReportFormDto>(
      UNLOCK_REQUEST_ACTION_REPORT_FORM_CONFIG,
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
    this.executeUnlockRequestAction(formData, reportId);
  }

  private prepareFormData(): IUnlockRequestReportFormDto {
    return this.form.getData();
  }

  private executeUnlockRequestAction(
    formData: IUnlockRequestReportFormDto,
    reportId: string
  ): void {
    this.loadingService.show({
      title: 'Requesting unlock',
      message:
        "We're submitting your unlock request. This will just take a moment.",
    });
    this.form.disable();

    this.reportService
      .unlockRequestReport(formData, reportId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IUnlockRequestReportResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to request report unlock', error);
          this.notificationService.error('Failed to request report unlock.');
        },
      });
  }
}
