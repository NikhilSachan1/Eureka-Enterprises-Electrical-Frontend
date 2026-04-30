import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { CardModule } from 'primeng/card';
import { DocIndexedDbService } from '../../../doc-management/services/doc-indexed-db.service';
import { EDocType } from '../../../doc-management/types/doc.enum';
import { AppConfigurationService } from '@shared/services';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';

interface IGstr1Row {
  invoiceNo: string;
  invoiceDate: string | null;
  partyName: string;
  taxableAmount: number;
  gstAmount: number;
  totalAmount: number;
}

interface IGstPaymentRecord {
  utrNumber: string;
  paymentDate: string;
  proofFileName: string;
  savedAt: string;
}

interface IMonthGstData {
  monthKey: string;
  monthLabel: string;
  salesInvoices: IGstr1Row[];
  outwardTaxable: number;
  outwardGst: number;
  inwardTaxable: number;
  itcGst: number;
  netPayable: number;
  payment: IGstPaymentRecord | null;
  showInvoices: boolean;
}

const STORAGE_KEY = 'gst_payment_records_v2';

@Component({
  selector: 'app-get-gst',
  imports: [CurrencyPipe, DatePipe, CardModule, ReactiveFormsModule],
  templateUrl: './get-gst.component.html',
  styleUrl: './get-gst.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetGstComponent implements OnInit {
  private readonly docIndexedDbService = inject(DocIndexedDbService);
  private readonly appConfigService = inject(AppConfigurationService);
  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly monthlyData = signal<IMonthGstData[]>([]);
  protected readonly loading = signal(true);
  protected readonly activeFormMonth = signal<string | null>(null);
  protected proofFile: File | null = null;

  protected readonly paymentForm = new FormGroup({
    utrNumber: new FormControl('', [
      Validators.required,
      Validators.minLength(12),
    ]),
    paymentDate: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    void this.loadGstData();
  }

  private savedPayments(): Record<string, IGstPaymentRecord> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Record<string, IGstPaymentRecord>) : {};
    } catch {
      return {};
    }
  }

  private savePayments(map: Record<string, IGstPaymentRecord>): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
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

  private async loadGstData(): Promise<void> {
    const allDocs = await this.docIndexedDbService.getAllDocs();
    const contractorList = this.appConfigService.contractorList();
    const payments = this.savedPayments();

    const salesInvoices = allDocs.filter(
      d => d.documentType === EDocType.INVOICE && d.docContext === 'sales'
    );
    const purchaseInvoices = allDocs.filter(
      d => d.documentType === EDocType.INVOICE && d.docContext === 'purchase'
    );

    // Build per-month maps
    const monthOutward = new Map<
      string,
      { taxable: number; gst: number; rows: IGstr1Row[] }
    >();
    const monthInward = new Map<string, { taxable: number; gst: number }>();

    for (const inv of salesInvoices) {
      const key = this.monthKey(inv.documentDate);
      const entry = monthOutward.get(key) ?? { taxable: 0, gst: 0, rows: [] };
      const partyId = inv.contractorName;
      const partyName =
        partyId && contractorList.length
          ? String(
              getMappedValueFromArrayOfObjects(contractorList, partyId as never)
            )
          : (partyId ?? '—');
      entry.taxable += inv.taxableAmount ?? 0;
      entry.gst += inv.gstAmount ?? 0;
      entry.rows.push({
        invoiceNo: inv.documentNumber,
        invoiceDate: inv.documentDate,
        partyName,
        taxableAmount: inv.taxableAmount ?? 0,
        gstAmount: inv.gstAmount ?? 0,
        totalAmount: inv.totalAmount ?? 0,
      });
      monthOutward.set(key, entry);
    }

    for (const inv of purchaseInvoices) {
      const key = this.monthKey(inv.documentDate);
      const entry = monthInward.get(key) ?? { taxable: 0, gst: 0 };
      entry.taxable += inv.taxableAmount ?? 0;
      entry.gst += inv.gstAmount ?? 0;
      monthInward.set(key, entry);
    }

    // Union of all months present
    const allKeys = new Set([...monthOutward.keys(), ...monthInward.keys()]);
    const sorted = [...allKeys]
      .filter(k => k !== 'unknown')
      .sort()
      .reverse(); // newest first
    if (allKeys.has('unknown')) {
      sorted.push('unknown');
    }

    const rows: IMonthGstData[] = sorted.map(key => {
      const out = monthOutward.get(key) ?? { taxable: 0, gst: 0, rows: [] };
      const inn = monthInward.get(key) ?? { taxable: 0, gst: 0 };
      const netPayable = Math.max(0, out.gst - inn.gst);
      return {
        monthKey: key,
        monthLabel: this.monthLabel(key),
        salesInvoices: out.rows,
        outwardTaxable: out.taxable,
        outwardGst: out.gst,
        inwardTaxable: inn.taxable,
        itcGst: inn.gst,
        netPayable,
        payment: payments[key] ?? null,
        showInvoices: false,
      };
    });

    this.monthlyData.set(rows);
    this.loading.set(false);
    this.cdr.markForCheck();
  }

  protected toggleInvoices(monthKey: string): void {
    this.monthlyData.update(rows =>
      rows.map(r =>
        r.monthKey === monthKey ? { ...r, showInvoices: !r.showInvoices } : r
      )
    );
  }

  protected openForm(row: IMonthGstData): void {
    this.activeFormMonth.set(row.monthKey);
    this.proofFile = null;
    this.paymentForm.reset({
      utrNumber: row.payment?.utrNumber ?? '',
      paymentDate: row.payment?.paymentDate ?? '',
    });
    this.cdr.markForCheck();
  }

  protected closeForm(): void {
    this.activeFormMonth.set(null);
    this.paymentForm.reset();
    this.proofFile = null;
  }

  protected onProofSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.proofFile = input.files?.[0] ?? null;
  }

  protected savePayment(monthKey: string): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }
    const { utrNumber, paymentDate } = this.paymentForm.getRawValue();
    const existingProof =
      this.monthlyData().find(r => r.monthKey === monthKey)?.payment
        ?.proofFileName ?? '';
    const record: IGstPaymentRecord = {
      utrNumber: utrNumber ?? '',
      paymentDate: paymentDate ?? '',
      proofFileName: this.proofFile?.name ?? existingProof,
      savedAt: new Date().toISOString(),
    };
    const map = this.savedPayments();
    map[monthKey] = record;
    this.savePayments(map);

    this.monthlyData.update(rows =>
      rows.map(r => (r.monthKey === monthKey ? { ...r, payment: record } : r))
    );
    this.activeFormMonth.set(null);
    this.paymentForm.reset();
    this.proofFile = null;
    this.cdr.markForCheck();
  }

  protected clearPayment(monthKey: string): void {
    const map = this.savedPayments();
    delete map[monthKey];
    this.savePayments(map);
    this.monthlyData.update(rows =>
      rows.map(r => (r.monthKey === monthKey ? { ...r, payment: null } : r))
    );
    this.cdr.markForCheck();
  }

  protected isInvalid(field: 'utrNumber' | 'paymentDate'): boolean {
    const ctrl = this.paymentForm.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  protected get grandTotals(): {
    outwardGst: number;
    itcGst: number;
    netPayable: number;
    paidCount: number;
    pendingCount: number;
  } {
    return this.monthlyData().reduce(
      (acc, r) => ({
        outwardGst: acc.outwardGst + r.outwardGst,
        itcGst: acc.itcGst + r.itcGst,
        netPayable: acc.netPayable + r.netPayable,
        paidCount: acc.paidCount + (r.payment ? 1 : 0),
        pendingCount: acc.pendingCount + (r.payment ? 0 : 1),
      }),
      { outwardGst: 0, itcGst: 0, netPayable: 0, paidCount: 0, pendingCount: 0 }
    );
  }
}
