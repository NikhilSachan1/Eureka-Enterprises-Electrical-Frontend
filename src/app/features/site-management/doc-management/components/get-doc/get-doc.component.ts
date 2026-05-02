import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  OnInit,
  signal,
  TemplateRef,
  viewChild,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AppConfigurationService,
  ConfirmationDialogService,
  NotificationService,
  TableService,
} from '@shared/services';
import {
  EButtonActionType,
  IEnhancedTable,
  IEnhancedTableConfig,
  IDialogActionConfig,
  ITableActionClickEvent,
} from '@shared/types';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { CurrencyPipe, NgClass } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { MailService } from '../../services/mail.service';
import { finalize } from 'rxjs';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { DialogModule } from 'primeng/dialog';
import { SplitButtonModule } from 'primeng/splitbutton';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MenuItem } from 'primeng/api';
import { DOC_ADD_BUTTON_CONFIG_MAP } from '../../config/dialog/get-doc.config';
import { EDocType } from '../../types/doc.enum';
import { getDocTypeClass } from '../../utils/doc-type-colors.util';
import { DOC_TABLE_ENHANCED_CONFIG } from '../../config/table/get-doc.config';
import { IDocGetBaseResponseDto } from '../../types/doc.dto';
import {
  DocIndexedDbService,
  IDocIndexedDbRow,
} from '../../services/doc-indexed-db.service';

interface IPoSummaryRow {
  poNumber: string;
  partyName: string;
  poValue: number;
  jmcCount: number;
  reportCount: number;
  invoiceCount: number;
  /** Payment drafts linked to this PO’s invoices */
  paymentDraftCount: number;
  invoicedAmount: number;
  /** Invoiced total (incl. GST) − Booked (tax + GST on drafts) */
  invoicedMinusBooked: number;
  totalGstDeducted: number;
  totalTdsDeducted: number;
  /** Sum of taxable + GST on payment drafts */
  bookedAmount: number;
  actualReceivedAmount: number;
  paymentAdviceCount: number;
  balance: number;
}

@Component({
  selector: 'app-get-doc',
  imports: [
    DataTableComponent,
    DialogModule,
    SplitButtonModule,
    CurrencyPipe,
    NgClass,
    CardModule,
    ReactiveFormsModule,
    InputTextModule,
  ],
  templateUrl: './get-doc.component.html',
  styleUrl: './get-doc.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetDocComponent implements OnInit {
  private readonly dataTableService = inject(TableService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly docIndexedDbService = inject(DocIndexedDbService);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly mailService = inject(MailService);
  private readonly notificationService = inject(NotificationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly docContext = input<'sales' | 'purchase'>('sales');

  protected table!: IEnhancedTable;
  protected addDocumentSplitItems: MenuItem[] = [];
  protected readonly poSummaryRows = signal<IPoSummaryRow[]>([]);
  protected readonly showPoSummary = signal(true);

  // Mail compose state
  protected readonly composeOpen = signal(false);
  protected readonly toEmails = signal<string[]>([]);
  protected readonly ccEmails = signal<string[]>([]);
  protected readonly composeFiles = signal<{ file: File; url: string }[]>([]);
  protected readonly mailSending = signal(false);
  protected toInput = '';
  protected ccInput = '';
  protected readonly composeForm = new FormGroup({
    subject: new FormControl('', Validators.required),
    body: new FormControl('', Validators.required),
  });

  protected readonly amountTmpl = viewChild<TemplateRef<unknown>>('amountTmpl');
  protected readonly refDocTmpl = viewChild<TemplateRef<unknown>>('refDocTmpl');
  protected readonly docTypeTmpl =
    viewChild<TemplateRef<unknown>>('docTypeTmpl');
  protected get customBodyTemplates(): Record<string, TemplateRef<unknown>> {
    const result: Record<string, TemplateRef<unknown>> = {};
    const amount = this.amountTmpl();
    const refDoc = this.refDocTmpl();
    const docType = this.docTypeTmpl();
    if (amount) {
      result['amountBreakdown'] = amount;
    }
    if (refDoc) {
      result['refDocCell'] = refDoc;
    }
    if (docType) {
      result['docTypeCell'] = docType;
    }
    return result;
  }

  protected readonly getDocTypeClass = getDocTypeClass;

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      DOC_TABLE_ENHANCED_CONFIG as unknown as IEnhancedTableConfig
    );

    if (this.docContext() === 'purchase') {
      const updatedHeaders = this.table
        .getHeaders()
        .map((header, index) =>
          index === 0 ? { ...header, header: 'Vendor Name' } : header
        );
      this.table.updateHeaders(updatedHeaders);
    }

    this.initializeSplitButtonItems();
    void this.loadIndexedDbDocs();
  }

  protected handleDocTableActionClick(
    event: ITableActionClickEvent<IDocGetBaseResponseDto>
  ): void {
    const row = event.selectedRows[0] as Record<string, unknown>;
    const id = row?.['id'] as string;
    if (!id) {
      return;
    }

    if (event.actionType === EButtonActionType.DELETE) {
      this.table.setLoading(true);
      void Promise.all(
        event.selectedRows.map(r =>
          this.docIndexedDbService.deleteDoc(
            (r as Record<string, unknown>)['id'] as string
          )
        )
      )
        .then(() => this.loadIndexedDbDocs())
        .catch(() => this.table.setLoading(false));
    }

    if (event.actionType === EButtonActionType.APPROVE) {
      void this.docIndexedDbService.getDocById(id).then(doc => {
        if (!doc) {
          return;
        }
        // unlock_requested → pending (admin confirms unlock), otherwise pending → approved
        const newStatus =
          doc.approvalStatus === 'unlock_requested' ? 'pending' : 'approved';
        this.table.setLoading(true);
        void this.docIndexedDbService
          .updateApprovalStatus(id, newStatus)
          .then(() => this.loadIndexedDbDocs())
          .catch(() => this.table.setLoading(false));
      });
    }

    if (event.actionType === EButtonActionType.REJECT) {
      this.table.setLoading(true);
      void this.docIndexedDbService
        .updateApprovalStatus(id, 'rejected')
        .then(() => this.loadIndexedDbDocs())
        .catch(() => this.table.setLoading(false));
    }

    if (event.actionType === EButtonActionType.CANCEL) {
      this.table.setLoading(true);
      void this.docIndexedDbService
        .updateApprovalStatus(id, 'unlock_requested')
        .then(() => this.loadIndexedDbDocs())
        .catch(() => this.table.setLoading(false));
    }

    if (event.actionType === EButtonActionType.SEND_MAIL) {
      void this.docIndexedDbService.getDocById(id).then(async doc => {
        if (!doc) {
          return;
        }
        await this.openMailCompose(doc);
      });
    }

    if (event.actionType === EButtonActionType.EDIT) {
      void this.docIndexedDbService.getDocById(id).then(editRecord => {
        if (!editRecord) {
          return;
        }
        const docType = editRecord.documentType;
        const dialogConfig: IDialogActionConfig = {
          ...DOC_ADD_BUTTON_CONFIG_MAP[docType],
        };
        const dynamicComponentInputs: Record<string, unknown> = {
          selectedRecord: [],
          docContext: this.docContext(),
          editRecord,
          onSuccess: (): void => {
            this.loadIndexedDbDocs();
          },
        };
        if (docType === EDocType.PAYMENT) {
          dialogConfig.dialogConfig = {
            ...dialogConfig.dialogConfig,
            header: 'Edit Payment',
            message: 'Update the booked payment details.',
          };
        }
        if (
          docType === EDocType.PAYMENT_ADVICE &&
          this.docContext() === 'purchase'
        ) {
          dialogConfig.dialogConfig = {
            ...dialogConfig.dialogConfig,
            header: 'Edit Payment Advice',
            message: 'Update the payment advice details.',
          };
        }
        if (docType === EDocType.GST_PAYMENT_RELEASE) {
          dialogConfig.dialogConfig = {
            ...dialogConfig.dialogConfig,
            header: 'Edit GST payment release',
            message: 'Update amount, date, remark, or attachments.',
          };
        }
        this.confirmationDialogService.showConfirmationDialog(
          EButtonActionType.SUBMIT,
          dialogConfig,
          null,
          false,
          false,
          dynamicComponentInputs
        );
      });
    }
  }

  protected openAddDocDialog(dialogType: EDocType): void {
    this.doOpenAddDocDialog(dialogType);
  }

  private doOpenAddDocDialog(dialogType: EDocType): void {
    const dialogConfig: IDialogActionConfig = {
      ...DOC_ADD_BUTTON_CONFIG_MAP[dialogType],
    };
    const dynamicComponentInputs: Record<string, unknown> = {
      selectedRecord: [],
      docContext: this.docContext(),
      onSuccess: (): void => {
        this.loadIndexedDbDocs();
      },
    };

    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.SUBMIT,
      dialogConfig,
      null,
      false,
      false,
      dynamicComponentInputs
    );
  }

  protected onAddDocumentPrimaryClick(): void {
    this.openAddDocDialog(EDocType.PO);
  }

  protected clearAllDocs(): void {
    this.table.setLoading(true);
    void this.docIndexedDbService
      .clearAll()
      .then(() => {
        this.notificationService.success(
          'All documents deleted from IndexedDB.'
        );
        this.loadIndexedDbDocs();
      })
      .catch(() => {
        this.notificationService.error('Failed to clear IndexedDB.');
        this.table.setLoading(false);
      });
  }

  private loadIndexedDbDocs(): void {
    this.table.setLoading(true);
    void this.docIndexedDbService
      .getAllDocs()
      .then(docs => {
        const idToDoc = new Map(docs.map(d => [d.id, d]));
        const filtered = docs.filter(
          row => row.docContext === this.docContext()
        );
        this.table.setData(
          filtered.map(row => this.mapRowToTableData(row, idToDoc))
        );
        this.computePoSummary(docs);
        this.cdr.markForCheck();
      })
      .catch(() => this.table.setData([]))
      .finally(() => this.table.setLoading(false));
  }

  private computePoSummary(allDocs: IDocIndexedDbRow[]): void {
    const ctx = this.docContext();
    const contractorList = this.appConfigurationService.contractorList();

    const byType = (type: EDocType): IDocIndexedDbRow[] =>
      allDocs.filter(d => d.documentType === type && d.docContext === ctx);

    const pos = byType(EDocType.PO);
    const jmcs = byType(EDocType.JMC);
    const reports = byType(EDocType.REPORT);
    const invoices = byType(EDocType.INVOICE);
    const payments = byType(EDocType.PAYMENT);
    const bankTransfers = byType(EDocType.BANK_TRANSFER);
    const advices = byType(EDocType.PAYMENT_ADVICE);

    const rows: IPoSummaryRow[] = pos.map(po => {
      const poJmcs = jmcs.filter(j => j.docReference === po.id);
      const jmcIds = new Set(poJmcs.map(j => j.id));

      const poReports = reports.filter(r => jmcIds.has(r.docReference ?? ''));
      const poInvoices = invoices.filter(i => jmcIds.has(i.docReference ?? ''));
      const invoiceIds = new Set(poInvoices.map(i => i.id));

      // Payment (draft) → Bank Transfer (UTR) → Payment Advice (auto on purchase after UTR).
      const poPayments = payments.filter(p =>
        invoiceIds.has(p.docReference ?? '')
      );
      const paymentIds = new Set(poPayments.map(p => p.id));

      const poBankTransfers = bankTransfers.filter(bt =>
        paymentIds.has(bt.docReference ?? '')
      );
      const bankTransferIds = new Set(poBankTransfers.map(bt => bt.id));

      const poAdvices = advices.filter(a =>
        bankTransferIds.has(a.docReference ?? '')
      );

      const invoicedAmount = poInvoices.reduce(
        (s, i) => s + (i.totalAmount ?? 0),
        0
      );
      const bookedAmount = poPayments.reduce(
        (s, p) => s + (p.taxableAmount ?? 0) + (p.gstAmount ?? 0),
        0
      );
      const invoicedMinusBooked = invoicedAmount - bookedAmount;
      // Actual received = Bank Transfer total (UTR confirmed)
      const actualReceivedAmount = poBankTransfers.reduce(
        (s, bt) => s + (bt.totalAmount ?? 0),
        0
      );
      // GST & TDS deducted — summed from Payment drafts
      const totalGstDeducted = poPayments.reduce(
        (s, p) => s + (p.gstAmount ?? 0),
        0
      );
      const totalTdsDeducted = poPayments.reduce(
        (s, p) => s + (p.tdsDeductionAmount ?? 0),
        0
      );

      const partyId = ctx === 'sales' ? po.contractorName : po.vendorName;
      const partyName =
        partyId && contractorList.length
          ? String(
              getMappedValueFromArrayOfObjects(contractorList, partyId as never)
            )
          : (partyId ?? '—');

      return {
        poNumber: po.documentNumber,
        partyName,
        poValue: po.totalAmount ?? 0,
        jmcCount: poJmcs.length,
        reportCount: poReports.length,
        invoiceCount: poInvoices.length,
        paymentDraftCount: poPayments.length,
        invoicedAmount,
        invoicedMinusBooked,
        totalGstDeducted,
        totalTdsDeducted,
        bookedAmount,
        actualReceivedAmount,
        paymentAdviceCount: poAdvices.length,
        balance: (po.totalAmount ?? 0) - invoicedAmount,
      };
    });

    this.poSummaryRows.set(rows);
  }

  protected get summaryTotals(): {
    poValue: number;
    invoiceDocCount: number;
    paymentDraftCount: number;
    invoicedAmount: number;
    invoicedMinusBooked: number;
    totalGstDeducted: number;
    totalTdsDeducted: number;
    bookedAmount: number;
    actualReceivedAmount: number;
    balance: number;
  } {
    return this.poSummaryRows().reduce(
      (acc, r) => ({
        poValue: acc.poValue + r.poValue,
        invoiceDocCount: acc.invoiceDocCount + r.invoiceCount,
        paymentDraftCount: acc.paymentDraftCount + r.paymentDraftCount,
        invoicedAmount: acc.invoicedAmount + r.invoicedAmount,
        invoicedMinusBooked: acc.invoicedMinusBooked + r.invoicedMinusBooked,
        totalGstDeducted: acc.totalGstDeducted + r.totalGstDeducted,
        totalTdsDeducted: acc.totalTdsDeducted + r.totalTdsDeducted,
        bookedAmount: acc.bookedAmount + r.bookedAmount,
        actualReceivedAmount: acc.actualReceivedAmount + r.actualReceivedAmount,
        balance: acc.balance + r.balance,
      }),
      {
        poValue: 0,
        invoiceDocCount: 0,
        paymentDraftCount: 0,
        invoicedAmount: 0,
        invoicedMinusBooked: 0,
        totalGstDeducted: 0,
        totalTdsDeducted: 0,
        bookedAmount: 0,
        actualReceivedAmount: 0,
        balance: 0,
      }
    );
  }

  private mapRowToTableData(
    row: IDocIndexedDbRow,
    idToDoc: Map<string, IDocIndexedDbRow>
  ): Record<string, unknown> {
    const partyId =
      this.docContext() === 'sales' ? row.contractorName : row.vendorName;
    const contractorList = this.appConfigurationService.contractorList();
    const partyName =
      partyId && contractorList.length
        ? String(
            getMappedValueFromArrayOfObjects(contractorList, partyId as never)
          )
        : partyId;

    const refDoc = row.docReference ? idToDoc.get(row.docReference) : null;

    // Traverse up the chain to find the root PO
    let rootPo: IDocIndexedDbRow | null = null;
    if (refDoc && refDoc.documentType !== EDocType.PO) {
      let cur: IDocIndexedDbRow | undefined = refDoc;
      while (cur && cur.documentType !== EDocType.PO) {
        cur = cur.docReference ? idToDoc.get(cur.docReference) : undefined;
      }
      rootPo = cur && cur.documentType === EDocType.PO ? cur : null;
    }

    let gstReferenceContext: string | null = null;
    if (
      row.documentType === EDocType.GST_PAYMENT_RELEASE &&
      row.remark?.trim()
    ) {
      const m = row.remark.trim().match(/^Month\s*\/\s*party:\s*(.+)$/i);
      gstReferenceContext = m ? m[1].trim() : row.remark.trim();
    }

    return {
      id: row.id,
      contractorName: partyName,
      documentType: row.documentType,
      documentNumber: row.documentNumber,
      referenceDocument: refDoc ? refDoc.documentType : null,
      referenceDocumentName: refDoc ? refDoc.documentType : null,
      referenceDocumentNumber: refDoc ? refDoc.documentNumber : null,
      rootPoNumber: rootPo ? rootPo.documentNumber : null,
      gstReferenceContext,
      documentDate: row.documentDate,
      amount: row.totalAmount,
      taxableAmount: row.taxableAmount,
      gstAmount: row.gstAmount,
      tdsDeductionAmount: row.tdsDeductionAmount,
      remarks: row.remark,
      documentAttachments: row.attachments ?? [],
      status: row.approvalStatus,
    };
  }

  /** Table chip text — avoids raw enum / confusion with vendor Payment Advice. */
  protected docTypeLabel(docType: string): string {
    switch (docType) {
      case EDocType.PO:
        return 'PO';
      case EDocType.JMC:
        return 'JMC';
      case EDocType.REPORT:
        return 'Report';
      case EDocType.INVOICE:
        return 'Invoice';
      case EDocType.PAYMENT:
        return 'Payment';
      case EDocType.PAYMENT_ADVICE:
        return 'Payment advice';
      case EDocType.BANK_TRANSFER:
        return 'Bank transfer';
      case EDocType.GST_PAYMENT_RELEASE:
        return 'GST payment release';
      default:
        return docType;
    }
  }

  private initializeSplitButtonItems(): void {
    const items: MenuItem[] = [
      {
        label: 'Add PO',
        command: (): void => this.openAddDocDialog(EDocType.PO),
      },
      {
        label: 'Add JMC',
        command: (): void => this.openAddDocDialog(EDocType.JMC),
      },
      {
        label: 'Add Report',
        command: (): void => this.openAddDocDialog(EDocType.REPORT),
      },
      {
        label: 'Add Invoice',
        command: (): void => this.openAddDocDialog(EDocType.INVOICE),
      },
      {
        label: 'Book Payment',
        command: (): void => this.openAddDocDialog(EDocType.PAYMENT),
      },
      {
        label: 'Add Bank Transfer (UTR)',
        command: (): void => this.openAddDocDialog(EDocType.BANK_TRANSFER),
      },
    ];

    if (this.docContext() !== 'purchase') {
      items.push({
        label: 'Add Payment Advice',
        command: (): void => this.openAddDocDialog(EDocType.PAYMENT_ADVICE),
      });
    }

    this.addDocumentSplitItems = items;
  }

  protected addDocumentButtonLabel(): string | null {
    const currentContext = this.docContext();

    if (currentContext === 'sales') {
      return 'Add Sales Document';
    } else if (currentContext === 'purchase') {
      return 'Add Purchase Document';
    }

    return 'Add Document';
  }

  private async openMailCompose(doc: IDocIndexedDbRow): Promise<void> {
    const contractorList = this.appConfigurationService.contractorList();
    const partyId =
      this.docContext() === 'sales' ? doc.contractorName : doc.vendorName;
    const partyName =
      partyId && contractorList.length
        ? String(
            getMappedValueFromArrayOfObjects(contractorList, partyId as never)
          )
        : (partyId ?? '—');

    let refLabel = '';
    if (doc.docReference) {
      const refDoc = await this.docIndexedDbService.getDocById(
        doc.docReference
      );
      refLabel = refDoc
        ? `${refDoc.documentType} — ${refDoc.documentNumber}`
        : doc.docReference;
    }

    const amountLines: string[] = [];
    if (doc.taxableAmount !== null && doc.taxableAmount !== undefined) {
      amountLines.push(`  Taxable (Gross) : ₹${doc.taxableAmount.toFixed(2)}`);
    }
    if (doc.gstAmount !== null && doc.gstAmount !== undefined) {
      amountLines.push(`  GST             : ₹${doc.gstAmount.toFixed(2)}`);
    }
    if (
      doc.tdsDeductionAmount !== null &&
      doc.tdsDeductionAmount !== undefined
    ) {
      amountLines.push(
        `  TDS Deduction   : ₹${doc.tdsDeductionAmount.toFixed(2)}`
      );
    }
    if (doc.totalAmount !== null && doc.totalAmount !== undefined) {
      amountLines.push(`  Net Total       : ₹${doc.totalAmount.toFixed(2)}`);
    }

    const contextLabel =
      this.docContext() === 'sales' ? 'Contractor' : 'Vendor';

    const body = [
      `Dear Sir / Madam,`,
      ``,
      `Please find the details for the following document:`,
      ``,
      `  Document Type   : ${doc.documentType}`,
      `  Document Number : ${doc.documentNumber}`,
      `  Document Date   : ${doc.documentDate ?? '—'}`,
      `  ${contextLabel.padEnd(15)}: ${partyName}`,
      refLabel ? `  Reference Doc   : ${refLabel}` : '',
      ``,
      `Amount Details:`,
      ...amountLines,
      ``,
      doc.remark ? `Remarks: ${doc.remark}` : '',
      ``,
      doc.attachments?.length
        ? `${doc.attachments.length} attachment(s) are enclosed with this email.`
        : `No attachments for this document.`,
      ``,
      `Regards,`,
      `Eureka Enterprises`,
    ]
      .filter(l => l !== '')
      .join('\n');

    const files = doc.attachments ?? [];
    this.composeFiles.set(
      files.map(f => ({ file: f, url: URL.createObjectURL(f) }))
    );
    this.toEmails.set([]);
    this.ccEmails.set([]);
    this.toInput = '';
    this.ccInput = '';
    this.composeForm.reset({
      subject: `${doc.documentType} — ${doc.documentNumber}`,
      body,
    });
    this.composeOpen.set(true);
    this.cdr.markForCheck();
  }

  protected closeMailCompose(): void {
    this.composeFiles().forEach(f => URL.revokeObjectURL(f.url));
    this.composeFiles.set([]);
    this.composeOpen.set(false);
    this.composeForm.reset();
    this.toEmails.set([]);
    this.ccEmails.set([]);
  }

  protected addEmail(field: 'to' | 'cc', el: HTMLInputElement): void {
    const val = el.value.trim();
    if (!val) {
      return;
    }
    if (field === 'to') {
      this.toEmails.update(arr => [...arr, val]);
      this.toInput = '';
    } else {
      this.ccEmails.update(arr => [...arr, val]);
      this.ccInput = '';
    }
    el.value = '';
  }

  protected removeEmail(field: 'to' | 'cc', index: number): void {
    if (field === 'to') {
      this.toEmails.update(arr => arr.filter((_, i) => i !== index));
    } else {
      this.ccEmails.update(arr => arr.filter((_, i) => i !== index));
    }
  }

  protected removeComposeFile(index: number): void {
    const f = this.composeFiles()[index];
    if (f) {
      URL.revokeObjectURL(f.url);
    }
    this.composeFiles.update(arr => arr.filter((_, i) => i !== index));
  }

  protected sendMail(): void {
    if (this.toEmails().length === 0 || this.composeForm.invalid) {
      this.composeForm.markAllAsTouched();
      return;
    }
    const { subject, body } = this.composeForm.getRawValue();
    this.mailSending.set(true);
    this.mailService
      .sendMail({
        to: this.toEmails(),
        cc: this.ccEmails(),
        subject: subject ?? '',
        body: body ?? '',
        attachments: this.composeFiles().map(f => f.file),
      })
      .pipe(
        finalize(() => {
          this.mailSending.set(false);
          this.cdr.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: res => {
          this.notificationService.success(
            res.message ?? 'Email sent successfully'
          );
          this.closeMailCompose();
        },
      });
  }
}
