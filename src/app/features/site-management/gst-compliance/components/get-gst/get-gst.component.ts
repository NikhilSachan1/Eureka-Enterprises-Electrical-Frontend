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
  /** Purchase: local GST deposit verify record (date + status); sales outward unused */
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
  /** Sales — unused for verify workflow */
  salesGstPaidCount: number;
  /** Purchase invoices this month (counterparty outward / your ITC bill) */
  purchaseInvoiceCount: number;
  /** Purchase bills with GST deposit **Verified** (local) */
  purchaseGstPaidCount: number;
  showMonthlyBilling: boolean;
  /** Sum of purchase GST payment release doc amounts for this month (paid to govt). */
  gstReleasedToGovt: number;
  /** Net 3B liability remaining after GST releases (≥ 0). */
  gstNetRemaining: number;
}

const GST_INVOICE_PORTAL_PAYMENT_DIALOG_CONFIG: IDialogActionConfig = {
  dialogConfig: {
    ...PLAIN_CONFIRMATION_DIALOG_CONFIG,
    header: 'Verify GST deposit',
    message: 'Pick the verification date — then click Save below.',
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
  /**
   * Purchase GST payment release row picks: key `monthKey|partyKey` → invoice ids (verified + still unremitted to govt).
   */
  protected readonly purchaseGstReleaseSelection = signal<
    Record<string, string[]>
  >({});

  ngOnInit(): void {
    void this.loadGstData();
  }

  /**
   * GST payment release — only from GST screen, **per month + contractor (party)** row.
   * `flow` maps to IndexedDB `docContext` (sales outward vs purchase / vendor).
   * For purchase, `verifiedBillsGstTotal` should be **govt GST still to remit** (verified bills minus already released).
   */
  protected openGstPaymentReleaseForParty(
    monthKey: string,
    monthLabel: string,
    partyName: string,
    selectedUnremittedGstTotal: number,
    partyKey: string,
    party: IPartyGstBucket,
    flow: IGstPartyFlow
  ): void {
    if (flow === 'sales') {
      return;
    }
    const sel = new Set(
      this.getPurchaseGstReleaseSelectedIds(monthKey, partyKey)
    );
    const allocationOrder = party.bills
      .filter(b => !!b.gstPayment && sel.has(b.invoiceId))
      .map(b => ({ invoiceId: b.invoiceId, gstAmount: b.gstAmount }));
    if (!allocationOrder.length) {
      return;
    }
    const dialogConfig: IDialogActionConfig = {
      ...DOC_ADD_BUTTON_CONFIG_MAP[EDocType.GST_PAYMENT_RELEASE],
    };
    const prefill =
      selectedUnremittedGstTotal > 0
        ? Math.round(selectedUnremittedGstTotal * 100) / 100
        : null;
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
      gstReleaseAllocationOrder: allocationOrder,
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

  /**
   * Per bill: ITC GST not yet counted toward a GST payment release (still to pay to govt).
   */
  protected billGstUnremittedToGovt(b: IBillingGstRow): number {
    const pay = b.gstPayment;
    if (!pay) {
      return 0;
    }
    const r = pay.gstRemittedAmount ?? 0;
    return Math.max(0, Math.round((b.gstAmount - r) * 100) / 100);
  }

  /** Sum of `billGstUnremittedToGovt` for the party — prefill for GST payment release. */
  protected partyUnremittedGstForGovtTotal(party: IPartyGstBucket): number {
    const sum = party.bills.reduce(
      (s, b) => s + this.billGstUnremittedToGovt(b),
      0
    );
    return Math.round(sum * 100) / 100;
  }

  private gstReleaseSelectionKey(monthKey: string, partyKey: string): string {
    return `${monthKey}|${partyKey}`;
  }

  private getPurchaseGstReleaseSelectedIds(
    monthKey: string,
    partyKey: string
  ): string[] {
    const key = this.gstReleaseSelectionKey(monthKey, partyKey);
    return this.purchaseGstReleaseSelection()[key] ?? [];
  }

  /** Sum of unremitted govt GST for **checked** verified rows only. */
  protected partySelectedUnremittedGstForGovtTotal(
    monthKey: string,
    party: IPartyGstBucket
  ): number {
    const sel = new Set(
      this.getPurchaseGstReleaseSelectedIds(monthKey, party.partyKey)
    );
    const sum = party.bills.reduce((s, b) => {
      if (!b.gstPayment || !sel.has(b.invoiceId)) {
        return s;
      }
      return s + this.billGstUnremittedToGovt(b);
    }, 0);
    return Math.round(sum * 100) / 100;
  }

  protected isPurchaseRowSelectedForRelease(
    monthKey: string,
    partyKey: string,
    invoiceId: string
  ): boolean {
    return this.getPurchaseGstReleaseSelectedIds(monthKey, partyKey).includes(
      invoiceId
    );
  }

  /** Verified + still has govt GST to remit — eligible for release checkbox. */
  protected canSelectRowForGstRelease(b: IBillingGstRow): boolean {
    return !!b.gstPayment && this.billGstUnremittedToGovt(b) > 0.0001;
  }

  protected togglePurchaseGstReleaseRow(
    monthKey: string,
    partyKey: string,
    invoiceId: string,
    checked: boolean
  ): void {
    const key = this.gstReleaseSelectionKey(monthKey, partyKey);
    this.purchaseGstReleaseSelection.update(map => {
      const prev = new Set(map[key] ?? []);
      if (checked) {
        prev.add(invoiceId);
      } else {
        prev.delete(invoiceId);
      }
      const next = { ...map, [key]: [...prev] };
      if (next[key].length === 0) {
        delete next[key];
      }
      return next;
    });
    this.cdr.markForCheck();
  }

  private prunePurchaseGstReleaseSelection(rows: IMonthGstData[]): void {
    this.purchaseGstReleaseSelection.update(map => {
      const next: Record<string, string[]> = {};
      for (const row of rows) {
        for (const party of row.purchaseByParty) {
          const key = this.gstReleaseSelectionKey(row.monthKey, party.partyKey);
          const allowed = new Set(
            party.bills
              .filter(
                b => !!b.gstPayment && this.billGstUnremittedToGovt(b) > 0.0001
              )
              .map(b => b.invoiceId)
          );
          const prev = map[key] ?? [];
          const kept = prev.filter(id => allowed.has(id));
          if (kept.length > 0) {
            next[key] = kept;
          }
        }
      }
      return next;
    });
  }

  /** All bills in this party/month are **Verified**. */
  protected partyGstFullyVerified(party: IPartyGstBucket): boolean {
    return this.gstPortalPaymentStorage.partyGstFullyVerified(party);
  }

  /**
   * GST payment release when at least one **selected** verified row still has govt GST to remit.
   * Purchase only — sales is view-only.
   */
  protected canOpenGstPaymentReleaseForParty(
    party: IPartyGstBucket,
    monthKey: string,
    flow: IGstPartyFlow
  ): boolean {
    if (flow === 'sales') {
      return false;
    }
    if (party.partyKey === '__none__') {
      return false;
    }
    return (
      this.partySelectedUnremittedGstForGovtTotal(monthKey, party) > 0.0001
    );
  }

  /**
   * Purchase GST payment release belongs to this GST screen month (`GST bucket:` in remark, else document date month).
   */
  private gstReleaseDocMatchesMonth(
    r: IDocIndexedDbRow,
    rowMonthKey: string
  ): boolean {
    if (
      r.documentType !== EDocType.GST_PAYMENT_RELEASE ||
      r.docContext !== 'purchase'
    ) {
      return false;
    }
    const m = r.remark?.match(/GST bucket:\s*(\d{4}-\d{2})/i);
    if (m?.[1]) {
      return m[1] === rowMonthKey;
    }
    return this.monthKey(r.documentDate) === rowMonthKey;
  }

  private purchaseGstReleasePaidTotalForMonth(
    monthKey: string,
    allDocs: IDocIndexedDbRow[]
  ): number {
    return allDocs
      .filter(d => this.gstReleaseDocMatchesMonth(d, monthKey))
      .reduce((s, d) => s + (d.totalAmount ?? 0), 0);
  }

  /** IndexedDB: release row matches party + month. */
  private purchaseGstReleaseMatchesPartyMonth(
    r: IDocIndexedDbRow,
    rowMonthKey: string,
    partyKey: string
  ): boolean {
    return (
      this.gstReleaseDocMatchesMonth(r, rowMonthKey) &&
      r.vendorName === partyKey
    );
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

      const gstReleasedToGovt = this.purchaseGstReleasePaidTotalForMonth(
        key,
        allDocs
      );
      const gstNetRemaining = Math.max(0, netPayable - gstReleasedToGovt);

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
        gstReleasedToGovt,
        gstNetRemaining,
        /** Open by default so per-invoice GST payment actions stay visible */
        showMonthlyBilling: salesList.length > 0 || purchaseList.length > 0,
      };
    });

    this.gstPortalPaymentStorage.hydratePartyGstAdviceFromVerifiedBuckets(rows);
    const enriched = this.enrichPurchasePartyGstRelease(rows, allDocs);
    this.monthlyData.set(enriched);
    this.prunePurchaseGstReleaseSelection(enriched);
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

  /** Opens verify / edit verification date for one bill’s GST deposit. */
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
    gstReleasedToGovt: number;
    gstNetRemaining: number;
    salesInvoicePaid: number;
    salesInvoicePending: number;
    salesInvoiceTotal: number;
    purchaseInvoicePaid: number;
    purchaseInvoicePending: number;
    purchaseInvoiceTotal: number;
    /** Purchase bills verified (local GST deposit) */
    allGstPaymentsRecorded: number;
    /** Purchase bills still pending verify */
    allGstPaymentsPending: number;
  } {
    return this.monthlyData().reduce(
      (acc, r) => ({
        outwardGst: acc.outwardGst + r.outwardGst,
        itcGst: acc.itcGst + r.itcGst,
        netPayable: acc.netPayable + r.netPayable,
        gstReleasedToGovt: acc.gstReleasedToGovt + r.gstReleasedToGovt,
        gstNetRemaining: acc.gstNetRemaining + r.gstNetRemaining,
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
        gstReleasedToGovt: 0,
        gstNetRemaining: 0,
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
