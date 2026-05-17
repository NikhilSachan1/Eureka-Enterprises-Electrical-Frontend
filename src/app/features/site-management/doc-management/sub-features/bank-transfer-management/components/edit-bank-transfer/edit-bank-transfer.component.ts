import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { APP_CONFIG } from '@core/config';
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { defer, finalize, mergeMap, of } from 'rxjs';

import { FormBase } from '@shared/base/form.base';
import {
  IDialogActionHandler,
  IFinancialFileUploadResponseDto,
  IInputFieldsConfig,
} from '@shared/types';
import {
  AttachmentsService,
  ConfirmationDialogService,
} from '@shared/services';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';

import { EDIT_BANK_TRANSFER_FORM_CONFIG } from '../../config';
import { BankTransferService } from '../../services/bank-transfer.service';
import {
  IBankTransferGetBaseResponseDto,
  IEditBankTransferFormDto,
  IEditBankTransferResponseDto,
  IEditBankTransferUIFormDto,
} from '../../types/bank-transfer.dto';

@Component({
  selector: 'app-edit-bank-transfer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  providers: [CurrencyPipe, DatePipe],
  templateUrl: './edit-bank-transfer.component.html',
  styleUrl: './edit-bank-transfer.component.scss',
})
export class EditBankTransferComponent
  extends FormBase<IEditBankTransferUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly bankTransferService = inject(BankTransferService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly currencyPipe = inject(CurrencyPipe);
  private readonly datePipe = inject(DatePipe);

  protected readonly EDocContext = EDocContext;

  protected readonly selectedRecord =
    input.required<IBankTransferGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();
  protected readonly docContext = input.required<EDocContext>();

  ngOnInit(): void {
    const rows = this.selectedRecord();
    const record = rows?.[0];
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error('Edit Bank Transfer: selected record was not provided');
      this.confirmationDialogService.closeDialog();
      return;
    }

    this.form = this.formService.createForm<IEditBankTransferUIFormDto>(
      EDIT_BANK_TRANSFER_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: {
          projectName: record.siteId,
          invoiceNumber:
            EDocContext.PURCHASE === this.docContext()
              ? record.bookPayment?.invoice?.id
              : record.invoice?.id,
          bookPaymentNumber:
            EDocContext.PURCHASE === this.docContext()
              ? record.bookPaymentId
              : null,
          utrNumber: record.utrNumber,
          transferDate: new Date(record.transferDate),
          transferAmount: Number(record.transferAmount),
          remarks: record.remarks ?? null,
        },
        context: { docContext: this.docContext() },
      }
    );

    this.seedInvoiceNumberOption(record);
    if (this.docContext() === EDocContext.PURCHASE) {
      this.seedBookPaymentNumberOption(record);
    }
  }

  private seedInvoiceNumberOption(
    record: IBankTransferGetBaseResponseDto
  ): void {
    const value =
      EDocContext.PURCHASE === this.docContext()
        ? record.bookPayment?.invoice?.id
        : record.invoice?.id;
    const base = this.form.fieldConfigs.invoiceNumber;
    this.form.fieldConfigs.invoiceNumber = {
      ...base,
      selectConfig: {
        ...base.selectConfig,
        optionsDropdown: value
          ? [
              {
                label:
                  EDocContext.PURCHASE === this.docContext()
                    ? record.bookPayment?.invoice?.invoiceNumber
                    : record.invoice?.invoiceNumber,
                value,
              },
            ]
          : [],
      },
    } as IInputFieldsConfig;
    queueMicrotask(() => this.changeDetectorRef.detectChanges());
  }

  private seedBookPaymentNumberOption(
    record: IBankTransferGetBaseResponseDto
  ): void {
    const value =
      EDocContext.PURCHASE === this.docContext()
        ? record.bookPaymentId
        : record.invoiceId;
    const base = this.form.fieldConfigs.bookPaymentNumber;
    this.form.fieldConfigs.bookPaymentNumber = {
      ...base,
      selectConfig: {
        ...base.selectConfig,
        optionsDropdown: value
          ? [
              {
                label: this.formatBookPaymentSeedLabel(record),
                value,
              },
            ]
          : [],
      },
    } as IInputFieldsConfig;
    queueMicrotask(() => this.changeDetectorRef.detectChanges());
  }

  private formatBookPaymentSeedLabel(
    record: IBankTransferGetBaseResponseDto
  ): string {
    const bp = record.bookPayment as NonNullable<
      IBankTransferGetBaseResponseDto['bookPayment']
    >;
    const amountText =
      this.currencyPipe.transform(
        Number(bp.paymentTotalAmount),
        APP_CONFIG.CURRENCY_CONFIG.DEFAULT
      ) ?? '';
    const dateText =
      this.datePipe.transform(
        new Date(bp.createdAt),
        APP_CONFIG.DATE_FORMATS.DEFAULT
      ) ?? '';
    return `${amountText} (${dateText})`;
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const record = this.selectedRecord()[0];
    if (!record?.id) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      return;
    }
    this.executeEditBankTransferAction(record.id);
  }

  private executeEditBankTransferAction(bankTransferId: string): void {
    const file = this.form.getFieldData('proofAttachment') as
      | File[]
      | undefined;

    this.loadingService.show({
      title: 'Updating bank transfer',
      message:
        'Please wait while we update the bank transfer. This will just take a moment.',
    });
    this.form.disable();

    defer(() =>
      file?.length
        ? this.attachmentsService.uploadFinancialDocument(file[0])
        : of<IFinancialFileUploadResponseDto | null>(null)
    )
      .pipe(
        mergeMap(attachmentResponse =>
          this.bankTransferService.editBankTransfer(
            this.prepareFormData(attachmentResponse),
            bankTransferId
          )
        ),
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IEditBankTransferResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: (error: unknown) => {
          this.logger.error('Failed to edit bank transfer', error);
          this.notificationService.error(
            'Could not update bank transfer. Please try again.'
          );
        },
      });
  }

  private prepareFormData(
    attachmentResponse: IFinancialFileUploadResponseDto | null
  ): IEditBankTransferFormDto {
    const formData = this.form.getData();
    const record = { ...formData };
    delete (record as Record<string, unknown>)['projectName'];
    delete (record as Record<string, unknown>)['proofAttachment'];
    delete (record as Record<string, unknown>)['invoiceNumber'];
    delete (record as Record<string, unknown>)['bookPaymentNumber'];

    if (EDocContext.PURCHASE === this.docContext()) {
      delete (record as Record<string, unknown>)['transferAmount'];
    }
    return {
      ...record,
      partyType: this.docContext(),
      transferProofFileKey: attachmentResponse?.fileKey ?? null,
      transferProofFileName: attachmentResponse?.fileName ?? null,
    };
  }
}
