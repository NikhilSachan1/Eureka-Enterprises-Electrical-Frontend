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
  IRejectPoFormDto,
  IRejectPoResponseDto,
  IPoGetBaseResponseDto,
} from '../../types/po.dto';
import { REJECT_ACTION_PO_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-reject-po',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './reject-po.component.html',
  styleUrl: './reject-po.component.scss',
})
export class RejectPoComponent
  extends FormBase<IRejectPoFormDto>
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
        'Selected record is required to reject PO but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IRejectPoFormDto>(
      REJECT_ACTION_PO_FORM_CONFIG,
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
    this.executePoRejectAction(formData, poId);
  }

  private prepareFormData(): IRejectPoFormDto {
    return this.form.getData();
  }

  private executePoRejectAction(
    formData: IRejectPoFormDto,
    poId: string
  ): void {
    this.loadingService.show({
      title: 'Rejecting PO',
      message: "We're rejecting the PO. This will just take a moment.",
    });
    this.form.disable();

    this.poService
      .rejectPo(formData, poId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IRejectPoResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to reject PO', error);
          this.notificationService.error('Failed to reject PO.');
        },
      });
  }
}
