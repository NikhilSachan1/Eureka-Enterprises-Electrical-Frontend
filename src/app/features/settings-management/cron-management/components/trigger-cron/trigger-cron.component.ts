import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBase } from '@shared/base/form.base';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ConfirmationDialogService } from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { finalize } from 'rxjs';
import { CronService } from '../../services/cron.service';
import { TRIGGER_CRON_FORM_CONFIG } from '../../configs';
import {
  ICronGetJobDto,
  ICronRunFormDto,
  ICronRunResponseDto,
  ICronRunUIFormDto,
} from '../../types/cron.dto';

@Component({
  selector: 'app-trigger-cron',
  standalone: true,
  imports: [ReactiveFormsModule, InputFieldComponent],
  templateUrl: './trigger-cron.component.html',
  styleUrl: './trigger-cron.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriggerCronComponent
  extends FormBase<ICronRunUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly cronService = inject(CronService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord = input.required<ICronGetJobDto[]>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record?.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to trigger cron job but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<ICronRunUIFormDto>(
      TRIGGER_CRON_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        context: {
          requiredParameters: record[0].requiredParameters,
        },
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.triggerCronJob(formData);
  }

  private prepareFormData(): ICronRunFormDto {
    const formData = this.form.getData();
    const selectedRecord = this.selectedRecord()[0];

    return {
      ...formData,
      cronName: selectedRecord.name,
    };
  }

  private triggerCronJob(formData: ICronRunFormDto): void {
    this.loadingService.show({
      title: 'Running scheduled job',
      message: "We're running the scheduled job. This will just take a moment.",
    });
    this.form.disable();

    this.cronService
      .runCronJob(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ICronRunResponseDto) => {
          this.notificationService.success(response.message);
          this.confirmationDialogService.closeDialog();
        },
      });
  }

  /** Date present → only date; month/year hidden (schema derives them from date). */
  protected isShowRunDate(): boolean {
    return (
      this.selectedRecord()[0].requiredParameters.includes('date') &&
      !this.selectedRecord()[0].requiredParameters.includes('month') &&
      !this.selectedRecord()[0].requiredParameters.includes('year')
    );
  }

  /** Month without date → month only; year hidden. */
  protected isShowRunMonth(): boolean {
    const p = this.selectedRecord()[0].requiredParameters;
    return p.includes('month') && !p.includes('date');
  }

  /** Year only when year required and neither month nor date. */
  protected isShowRunYearOnly(): boolean {
    return (
      this.selectedRecord()[0].requiredParameters.includes('year') &&
      !this.selectedRecord()[0].requiredParameters.includes('month') &&
      !this.selectedRecord()[0].requiredParameters.includes('date')
    );
  }
}
