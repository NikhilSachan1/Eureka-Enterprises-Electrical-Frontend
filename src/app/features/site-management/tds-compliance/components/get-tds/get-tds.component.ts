import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import {
  DocIndexedDbService,
  IDocIndexedDbRow,
} from '../../../doc-management/services/doc-indexed-db.service';
import { EDocType } from '../../../doc-management/types/doc.enum';
import { AppConfigurationService } from '@shared/services';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';

/** One invoice line with TDS booked on linked payment drafts */
export interface IBillingTdsRow {
  invoiceId: string;
  billNo: string;
  billDate: string | null;
  taxableAmount: number;
  totalAmount: number;
  /** Sum of `tdsDeductionAmount` on all PAYMENT rows for this invoice */
  tdsDeducted: number;
  effectiveTdsRatePct: number;
}

export interface IPartyTdsBucket {
  partyKey: string;
  partyName: string;
  bills: IBillingTdsRow[];
  taxableTotal: number;
  tdsTotal: number;
}

export interface IMonthTdsData {
  monthKey: string;
  monthLabel: string;
  salesByParty: IPartyTdsBucket[];
  purchaseByParty: IPartyTdsBucket[];
  outwardTaxable: number;
  inwardTaxable: number;
  outwardTds: number;
  inwardTds: number;
  salesInvoiceCount: number;
  purchaseInvoiceCount: number;
  showMonthlyBilling: boolean;
}

@Component({
  selector: 'app-get-tds',
  imports: [CurrencyPipe, DatePipe, DecimalPipe, CardModule],
  templateUrl: './get-tds.component.html',
  styleUrl: './get-tds.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetTdsComponent implements OnInit {
  private readonly docIndexedDbService = inject(DocIndexedDbService);
  private readonly appConfigService = inject(AppConfigurationService);
  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly monthlyData = signal<IMonthTdsData[]>([]);
  protected readonly loading = signal(true);

  ngOnInit(): void {
    void this.loadTdsData();
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

  protected monthlyBillCount(row: IMonthTdsData): number {
    return (
      row.salesByParty.reduce((s, p) => s + p.bills.length, 0) +
      row.purchaseByParty.reduce((s, p) => s + p.bills.length, 0)
    );
  }

  protected get grandTotals(): {
    outwardTds: number;
    inwardTds: number;
    outwardTaxable: number;
    inwardTaxable: number;
    salesInvoiceTotal: number;
    purchaseInvoiceTotal: number;
  } {
    return this.monthlyData().reduce(
      (acc, r) => ({
        outwardTds: acc.outwardTds + r.outwardTds,
        inwardTds: acc.inwardTds + r.inwardTds,
        outwardTaxable: acc.outwardTaxable + r.outwardTaxable,
        inwardTaxable: acc.inwardTaxable + r.inwardTaxable,
        salesInvoiceTotal: acc.salesInvoiceTotal + r.salesInvoiceCount,
        purchaseInvoiceTotal: acc.purchaseInvoiceTotal + r.purchaseInvoiceCount,
      }),
      {
        outwardTds: 0,
        inwardTds: 0,
        outwardTaxable: 0,
        inwardTaxable: 0,
        salesInvoiceTotal: 0,
        purchaseInvoiceTotal: 0,
      }
    );
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

  /** Sum TDS from payment drafts linked to each invoice id */
  private buildTdsByInvoiceMap(
    allDocs: IDocIndexedDbRow[]
  ): Map<string, number> {
    const m = new Map<string, number>();
    for (const d of allDocs) {
      if (d.documentType === EDocType.PAYMENT && d.docReference) {
        const t = d.tdsDeductionAmount ?? 0;
        if (t > 0) {
          const id = d.docReference;
          m.set(id, (m.get(id) ?? 0) + t);
        }
      }
    }
    return m;
  }

  private buildBillingRow(
    inv: IDocIndexedDbRow,
    tdsByInvoice: Map<string, number>
  ): IBillingTdsRow {
    const taxable = inv.taxableAmount ?? 0;
    const gst = inv.gstAmount ?? 0;
    const total = inv.totalAmount ?? taxable + gst;
    const tds = tdsByInvoice.get(inv.id) ?? 0;
    const effectiveTdsRatePct =
      taxable > 0 ? Math.round((tds / taxable) * 10000) / 100 : 0;
    return {
      invoiceId: inv.id,
      billNo: inv.documentNumber,
      billDate: inv.documentDate,
      taxableAmount: taxable,
      totalAmount: total,
      tdsDeducted: tds,
      effectiveTdsRatePct,
    };
  }

  private partyBucketsForMonth(
    invoices: IDocIndexedDbRow[],
    mode: 'sales' | 'purchase',
    contractorList: ReturnType<AppConfigurationService['contractorList']>,
    tdsByInvoice: Map<string, number>
  ): IPartyTdsBucket[] {
    const byParty = new Map<string, IDocIndexedDbRow[]>();
    for (const inv of invoices) {
      const rawId = mode === 'sales' ? inv.contractorName : inv.vendorName;
      const key = rawId ?? '__none__';
      const list = byParty.get(key) ?? [];
      list.push(inv);
      byParty.set(key, list);
    }

    const buckets: IPartyTdsBucket[] = [];
    for (const [partyKey, list] of byParty) {
      const bills = list.map(i => this.buildBillingRow(i, tdsByInvoice));
      const taxableTotal = bills.reduce((s, b) => s + b.taxableAmount, 0);
      const tdsTotal = bills.reduce((s, b) => s + b.tdsDeducted, 0);
      const partyName =
        partyKey === '__none__'
          ? '—'
          : this.resolvePartyName(partyKey, contractorList);
      buckets.push({
        partyKey,
        partyName,
        bills,
        taxableTotal,
        tdsTotal,
      });
    }
    return buckets.sort((a, b) => a.partyName.localeCompare(b.partyName, 'en'));
  }

  private async loadTdsData(): Promise<void> {
    const allDocs = await this.docIndexedDbService.getAllDocs();
    const contractorList = this.appConfigService.contractorList();
    const tdsByInvoice = this.buildTdsByInvoiceMap(allDocs);

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

    const rows: IMonthTdsData[] = sorted.map(key => {
      const salesList = monthSalesMap.get(key) ?? [];
      const purchaseList = monthPurchaseMap.get(key) ?? [];

      const salesByParty = this.partyBucketsForMonth(
        salesList,
        'sales',
        contractorList,
        tdsByInvoice
      );
      const purchaseByParty = this.partyBucketsForMonth(
        purchaseList,
        'purchase',
        contractorList,
        tdsByInvoice
      );

      const outwardTaxable = salesList.reduce(
        (s, i) => s + (i.taxableAmount ?? 0),
        0
      );
      const inwardTaxable = purchaseList.reduce(
        (s, i) => s + (i.taxableAmount ?? 0),
        0
      );
      const outwardTds = salesByParty.reduce((s, p) => s + p.tdsTotal, 0);
      const inwardTds = purchaseByParty.reduce((s, p) => s + p.tdsTotal, 0);

      return {
        monthKey: key,
        monthLabel: this.monthLabel(key),
        salesByParty,
        purchaseByParty,
        outwardTaxable,
        inwardTaxable,
        outwardTds,
        inwardTds,
        salesInvoiceCount: salesList.length,
        purchaseInvoiceCount: purchaseList.length,
        showMonthlyBilling: salesList.length > 0 || purchaseList.length > 0,
      };
    });

    this.monthlyData.set(rows);
    this.loading.set(false);
    this.cdr.markForCheck();
  }
}
