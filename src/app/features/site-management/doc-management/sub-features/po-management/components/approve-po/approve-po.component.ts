import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import { IDialogActionHandler } from '@shared/types';
import { PoService } from '../../services/po.service';
import { ConfirmationDialogService } from '@shared/services';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import {
  IApprovePoFormDto,
  IApprovePoResponseDto,
  IPoGetBaseResponseDto,
} from '../../types/po.dto';
import { APPROVE_ACTION_PO_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-approve-po',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './approve-po.component.html',
  styleUrl: './approve-po.component.scss',
})
export class ApprovePoComponent
  extends FormBase<IApprovePoFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly poService = inject(PoService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord = input.required<IPoGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to approve PO but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IApprovePoFormDto>(
      APPROVE_ACTION_PO_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const poId = this.selectedRecord()[0].id;
    const formData = this.prepareFormData();
    this.executePoApprovalAction(formData, poId);
  }

  private prepareFormData(): IApprovePoFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executePoApprovalAction(
    formData: IApprovePoFormDto,
    poId: string
  ): void {
    this.loadingService.show({
      title: 'Approving PO',
      message: "We're approving the PO. This will just take a moment.",
    });
    this.form.disable();

    this.poService
      .approvePo(formData, poId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IApprovePoResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to approve PO', error);
          this.notificationService.error('Failed to approve PO.');
        },
      });
  }
}
