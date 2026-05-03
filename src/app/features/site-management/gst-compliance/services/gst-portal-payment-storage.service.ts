import { Injectable } from '@angular/core';

export type IGstPartyFlow = 'sales' | 'purchase';

/**
 * Local GST deposit row: **verified** with a chosen date, or pending.
 * Legacy fields (`utrNumber`, `proofFileName`) kept for old localStorage rows; new saves leave them empty.
 */
export interface IGstInvoicePaymentRecord {
  invoiceId: string;
  billNo: string;
  monthKey: string;
  /** Purchase party bucket key — used when applying GST release allocation. */
  partyKey?: string;
  /** @deprecated Verify flow — unused; kept for older stored rows */
  utrNumber?: string;
  /** ISO date string — **verification date** shown in UI */
  paymentDate: string;
  /** @deprecated Verify flow — unused */
  proofFileName?: string;
  savedAt: string;
  /** Internal batch ref for party-wise GST release linking */
  paymentAdviceNo: string;
  /**
   * Cumulative GST from this bill already counted toward purchase **GST payment release** docs (govt remittance).
   */
  gstRemittedAmount?: number;
}

const STORAGE_KEY_INVOICE_GST = 'gst_invoice_payment_records_v3';
const STORAGE_KEY_PARTY_GST_ADVICE = 'gst_party_payment_advice_v1';

export interface IGstPartyBucketForAdvice {
  partyKey: string;
  bills: { gstPayment: IGstInvoicePaymentRecord | null }[];
}

export interface IGstMonthRowForAdvice {
  monthKey: string;
  salesByParty: IGstPartyBucketForAdvice[];
  purchaseByParty: IGstPartyBucketForAdvice[];
}

@Injectable({ providedIn: 'root' })
export class GstPortalPaymentStorageService {
  getInvoicePayments(): Record<string, IGstInvoicePaymentRecord> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_INVOICE_GST);
      return raw
        ? (JSON.parse(raw) as Record<string, IGstInvoicePaymentRecord>)
        : {};
    } catch {
      return {};
    }
  }

  setInvoicePayments(map: Record<string, IGstInvoicePaymentRecord>): void {
    localStorage.setItem(STORAGE_KEY_INVOICE_GST, JSON.stringify(map));
  }

  partyAdviceStorageKey(
    monthKey: string,
    partyKey: string,
    flow: IGstPartyFlow
  ): string {
    return `${monthKey}|${partyKey}|${flow}`;
  }

  getPartyGstAdviceMap(): Record<string, string> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PARTY_GST_ADVICE);
      return raw ? (JSON.parse(raw) as Record<string, string>) : {};
    } catch {
      return {};
    }
  }

  savePartyGstAdviceMap(map: Record<string, string>): void {
    localStorage.setItem(STORAGE_KEY_PARTY_GST_ADVICE, JSON.stringify(map));
  }

  partyGstFullyVerified(party: IGstPartyBucketForAdvice): boolean {
    return party.bills.length > 0 && party.bills.every(b => !!b.gstPayment);
  }

  /** Batch ref linking portal UTR rows for one month + party (not vendor Payment Advice). */
  generatePaymentAdviceNo(monthKey: string): string {
    const rnd = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `GST-BATCH/${monthKey}/${rnd}`;
  }

  getOrCreatePartyPaymentAdviceNo(
    monthKey: string,
    partyKey: string,
    flow: IGstPartyFlow
  ): string {
    const k = this.partyAdviceStorageKey(monthKey, partyKey, flow);
    const map = this.getPartyGstAdviceMap();
    const existing = map[k]?.trim();
    if (existing) {
      return existing;
    }
    const next = this.generatePaymentAdviceNo(monthKey);
    this.savePartyGstAdviceMap({ ...map, [k]: next });
    return next;
  }

  prunePartyAdviceIfPartyEmpty(
    monthKey: string,
    partyKey: string,
    flow: IGstPartyFlow,
    payments: Record<string, IGstInvoicePaymentRecord>,
    partyInvoiceIds: string[]
  ): void {
    const anyLeft = partyInvoiceIds.some(id => !!payments[id]);
    if (anyLeft) {
      return;
    }
    const k = this.partyAdviceStorageKey(monthKey, partyKey, flow);
    const map = this.getPartyGstAdviceMap();
    if (!(k in map)) {
      return;
    }
    const rest = { ...map };
    delete rest[k];
    this.savePartyGstAdviceMap(rest);
  }

  /**
   * If all bills in a party are recorded but party-advice map was empty, persist one reference.
   */
  hydratePartyGstAdviceFromVerifiedBuckets(
    rows: IGstMonthRowForAdvice[]
  ): void {
    let map = this.getPartyGstAdviceMap();
    let changed = false;
    for (const row of rows) {
      const legs: {
        flow: IGstPartyFlow;
        parties: IGstPartyBucketForAdvice[];
      }[] = [
        { flow: 'sales', parties: row.salesByParty },
        { flow: 'purchase', parties: row.purchaseByParty },
      ];
      for (const { flow, parties } of legs) {
        for (const party of parties) {
          if (this.partyGstFullyVerified(party)) {
            const k = this.partyAdviceStorageKey(
              row.monthKey,
              party.partyKey,
              flow
            );
            if (!map[k]?.trim()) {
              const fromBill = party.bills
                .find(b => b.gstPayment?.paymentAdviceNo?.trim())
                ?.gstPayment?.paymentAdviceNo?.trim();
              if (fromBill) {
                map = { ...map, [k]: fromBill };
                changed = true;
              }
            }
          }
        }
      }
    }
    if (changed) {
      this.savePartyGstAdviceMap(map);
    }
  }

  /** Mark bill GST deposit as verified for the given **verification date** (local only). */
  saveInvoiceGstVerification(params: {
    invoiceId: string;
    billNo: string;
    monthKey: string;
    partyKey: string;
    flow: IGstPartyFlow;
    verifiedDate: string;
  }): void {
    const map = this.getInvoicePayments();
    const partyAdviceNo = this.getOrCreatePartyPaymentAdviceNo(
      params.monthKey,
      params.partyKey,
      params.flow
    );
    const prev = map[params.invoiceId];
    const record: IGstInvoicePaymentRecord = {
      invoiceId: params.invoiceId,
      billNo: params.billNo,
      monthKey: params.monthKey,
      partyKey: params.partyKey,
      utrNumber: '',
      paymentDate: params.verifiedDate,
      proofFileName: '',
      savedAt: new Date().toISOString(),
      paymentAdviceNo: partyAdviceNo,
      gstRemittedAmount: prev?.gstRemittedAmount ?? 0,
    };
    map[params.invoiceId] = record;
    this.setInvoicePayments(map);
  }

  clearInvoicePortalPayment(
    invoiceId: string,
    monthKey: string,
    partyKey: string,
    flow: IGstPartyFlow,
    partyInvoiceIds: string[]
  ): void {
    const map = this.getInvoicePayments();
    delete map[invoiceId];
    this.setInvoicePayments(map);
    this.prunePartyAdviceIfPartyEmpty(
      monthKey,
      partyKey,
      flow,
      map,
      partyInvoiceIds
    );
  }

  /**
   * After a **new** purchase GST payment release is saved, spread `releaseAmount` across verified bills
   * (table order) without exceeding each bill’s remaining GST (`gstAmount` − `gstRemittedAmount`).
   */
  applyPurchaseGstReleaseAllocation(
    monthKey: string,
    partyKey: string,
    releaseAmount: number,
    orderedBillLines: { invoiceId: string; gstAmount: number }[]
  ): void {
    const mk = monthKey?.trim();
    const pk = partyKey?.trim();
    if (!mk || !pk || releaseAmount <= 0 || !orderedBillLines.length) {
      return;
    }
    let left = Math.round(releaseAmount * 100) / 100;
    if (left <= 0) {
      return;
    }
    const map = this.getInvoicePayments();
    let changed = false;
    for (const { invoiceId, gstAmount } of orderedBillLines) {
      if (left <= 0) {
        break;
      }
      const rec = map[invoiceId];
      if (
        rec &&
        rec.monthKey === mk &&
        (rec.partyKey === undefined || rec.partyKey === pk)
      ) {
        const remitted = rec.gstRemittedAmount ?? 0;
        const cap = Math.max(0, Math.round((gstAmount - remitted) * 100) / 100);
        if (cap > 0) {
          const add = Math.min(cap, left);
          map[invoiceId] = {
            ...rec,
            gstRemittedAmount: Math.round((remitted + add) * 100) / 100,
          };
          left = Math.round((left - add) * 100) / 100;
          changed = true;
        }
      }
    }
    if (changed) {
      this.setInvoicePayments(map);
    }
  }
}
