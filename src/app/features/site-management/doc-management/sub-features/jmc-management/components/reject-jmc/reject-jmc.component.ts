import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import { IDialogActionHandler } from '@shared/types';
import { JmcService } from '../../services/jmc.service';
import { ConfirmationDialogService } from '@shared/services';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import {
  IRejectJmcFormDto,
  IRejectJmcResponseDto,
  IJmcGetBaseResponseDto,
} from '../../types/jmc.dto';
import { REJECT_ACTION_JMC_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-reject-jmc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './reject-jmc.component.html',
  styleUrl: './reject-jmc.component.scss',
})
export class RejectJmcComponent
  extends FormBase<IRejectJmcFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly jmcService = inject(JmcService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IJmcGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to reject JMC but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IRejectJmcFormDto>(
      REJECT_ACTION_JMC_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const jmcId = this.selectedRecord()[0].id;
    const formData = this.prepareFormData();
    this.executeJmcRejectAction(formData, jmcId);
  }

  private prepareFormData(): IRejectJmcFormDto {
    return this.form.getData();
  }

  private executeJmcRejectAction(
    formData: IRejectJmcFormDto,
    jmcId: string
  ): void {
    this.loadingService.show({
      title: 'Rejecting JMC',
      message: "We're rejecting the JMC. This will just take a moment.",
    });
    this.form.disable();

    this.jmcService
      .rejectJmc(formData, jmcId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IRejectJmcResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to reject JMC', error);
          this.notificationService.error('Failed to reject JMC.');
        },
      });
  }
}
