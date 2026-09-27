import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { FormBase } from '@shared/base/form.base';
import { IDialogActionHandler, IInputFieldsConfig } from '@shared/types';
import { ConfirmationDialogService } from '@shared/services';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ALL_INVOICE_ADVANCE_SETTLEMENTS } from '../../schemas';
import { UNSETTLE_ADVANCE_INVOICE_FORM_CONFIG } from '../../config/form/unsettle-advance-invoice.config';
import { InvoiceService } from '../../services/invoice.service';
import {
  IInvoiceGetBaseResponseDto,
  IUnsettleAdvanceInvoiceFormDto,
  IUnsettleAdvanceInvoiceResponseDto,
} from '../../types/invoice.dto';
import { getInvoiceAdvanceSettlements } from '../../utils/invoice-table-row.util';

@Component({
  selector: 'app-unsettle-advance-invoice',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './unsettle-advance-invoice.component.html',
})
export class UnsettleAdvanceInvoiceComponent
  extends FormBase<IUnsettleAdvanceInvoiceFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly invoiceService = inject(InvoiceService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  protected readonly selectedRecord =
    input.required<IInvoiceGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord()?.[0];
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to reverse advance settlement but was not provided'
      );
      return;
    }

    const settlements = getInvoiceAdvanceSettlements(record);
    const options = settlements.map(settlement => ({
      label: `${settlement.advanceNumber} · ${Number(settlement.amount).toLocaleString('en-IN')}`,
      value: settlement.settlementId,
    }));

    if (settlements.length > 1) {
      options.unshift({
        label: 'All settlements on this invoice',
        value: ALL_INVOICE_ADVANCE_SETTLEMENTS,
      });
    }

    this.form = this.formService.createForm<IUnsettleAdvanceInvoiceFormDto>(
      UNSETTLE_ADVANCE_INVOICE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: {
          settlementId:
            settlements.length > 1
              ? ALL_INVOICE_ADVANCE_SETTLEMENTS
              : settlements[0].settlementId,
        },
      }
    );

    const base = this.form.fieldConfigs.settlementId;
    this.form.fieldConfigs.settlementId = {
      ...base,
      selectConfig: {
        ...base.selectConfig,
        optionsDropdown: options,
      },
    } as IInputFieldsConfig;

    queueMicrotask(() => this.changeDetectorRef.detectChanges());
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const invoiceId = this.selectedRecord()[0]?.id;
    if (!invoiceId) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      return;
    }

    const { settlementId } = this.form.getData();
    this.executeUnsettleAction(invoiceId, settlementId);
  }

  private executeUnsettleAction(
    invoiceId: string,
    settlementId: string
  ): void {
    this.loadingService.show({
      title: 'Reversing settlement',
      message:
        "We're reversing the advance settlement. This will just take a moment.",
    });
    this.form.disable();

    const request$ =
      settlementId === ALL_INVOICE_ADVANCE_SETTLEMENTS
        ? this.invoiceService.unsettleAllAdvances(invoiceId)
        : this.invoiceService.unsettleAdvance(invoiceId, settlementId);

    request$
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IUnsettleAdvanceInvoiceResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to reverse advance settlement', error);
        },
      });
  }
}
