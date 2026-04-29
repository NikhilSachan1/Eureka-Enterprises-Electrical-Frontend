import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import {
  IDocGetBaseResponseDto,
  IPaymentAdviceDocAddFormDto,
  IPaymentAdviceDocAddResponseDto,
} from '../../types/doc.dto';
import { IDialogActionHandler } from '@shared/types';
import { DocService } from '../../services/doc.service';
import { ConfirmationDialogService } from '@shared/services';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { PAYMENT_ADVICE_DOC_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-advice-doc',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './payment-advice-doc.component.html',
  styleUrl: './payment-advice-doc.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentAdviceDocComponent
  extends FormBase<IPaymentAdviceDocAddFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly docService = inject(DocService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IDocGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();
  protected readonly docContext = input<'sales' | 'purchase'>('sales');

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to perform action on Payment Advice document but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IPaymentAdviceDocAddFormDto>(
      PAYMENT_ADVICE_DOC_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        context: {
          docContext: this.docContext(),
        },
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeDocAction(formData);
  }

  private prepareFormData(): IPaymentAdviceDocAddFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeDocAction(formData: IPaymentAdviceDocAddFormDto): void {
    const actionWord =
      this.docContext() === 'purchase' ? 'Generating' : 'Adding';
    const progressMessage =
      this.docContext() === 'purchase'
        ? "We're generating the Payment Advice document. This will just take a moment."
        : "We're adding the Payment Advice document. This will just take a moment.";

    this.loadingService.show({
      title: `${actionWord} Payment Advice Document`,
      message: progressMessage,
    });
    this.form.disable();

    this.docService
      .addPaymentAdviceDoc(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IPaymentAdviceDocAddResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
      });
  }
}
