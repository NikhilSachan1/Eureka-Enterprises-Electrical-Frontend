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
} from '@angular/core';
import {
  AppConfigurationService,
  ConfirmationDialogService,
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
import { CurrencyPipe } from '@angular/common';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { DialogModule } from 'primeng/dialog';
import { SplitButtonModule } from 'primeng/splitbutton';
import { CardModule } from 'primeng/card';
import { MenuItem } from 'primeng/api';
import { DOC_ADD_BUTTON_CONFIG_MAP } from '../../config/dialog/get-doc.config';
import { EDocType } from '../../types/doc.enum';
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
  invoicedAmount: number;
  receivedAmount: number;
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
    CardModule,
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
  private readonly cdr = inject(ChangeDetectorRef);

  readonly docContext = input<'sales' | 'purchase'>('sales');

  protected table!: IEnhancedTable;
  protected addDocumentSplitItems: MenuItem[] = [];
  protected readonly poSummaryRows = signal<IPoSummaryRow[]>([]);
  protected readonly showPoSummary = signal(true);

  protected readonly amountTmpl = viewChild<TemplateRef<unknown>>('amountTmpl');
  protected get customBodyTemplates(): Record<string, TemplateRef<unknown>> {
    const tmpl = this.amountTmpl();
    return tmpl ? { amountBreakdown: tmpl } : {};
  }

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
    this.loadIndexedDbDocs();
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

    if (dialogType === EDocType.PAYMENT_ADVICE) {
      if (this.docContext() === 'purchase') {
        dialogConfig.dialogConfig = {
          ...dialogConfig.dialogConfig,
          header: 'Generate Payment Advice',
          message: 'Fill and generate the payment advice details.',
        };
      }
    }

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
    const advices = byType(EDocType.PAYMENT_ADVICE);

    const rows: IPoSummaryRow[] = pos.map(po => {
      const poJmcs = jmcs.filter(j => j.docReference === po.id);
      const jmcIds = new Set(poJmcs.map(j => j.id));

      const poReports = reports.filter(r => jmcIds.has(r.docReference ?? ''));
      const poInvoices = invoices.filter(i => jmcIds.has(i.docReference ?? ''));
      const invoiceIds = new Set(poInvoices.map(i => i.id));

      const poPayments = payments.filter(p =>
        invoiceIds.has(p.docReference ?? '')
      );
      const paymentIds = new Set(poPayments.map(p => p.id));

      const poAdvices = advices.filter(a =>
        paymentIds.has(a.docReference ?? '')
      );

      const invoicedAmount = poInvoices.reduce(
        (s, i) => s + (i.totalAmount ?? 0),
        0
      );
      const receivedAmount = poPayments.reduce(
        (s, p) => s + (p.totalAmount ?? 0),
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
        invoicedAmount,
        receivedAmount,
        paymentAdviceCount: poAdvices.length,
        balance: (po.totalAmount ?? 0) - invoicedAmount,
      };
    });

    this.poSummaryRows.set(rows);
  }

  protected get summaryTotals(): {
    poValue: number;
    invoicedAmount: number;
    receivedAmount: number;
    balance: number;
  } {
    return this.poSummaryRows().reduce(
      (acc, r) => ({
        poValue: acc.poValue + r.poValue,
        invoicedAmount: acc.invoicedAmount + r.invoicedAmount,
        receivedAmount: acc.receivedAmount + r.receivedAmount,
        balance: acc.balance + r.balance,
      }),
      { poValue: 0, invoicedAmount: 0, receivedAmount: 0, balance: 0 }
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

    return {
      id: row.id,
      contractorName: partyName,
      documentType: row.documentType,
      documentNumber: row.documentNumber,
      referenceDocument: refDoc ? refDoc.documentType : null,
      referenceDocumentName: refDoc ? refDoc.documentType : null,
      referenceDocumentNumber: refDoc ? refDoc.documentNumber : null,
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
        label: 'Add Payment',
        command: (): void => this.openAddDocDialog(EDocType.PAYMENT),
      },
    ];

    const paymentAdviceLabel =
      this.docContext() === 'purchase'
        ? 'Generate Payment Advice'
        : 'Add Payment Advice';
    items.push({
      label: paymentAdviceLabel,
      command: (): void => this.openAddDocDialog(EDocType.PAYMENT_ADVICE),
    });

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
}
