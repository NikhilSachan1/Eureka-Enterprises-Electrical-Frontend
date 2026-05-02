import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { CardModule } from 'primeng/card';
import {
  DocIndexedDbService,
  IDocIndexedDbRow,
} from '../../../doc-management/services/doc-indexed-db.service';
import { EDocType } from '../../../doc-management/types/doc.enum';
import { DOC_ADD_BUTTON_CONFIG_MAP } from '../../../doc-management/config/dialog/get-doc.config';
import {
  AppConfigurationService,
  ConfirmationDialogService,
} from '@shared/services';
import { EButtonActionType, IDialogActionConfig } from '@shared/types';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { PLAIN_CONFIRMATION_DIALOG_CONFIG } from '@shared/config';
import {
  GstPortalPaymentStorageService,
  IGstInvoicePaymentRecord,
  IGstPartyFlow,
} from '../../services/gst-portal-payment-storage.service';
import { GstInvoicePortalPaymentDialogComponent } from '../gst-invoice-portal-payment-dialog/gst-invoice-portal-payment-dialog.component';

/** Single invoice / bill line for monthly GST grid */
export interface IBillingGstRow {
  invoiceId: string;
  billNo: string;
  billDate: string | null;
  taxableAmount: number;
  gstAmount: number;
  totalAmount: number;
  effectiveGstRatePct: number;
  /** Only populated for sales outward rows — GST portal payment tracking */
  gstPayment: IGstInvoicePaymentRecord | null;
}

/** Party-wise bucket within a month */
export interface IPartyGstBucket {
  partyKey: string;
  partyName: string;
  bills: IBillingGstRow[];
  taxableTotal: number;
  gstTotal: number;
  /** Set when a purchase GST_PAYMENT_RELEASE exists for this party + month bucket. */
  gstReleaseDocumentNumber?: string | null;
  /** Auto Payment Advice linked to that release (IndexedDB). */
  gstReleaseAdviceNumber?: string | null;
}

export interface IMonthGstData {
  monthKey: string;
  monthLabel: string;
  salesByParty: IPartyGstBucket[];
  purchaseByParty: IPartyGstBucket[];
  outwardTaxable: number;
  outwardGst: number;
  inwardTaxable: number;
  itcGst: number;
  netPayable: number;
  /** Count of sales invoices in this month */
  salesInvoiceCount: number;
  /** Sales invoices with GST payment recorded */
  salesGstPaidCount: number;
  /** Purchase invoices this month (counterparty outward / your ITC bill) */
  purchaseInvoiceCount: number;
  /** Purchase invoices with GST-to-govt payment recorded */
  purchaseGstPaidCount: number;
  showMonthlyBilling: boolean;
}

const GST_INVOICE_PORTAL_PAYMENT_DIALOG_CONFIG: IDialogActionConfig = {
  dialogConfig: {
    ...PLAIN_CONFIRMATION_DIALOG_CONFIG,
    header: 'Record GST portal payment',
    message: 'Enter UTR, payment date, and proof — then click Save below.',
  },
  dynamicComponent: GstInvoicePortalPaymentDialogComponent,
};

@Component({
  selector: 'app-get-gst',
  imports: [CurrencyPipe, DatePipe, DecimalPipe, NgClass, CardModule],
  templateUrl: './get-gst.component.html',
  styleUrl: './get-gst.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetGstComponent implements OnInit {
  private readonly docIndexedDbService = inject(DocIndexedDbService);
  private readonly appConfigService = inject(AppConfigurationService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly gstPortalPaymentStorage = inject(
    GstPortalPaymentStorageService
  );
  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly monthlyData = signal<IMonthGstData[]>([]);
  protected readonly loading = signal(true);

  ngOnInit(): void {
    void this.loadGstData();
  }

  /**
   * GST payment release — only from GST screen, **per month + contractor (party)** row.
   * `flow` maps to IndexedDB `docContext` (sales outward vs purchase / vendor).
   */
  protected openGstPaymentReleaseForParty(
    monthKey: string,
    monthLabel: string,
    partyName: string,
    partyGstTotal: number,
    partyKey: string,
    flow: IGstPartyFlow
  ): void {
    if (flow === 'sales') {
      return;
    }
    const dialogConfig: IDialogActionConfig = {
      ...DOC_ADD_BUTTON_CONFIG_MAP[EDocType.GST_PAYMENT_RELEASE],
    };
    const prefill =
      partyGstTotal > 0 ? Math.round(partyGstTotal * 100) / 100 : null;
    const contextLabel = `${monthLabel} — ${partyName}`;
    const dynamicComponentInputs: Record<string, unknown> = {
      selectedRecord: [],
      docContext: flow,
      onSuccess: (): void => {
        void this.loadGstData();
      },
      gstReleaseContextLabel: contextLabel,
      prefilledPartyKey: partyKey,
      prefilledMonthKey: monthKey,
    };
    if (prefill !== null && prefill !== undefined && prefill > 0) {
      dynamicComponentInputs['prefilledGstAmount'] = prefill;
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

  /** Bills in this party with GST portal payment recorded (UTR + date + proof path). */
  protected partyGstRecordedCount(party: IPartyGstBucket): number {
    return party.bills.filter(b => !!b.gstPayment).length;
  }

  /** All bills under this party/month bucket have payment recorded — unlocks party advice + GST release. */
  protected partyGstFullyVerified(party: IPartyGstBucket): boolean {
    return this.gstPortalPaymentStorage.partyGstFullyVerified(party);
  }

  /** GST payment release only after every bill in this party is verified; needs a resolvable party. (Purchase only — sales is view-only.) */
  protected canOpenGstPaymentReleaseForParty(
    party: IPartyGstBucket,
    flow: IGstPartyFlow
  ): boolean {
    if (flow === 'sales') {
      return false;
    }
    if (party.partyKey === '__none__' || !this.partyGstFullyVerified(party)) {
      return false;
    }
    return !party.gstReleaseDocumentNumber;
  }

  /** IndexedDB: release row matches GST screen month (remark `GST bucket:` or legacy payment-date month). */
  private purchaseGstReleaseMatchesPartyMonth(
    r: IDocIndexedDbRow,
    rowMonthKey: string,
    partyKey: string
  ): boolean {
    if (
      r.documentType !== EDocType.GST_PAYMENT_RELEASE ||
      r.docContext !== 'purchase' ||
      r.vendorName !== partyKey
    ) {
      return false;
    }
    const m = r.remark?.match(/GST bucket:\s*(\d{4}-\d{2})/i);
    if (m?.[1]) {
      return m[1] === rowMonthKey;
    }
    return this.monthKey(r.documentDate) === rowMonthKey;
  }

  private findLatestPurchaseGstReleaseForPartyMonth(
    releases: IDocIndexedDbRow[],
    monthKey: string,
    partyKey: string
  ): IDocIndexedDbRow | null {
    const matches = releases.filter(r =>
      this.purchaseGstReleaseMatchesPartyMonth(r, monthKey, partyKey)
    );
    if (!matches.length) {
      return null;
    }
    matches.sort((a, b) => {
      const ca = Date.parse(a.createdAt ?? '') || 0;
      const cb = Date.parse(b.createdAt ?? '') || 0;
      if (cb !== ca) {
        return cb - ca;
      }
      return (b.id ?? '').localeCompare(a.id ?? '');
    });
    return matches[0];
  }

  private enrichPurchasePartyGstRelease(
    rows: IMonthGstData[],
    allDocs: IDocIndexedDbRow[]
  ): IMonthGstData[] {
    const releases = allDocs.filter(
      d =>
        d.documentType === EDocType.GST_PAYMENT_RELEASE &&
        d.docContext === 'purchase'
    );
    const adviceByReleaseId = new Map<string, IDocIndexedDbRow>();
    for (const d of allDocs) {
      if (
        d.documentType === EDocType.PAYMENT_ADVICE &&
        d.docContext === 'purchase' &&
        d.docReference
      ) {
        adviceByReleaseId.set(d.docReference, d);
      }
    }
    return rows.map(row => ({
      ...row,
      purchaseByParty: row.purchaseByParty.map(party => {
        const rel = this.findLatestPurchaseGstReleaseForPartyMonth(
          releases,
          row.monthKey,
          party.partyKey
        );
        const pa = rel ? adviceByReleaseId.get(rel.id) : undefined;
        return {
          ...party,
          gstReleaseDocumentNumber: rel?.documentNumber ?? null,
          gstReleaseAdviceNumber: pa?.documentNumber ?? null,
        };
      }),
    }));
  }

  protected partyGstVerificationLabel(party: IPartyGstBucket): string {
    const n = party.bills.length;
    const done = this.partyGstRecordedCount(party);
    return `${done} / ${n} bill${n === 1 ? '' : 's'}`;
  }

  protected partyInvoiceIds(party: IPartyGstBucket): string[] {
    return party.bills.map(b => b.invoiceId);
  }

  private monthKey(dateStr: string | null): string {
    if (!dateStr) {
      return 'unknown';
    }
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  private monthLabel(key: string): string {
    if (key === 'unknown') {
      return 'Unknown Month';
    }
    const [year, month] = key.split('-');
    return new Date(Number(year), Number(month) - 1, 1).toLocaleString(
      'en-IN',
      { month: 'long', year: 'numeric' }
    );
  }

  private resolvePartyName(
    partyId: string | null,
    contractorList: ReturnType<AppConfigurationService['contractorList']>
  ): string {
    if (!partyId) {
      return '—';
    }
    if (contractorList.length) {
      return String(
        getMappedValueFromArrayOfObjects(contractorList, partyId as never)
      );
    }
    return partyId;
  }

  private buildBillingRow(
    inv: IDocIndexedDbRow,
    payments: Record<string, IGstInvoicePaymentRecord>,
    attachGstPayment: boolean
  ): IBillingGstRow {
    const taxable = inv.taxableAmount ?? 0;
    const gst = inv.gstAmount ?? 0;
    const total = inv.totalAmount ?? taxable + gst;
    const effectiveGstRatePct =
      taxable > 0 ? Math.round((gst / taxable) * 10000) / 100 : 0;
    return {
      invoiceId: inv.id,
      billNo: inv.documentNumber,
      billDate: inv.documentDate,
      taxableAmount: taxable,
      gstAmount: gst,
      totalAmount: total,
      effectiveGstRatePct,
      gstPayment: attachGstPayment ? (payments[inv.id] ?? null) : null,
    };
  }

  private partyBucketsForMonth(
    invoices: IDocIndexedDbRow[],
    mode: 'sales' | 'purchase',
    contractorList: ReturnType<AppConfigurationService['contractorList']>,
    payments: Record<string, IGstInvoicePaymentRecord>,
    attachGstPayment: boolean
  ): IPartyGstBucket[] {
    const byParty = new Map<string, IDocIndexedDbRow[]>();
    for (const inv of invoices) {
      const rawId = mode === 'sales' ? inv.contractorName : inv.vendorName;
      const key = rawId ?? '__none__';
      const list = byParty.get(key) ?? [];
      list.push(inv);
      byParty.set(key, list);
    }

    const buckets: IPartyGstBucket[] = [];

    for (const [partyKey, list] of byParty) {
      const bills = list.map(i =>
        this.buildBillingRow(i, payments, attachGstPayment)
      );
      const taxableTotal = bills.reduce((s, b) => s + b.taxableAmount, 0);
      const gstTotal = bills.reduce((s, b) => s + b.gstAmount, 0);
      const partyName =
        partyKey === '__none__'
          ? '—'
          : this.resolvePartyName(partyKey, contractorList);
      buckets.push({
        partyKey,
        partyName,
        bills,
        taxableTotal,
        gstTotal,
      });
    }
    return buckets.sort((a, b) => a.partyName.localeCompare(b.partyName, 'en'));
  }

  private async loadGstData(): Promise<void> {
    const allDocs = await this.docIndexedDbService.getAllDocs();
    const contractorList = this.appConfigService.contractorList();
    const payments = this.gstPortalPaymentStorage.getInvoicePayments();

    const salesInvoices = allDocs.filter(
      d => d.documentType === EDocType.INVOICE && d.docContext === 'sales'
    );
    const purchaseInvoices = allDocs.filter(
      d => d.documentType === EDocType.INVOICE && d.docContext === 'purchase'
    );

    const monthSalesMap = new Map<string, IDocIndexedDbRow[]>();
    const monthPurchaseMap = new Map<string, IDocIndexedDbRow[]>();

    for (const inv of salesInvoices) {
      const key = this.monthKey(inv.documentDate);
      const arr = monthSalesMap.get(key) ?? [];
      arr.push(inv);
      monthSalesMap.set(key, arr);
    }
    for (const inv of purchaseInvoices) {
      const key = this.monthKey(inv.documentDate);
      const arr = monthPurchaseMap.get(key) ?? [];
      arr.push(inv);
      monthPurchaseMap.set(key, arr);
    }

    const allKeys = new Set([
      ...monthSalesMap.keys(),
      ...monthPurchaseMap.keys(),
    ]);
    const sorted = [...allKeys]
      .filter(k => k !== 'unknown')
      .sort()
      .reverse();
    if (allKeys.has('unknown')) {
      sorted.push('unknown');
    }

    const rows: IMonthGstData[] = sorted.map(key => {
      const salesList = monthSalesMap.get(key) ?? [];
      const purchaseList = monthPurchaseMap.get(key) ?? [];

      const salesByParty = this.partyBucketsForMonth(
        salesList,
        'sales',
        contractorList,
        payments,
        true
      );
      const purchaseByParty = this.partyBucketsForMonth(
        purchaseList,
        'purchase',
        contractorList,
        payments,
        true
      );

      const outwardTaxable = salesList.reduce(
        (s, i) => s + (i.taxableAmount ?? 0),
        0
      );
      const outwardGst = salesList.reduce((s, i) => s + (i.gstAmount ?? 0), 0);
      const inwardTaxable = purchaseList.reduce(
        (s, i) => s + (i.taxableAmount ?? 0),
        0
      );
      const itcGst = purchaseList.reduce((s, i) => s + (i.gstAmount ?? 0), 0);
      const netPayable = Math.max(0, outwardGst - itcGst);

      const salesInvoiceCount = salesList.length;
      const salesGstPaidCount = salesList.filter(
        inv => !!payments[inv.id]
      ).length;
      const purchaseInvoiceCount = purchaseList.length;
      const purchaseGstPaidCount = purchaseList.filter(
        inv => !!payments[inv.id]
      ).length;

      return {
        monthKey: key,
        monthLabel: this.monthLabel(key),
        salesByParty,
        purchaseByParty,
        outwardTaxable,
        outwardGst,
        inwardTaxable,
        itcGst,
        netPayable,
        salesInvoiceCount,
        salesGstPaidCount,
        purchaseInvoiceCount,
        purchaseGstPaidCount,
        /** Open by default so per-invoice GST payment actions stay visible */
        showMonthlyBilling: salesList.length > 0 || purchaseList.length > 0,
      };
    });

    this.gstPortalPaymentStorage.hydratePartyGstAdviceFromVerifiedBuckets(rows);
    this.monthlyData.set(this.enrichPurchasePartyGstRelease(rows, allDocs));
    this.loading.set(false);
    this.cdr.markForCheck();
  }

  protected monthlyBillCount(row: IMonthGstData): number {
    return (
      row.salesByParty.reduce((s, p) => s + p.bills.length, 0) +
      row.purchaseByParty.reduce((s, p) => s + p.bills.length, 0)
    );
  }

  /** Purchase bills: GST portal UTR tracking; sales outward is view-only (no UTR workflow). */
  protected monthGstPortalTrackingComplete(row: IMonthGstData): boolean {
    return (
      row.purchaseInvoiceCount === 0 ||
      row.purchaseGstPaidCount === row.purchaseInvoiceCount
    );
  }

  protected toggleMonthlyBilling(monthKey: string): void {
    this.monthlyData.update(list =>
      list.map(r =>
        r.monthKey === monthKey
          ? { ...r, showMonthlyBilling: !r.showMonthlyBilling }
          : r
      )
    );
  }

  /** Opens popup to record / edit GST portal payment (UTR, date, proof) for one bill. */
  protected openGstPaymentForm(
    monthKey: string,
    monthLabel: string,
    partyName: string,
    bill: IBillingGstRow,
    partyKey: string,
    flow: IGstPartyFlow
  ): void {
    if (flow === 'sales') {
      return;
    }
    this.monthlyData.update(list =>
      list.map(r =>
        r.monthKey === monthKey ? { ...r, showMonthlyBilling: true } : r
      )
    );
    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.SUBMIT,
      GST_INVOICE_PORTAL_PAYMENT_DIALOG_CONFIG,
      null,
      false,
      false,
      {
        monthLabel,
        partyName,
        monthKey,
        invoiceId: bill.invoiceId,
        billNo: bill.billNo,
        gstAmount: bill.gstAmount,
        partyKey,
        flow,
        existingRecord: bill.gstPayment,
        onSuccess: (): void => {
          void this.loadGstData();
        },
      }
    );
    this.cdr.markForCheck();
  }

  protected clearInvoiceGstPayment(
    invoiceId: string,
    monthKey: string,
    partyKey: string,
    flow: IGstPartyFlow,
    partyInvoiceIds: string[]
  ): void {
    if (flow === 'sales') {
      return;
    }
    this.gstPortalPaymentStorage.clearInvoicePortalPayment(
      invoiceId,
      monthKey,
      partyKey,
      flow,
      partyInvoiceIds
    );
    void this.loadGstData();
  }

  protected get grandTotals(): {
    outwardGst: number;
    itcGst: number;
    netPayable: number;
    salesInvoicePaid: number;
    salesInvoicePending: number;
    salesInvoiceTotal: number;
    purchaseInvoicePaid: number;
    purchaseInvoicePending: number;
    purchaseInvoiceTotal: number;
    /** Bills (sales + purchase) with GST payment recorded */
    allGstPaymentsRecorded: number;
    /** Bills pending GST payment record */
    allGstPaymentsPending: number;
  } {
    return this.monthlyData().reduce(
      (acc, r) => ({
        outwardGst: acc.outwardGst + r.outwardGst,
        itcGst: acc.itcGst + r.itcGst,
        netPayable: acc.netPayable + r.netPayable,
        salesInvoicePaid: acc.salesInvoicePaid + r.salesGstPaidCount,
        salesInvoicePending:
          acc.salesInvoicePending + (r.salesInvoiceCount - r.salesGstPaidCount),
        salesInvoiceTotal: acc.salesInvoiceTotal + r.salesInvoiceCount,
        purchaseInvoicePaid: acc.purchaseInvoicePaid + r.purchaseGstPaidCount,
        purchaseInvoicePending:
          acc.purchaseInvoicePending +
          (r.purchaseInvoiceCount - r.purchaseGstPaidCount),
        purchaseInvoiceTotal: acc.purchaseInvoiceTotal + r.purchaseInvoiceCount,
        allGstPaymentsRecorded:
          acc.allGstPaymentsRecorded + r.purchaseGstPaidCount,
        allGstPaymentsPending:
          acc.allGstPaymentsPending +
          (r.purchaseInvoiceCount - r.purchaseGstPaidCount),
      }),
      {
        outwardGst: 0,
        itcGst: 0,
        netPayable: 0,
        salesInvoicePaid: 0,
        salesInvoicePending: 0,
        salesInvoiceTotal: 0,
        purchaseInvoicePaid: 0,
        purchaseInvoicePending: 0,
        purchaseInvoiceTotal: 0,
        allGstPaymentsRecorded: 0,
        allGstPaymentsPending: 0,
      }
    );
  }
}
