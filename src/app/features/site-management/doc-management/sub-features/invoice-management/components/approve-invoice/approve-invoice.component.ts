import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import { IDialogActionHandler } from '@shared/types';
import { InvoiceService } from '../../services/invoice.service';
import { ConfirmationDialogService } from '@shared/services';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import {
  IApproveInvoiceFormDto,
  IApproveInvoiceResponseDto,
  IInvoiceGetBaseResponseDto,
} from '../../types/invoice.dto';
import { APPROVE_ACTION_INVOICE_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-approve-invoice',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './approve-invoice.component.html',
  styleUrl: './approve-invoice.component.scss',
})
export class ApproveInvoiceComponent
  extends FormBase<IApproveInvoiceFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly invoiceService = inject(InvoiceService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IInvoiceGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to approve invoice but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IApproveInvoiceFormDto>(
      APPROVE_ACTION_INVOICE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const invoiceId = this.selectedRecord()[0].id;
    const formData = this.prepareFormData();
    this.executeInvoiceApprovalAction(formData, invoiceId);
  }

  private prepareFormData(): IApproveInvoiceFormDto {
    return this.form.getData();
  }

  private executeInvoiceApprovalAction(
    formData: IApproveInvoiceFormDto,
    invoiceId: string
  ): void {
    this.loadingService.show({
      title: 'Approving Invoice',
      message: "We're approving the invoice. This will just take a moment.",
    });
    this.form.disable();

    this.invoiceService
      .approveInvoice(formData, invoiceId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IApproveInvoiceResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to approve invoice', error);
          this.notificationService.error('Failed to approve invoice.');
        },
      });
  }
}
