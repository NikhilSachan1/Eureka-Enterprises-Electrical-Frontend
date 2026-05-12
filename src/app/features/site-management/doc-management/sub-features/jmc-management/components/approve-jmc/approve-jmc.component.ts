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
  IApproveJmcFormDto,
  IApproveJmcResponseDto,
  IJmcGetBaseResponseDto,
} from '../../types/jmc.dto';
import { APPROVE_ACTION_JMC_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-approve-jmc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './approve-jmc.component.html',
  styleUrl: './approve-jmc.component.scss',
})
export class ApproveJmcComponent
  extends FormBase<IApproveJmcFormDto>
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
        'Selected record is required to approve JMC but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IApproveJmcFormDto>(
      APPROVE_ACTION_JMC_FORM_CONFIG,
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
    this.executeJmcApprovalAction(formData, jmcId);
  }

  private prepareFormData(): IApproveJmcFormDto {
    return this.form.getData();
  }

  private executeJmcApprovalAction(
    formData: IApproveJmcFormDto,
    jmcId: string
  ): void {
    this.loadingService.show({
      title: 'Approving JMC',
      message: "We're approving the JMC. This will just take a moment.",
    });
    this.form.disable();

    this.jmcService
      .approveJmc(formData, jmcId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IApproveJmcResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to approve JMC', error);
          this.notificationService.error('Failed to approve JMC.');
        },
      });
  }
}
