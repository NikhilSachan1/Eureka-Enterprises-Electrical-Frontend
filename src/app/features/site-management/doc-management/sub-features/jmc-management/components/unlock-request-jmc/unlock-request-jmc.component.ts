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
  IUnlockRequestJmcFormDto,
  IUnlockRequestJmcResponseDto,
  IJmcGetBaseResponseDto,
} from '../../types/jmc.dto';
import { UNLOCK_REQUEST_ACTION_JMC_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-unlock-request-jmc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './unlock-request-jmc.component.html',
  styleUrl: './unlock-request-jmc.component.scss',
})
export class UnlockRequestJmcComponent
  extends FormBase<IUnlockRequestJmcFormDto>
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
        'Selected record is required to request JMC unlock but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IUnlockRequestJmcFormDto>(
      UNLOCK_REQUEST_ACTION_JMC_FORM_CONFIG,
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
    this.executeUnlockRequestAction(formData, jmcId);
  }

  private prepareFormData(): IUnlockRequestJmcFormDto {
    return this.form.getData();
  }

  private executeUnlockRequestAction(
    formData: IUnlockRequestJmcFormDto,
    jmcId: string
  ): void {
    this.loadingService.show({
      title: 'Requesting unlock',
      message:
        "We're submitting your unlock request. This will just take a moment.",
    });
    this.form.disable();

    this.jmcService
      .unlockRequestJmc(formData, jmcId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IUnlockRequestJmcResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to request JMC unlock', error);
          this.notificationService.error('Failed to request JMC unlock.');
        },
      });
  }
}
