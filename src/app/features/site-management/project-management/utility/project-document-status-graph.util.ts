import type { Edge, Node } from '@swimlane/ngx-graph';
import { APP_CONFIG } from '@core/config';
import { transformDateFormat } from '@shared/utility/date-time.util';
import {
  IDocChainNodeVm,
  IPoBreakdownAdvance,
  IPoBreakdownBankTransfer,
  IPoBreakdownBookPayment,
  IPoBreakdownInvoice,
  IPoBreakdownInvoiceGst,
  IPoBreakdownInvoiceTds,
  IPoBreakdownJmc,
  IPoBreakdownRecord,
} from '../types/po-breakdown.interface';
import {
  EDocChainNodeState,
  EDocChainStage,
} from '../types/project-document-status-detail.enum';
import {
  IDocGraph,
  IDocGraphBuildContext,
  IGraphCardView,
} from '../types/project-document-status-detail.interface';
import {
  getInvoicePendingToBook,
  getSalesPaymentNextMissing,
  hasPoUninvoicedBalance,
  getPoUninvoicedAmount,
  isAdvancePaid,
  isGstSettled,
  needsAdditionalBookPayment,
} from './project-document-status-chain.util';

const NODE_WIDTH = 252;
const NODE_HEIGHT = 122;

export function buildPoDocumentGraph(
  po: IPoBreakdownRecord,
  ctx: IDocGraphBuildContext
): IDocGraph {
  const nodes: Node[] = [];
  const links: Edge[] = [];
  const poNodeId = `${po.id}-po`;

  pushNode(
    nodes,
    poNodeId,
    createNode(EDocChainStage.PO, approvalState(po.status), ctx, {
      docNumber: po.poNumber,
      docDate: po.poDate,
      amount: positiveAmount(po.totalAmount),
      missingFileLabel: po.fileMissing ? NO_FILE_LABEL : null,
    })
  );

  // Advances hang off the PO itself — they exist because no JMC / invoice was raised yet.
  for (const advance of po.advances ?? []) {
    appendAdvanceBranch(nodes, links, poNodeId, advance, ctx);
  }

  if (!po.jmcs.length) {
    pushExpectedMissingNode(
      nodes,
      links,
      poNodeId,
      `${po.id}-no-jmc`,
      EDocChainStage.JMC,
      ctx,
      { statusLabel: 'Not created' }
    );
    return { nodes, links };
  }

  for (const jmc of po.jmcs) {
    appendJmcBranch(nodes, links, poNodeId, jmc, ctx);
  }

  if (ctx.showPoUninvoicedBalanceNode !== false && hasPoUninvoicedBalance(po)) {
    pushExpectedMissingNode(
      nodes,
      links,
      poNodeId,
      `${po.id}-invoice-balance-missing`,
      EDocChainStage.INVOICE,
      ctx,
      {
        statusLabel: 'Missing',
        amount: positiveAmount(getPoUninvoicedAmount(po)),
      }
    );
  }

  return { nodes, links };
}

/** Single-node graph when no PO exists yet — makes the first missing step explicit. */
export function buildMissingPoGraph(ctx: IDocGraphBuildContext): IDocGraph {
  const nodes: Node[] = [];

  pushNode(
    nodes,
    'missing-po',
    createExpectedMissingNode(EDocChainStage.PO, ctx, {
      statusLabel: 'Not created',
    })
  );

  return { nodes, links: [] };
}

function graphNodeClass(data: IDocChainNodeVm): string {
  if (data.isNotApplicable) {
    return 'doc-chain-card doc-chain-card--not-applicable';
  }

  if (data.isExpectedMissing) {
    return 'doc-chain-card doc-chain-card--expected-missing';
  }

  return 'doc-chain-card';
}

export function buildGraphCardView(data: IDocChainNodeVm): IGraphCardView {
  const formattedDate = formatGraphDocDate(data.docDate);

  return {
    className: graphNodeClass(data),
    stageTone: graphStageTone(data.stage),
    stageIcon: graphStageIcon(data.stage),
    state: data.state.toLowerCase(),
    statusLabel: data.statusLabel,
    docName: data.docName,
    primaryText: graphPrimaryText(data),
    isPlaceholder: !hasDocNumber(data) || !!data.isNotApplicable,
    dateLabel: graphDateFactLabel(data.stage),
    formattedDate,
    amount: data.amount,
    hasFacts: Boolean(data.amount) || formattedDate !== '—',
    missingFileLabel: data.missingFileLabel ?? null,
  };
}

const NO_FILE_LABEL = 'No file';

/**
 * Vendor transfers: the payment advice generated with them, and whether it reached the vendor.
 * Pending (not missing) when not emailed — the money has gone, only the intimation is due.
 */
function appendPaymentAdviceNode(
  nodes: Node[],
  links: Edge[],
  transferNodeId: string,
  transfer: IPoBreakdownBankTransfer | undefined,
  ctx: IDocGraphBuildContext
): void {
  const advice = transfer?.paymentAdvice;
  if (!transfer || !advice) {
    return;
  }

  const adviceNodeId = `${transfer.id}-advice`;
  pushNode(
    nodes,
    adviceNodeId,
    createNode(
      EDocChainStage.PAYMENT_ADVICE,
      advice.isEmailed ? EDocChainNodeState.DONE : EDocChainNodeState.PENDING,
      ctx,
      {
        docNumber: advice.referenceNumber,
        docDate: advice.generatedAt,
        statusLabel: advice.isEmailed ? 'Emailed' : 'Not emailed',
      }
    )
  );
  pushLink(links, transferNodeId, adviceNodeId);
}

function hasDocNumber(data: IDocChainNodeVm): boolean {
  if (data.stage === EDocChainStage.REPORT) {
    return false;
  }

  return !!data.docNumber?.trim();
}

/** Primary line on graph cards — avoids bare em dashes for missing docs. */
function graphPrimaryText(data: IDocChainNodeVm): string {
  if (data.isNotApplicable) {
    if (data.stage === EDocChainStage.REPORT) {
      return 'No report';
    }

    if (data.stage === EDocChainStage.INVOICE) {
      return 'No invoice';
    }

    if (data.stage === EDocChainStage.JMC) {
      return 'No JMC';
    }
  }

  if (data.isExpectedMissing) {
    return expectedMissingPrimaryText(data.stage, data.docName);
  }

  if (data.stage === EDocChainStage.REPORT) {
    switch (data.state) {
      case EDocChainNodeState.DONE:
        return 'On record';
      case EDocChainNodeState.PENDING:
        return 'Awaiting approval';
      case EDocChainNodeState.REJECTED:
        return 'Rejected';
      default:
        return 'Not uploaded';
    }
  }

  const number = data.docNumber?.trim();
  if (number) {
    return number;
  }

  return data.statusLabel?.trim() || '—';
}

function expectedMissingPrimaryText(
  stage: EDocChainStage,
  docName: string
): string {
  switch (stage) {
    case EDocChainStage.PO:
      return 'PO not created yet';
    case EDocChainStage.JMC:
      return 'JMC not created yet';
    case EDocChainStage.REPORT:
      return 'Report not uploaded yet';
    case EDocChainStage.INVOICE:
      return 'Invoice not created yet';
    case EDocChainStage.BOOK_PAYMENT:
      return 'Book payment not created yet';
    case EDocChainStage.BANK_TRANSFER:
      return docName === 'Payment'
        ? 'Payment not received yet'
        : 'Payment not made yet';
    default:
      return `${docName} not created yet`;
  }
}

function graphDateFactLabel(stage: EDocChainStage): string {
  return stage === EDocChainStage.REPORT ? 'Upload date' : 'Date';
}

function formatGraphDocDate(value: string | null | undefined): string {
  if (!value?.trim()) {
    return '—';
  }

  const formatted = transformDateFormat(value, APP_CONFIG.DATE_FORMATS.DEFAULT);
  return formatted || value;
}

function graphStageTone(stage: EDocChainStage): string {
  switch (stage) {
    case EDocChainStage.PO:
      return 'po';
    case EDocChainStage.JMC:
      return 'jmc';
    case EDocChainStage.REPORT:
      return 'report';
    case EDocChainStage.INVOICE:
      return 'invoice';
    case EDocChainStage.GST:
    case EDocChainStage.TDS:
      return 'tax';
    case EDocChainStage.ADVANCE:
      return 'advance';
    default:
      return 'payment';
  }
}

function graphStageIcon(stage: EDocChainStage): string {
  switch (stage) {
    case EDocChainStage.PO:
      return 'pi pi-file';
    case EDocChainStage.JMC:
      return 'pi pi-clipboard';
    case EDocChainStage.REPORT:
      return 'pi pi-file-export';
    case EDocChainStage.INVOICE:
      return 'pi pi-receipt';
    case EDocChainStage.BOOK_PAYMENT:
      return 'pi pi-wallet';
    case EDocChainStage.BANK_TRANSFER:
      return 'pi pi-credit-card';
    case EDocChainStage.GST:
      return 'pi pi-percentage';
    case EDocChainStage.TDS:
      return 'pi pi-calculator';
    case EDocChainStage.ADVANCE:
      return 'pi pi-forward';
    case EDocChainStage.PAYMENT_ADVICE:
      return 'pi pi-envelope';
    default:
      return 'pi pi-file';
  }
}

function appendJmcBranch(
  nodes: Node[],
  links: Edge[],
  poNodeId: string,
  jmc: IPoBreakdownJmc,
  ctx: IDocGraphBuildContext
): void {
  const jmcNodeId = `${jmc.id}-jmc`;
  pushNode(
    nodes,
    jmcNodeId,
    createNode(EDocChainStage.JMC, approvalState(jmc.status), ctx, {
      docNumber: jmc.jmcNumber,
      docDate: jmc.jmcDate,
      missingFileLabel: jmc.fileMissing ? NO_FILE_LABEL : null,
      isNotApplicable: !jmc.jmcNumber?.trim(),
    })
  );
  pushLink(links, poNodeId, jmcNodeId);

  if (ctx.isSales) {
    appendDocChainAfterJmc(
      nodes,
      links,
      jmcNodeId,
      jmc,
      ctx,
      appendSalesPayments
    );
    return;
  }

  appendDocChainAfterJmc(
    nodes,
    links,
    jmcNodeId,
    jmc,
    ctx,
    appendPurchasePayments
  );
}

function appendDocChainAfterJmc(
  nodes: Node[],
  links: Edge[],
  jmcNodeId: string,
  jmc: IPoBreakdownJmc,
  ctx: IDocGraphBuildContext,
  appendPayments: (
    nodes: Node[],
    links: Edge[],
    invoiceNodeId: string,
    invoice: IPoBreakdownInvoice,
    ctx: IDocGraphBuildContext
  ) => void
): void {
  const reportNodeId = `${jmc.id}-report`;

  if (!jmc.report) {
    pushExpectedMissingNode(
      nodes,
      links,
      jmcNodeId,
      reportNodeId,
      EDocChainStage.REPORT,
      ctx,
      { statusLabel: 'Missing' }
    );
  } else if (!jmc.hasReport) {
    pushNotApplicableNode(
      nodes,
      links,
      jmcNodeId,
      reportNodeId,
      EDocChainStage.REPORT,
      ctx,
      notApplicableReportNodeData(jmc, ctx)
    );
  } else {
    pushNode(nodes, reportNodeId, reportNodeData(jmc, ctx));
    pushLink(links, jmcNodeId, reportNodeId);
  }

  const invoiceNodeId = `${jmc.id}-invoice`;
  if (!jmc.invoice) {
    pushExpectedMissingNode(
      nodes,
      links,
      reportNodeId,
      invoiceNodeId,
      EDocChainStage.INVOICE,
      ctx,
      { statusLabel: 'Missing' }
    );
    return;
  }

  if (!jmc.hasInvoice) {
    pushNotApplicableNode(
      nodes,
      links,
      reportNodeId,
      invoiceNodeId,
      EDocChainStage.INVOICE,
      ctx,
      notApplicableInvoiceNodeData(jmc, ctx)
    );
    return;
  }

  pushNode(nodes, invoiceNodeId, invoiceNodeData(jmc.invoice, ctx));
  pushLink(links, reportNodeId, invoiceNodeId);
  appendPayments(nodes, links, invoiceNodeId, jmc.invoice, ctx);
  appendInvoiceTax(nodes, links, invoiceNodeId, jmc.invoice, ctx);
}

/**
 * GST and TDS of an invoice, each its own node off the invoice. Held GST that moved through
 * the payment chain hangs off the GST node: vendor → GST book payment → bank transfer; contractor
 * → GST bank transfer.
 */
function appendInvoiceTax(
  nodes: Node[],
  links: Edge[],
  invoiceNodeId: string,
  invoice: IPoBreakdownInvoice,
  ctx: IDocGraphBuildContext
): void {
  const gst = invoice.gst;
  if (gst && gst.gstAmount > 0) {
    const gstNodeId = `${invoice.id}-gst`;
    pushNode(nodes, gstNodeId, gstNodeData(gst, ctx));
    pushLink(links, invoiceNodeId, gstNodeId);

    if (ctx.isSales) {
      for (const receipt of invoice.gstReceipts) {
        const nodeId = `${receipt.id}-gst-receipt`;
        pushNode(nodes, nodeId, gstReceiptNodeData(receipt, ctx));
        pushLink(links, gstNodeId, nodeId);
      }
    } else {
      for (const release of invoice.gstReleases) {
        appendGstReleaseRail(nodes, links, gstNodeId, release, ctx);
      }
    }
  }

  const tds = invoice.tds;
  if (tds && tds.tdsAmount > 0) {
    const tdsNodeId = `${invoice.id}-tds`;
    pushNode(nodes, tdsNodeId, tdsNodeData(tds, ctx));
    pushLink(links, invoiceNodeId, tdsNodeId);
  }
}

function gstNodeData(
  gst: IPoBreakdownInvoiceGst,
  ctx: IDocGraphBuildContext
): IDocChainNodeVm {
  const portal = ctx.isSales ? 'GSTR-1' : 'GSTR-2B';
  const settled = isGstSettled(gst);
  const inProcess = gst.settlementStatus === 'IN_PROCESS';
  const docNumber = gst.isGstHold ? 'Held GST' : 'GST with payment';
  const common = {
    docNumber,
    docDate: gst.settledAt,
    amount: positiveAmount(gst.gstAmount),
  };

  if (gst.isVerified && (!gst.isGstHold || settled)) {
    const doneLabel = !gst.isGstHold
      ? 'Verified'
      : ctx.isSales
        ? 'Verified · Received'
        : 'Verified · Released';
    return createNode(EDocChainStage.GST, EDocChainNodeState.DONE, ctx, {
      ...common,
      statusLabel: doneLabel,
    });
  }

  if (gst.isVerified && inProcess) {
    return createNode(EDocChainStage.GST, EDocChainNodeState.PENDING, ctx, {
      ...common,
      statusLabel: 'Release in process',
    });
  }

  const open: string[] = [];
  if (!gst.isVerified) {
    open.push(`${portal} pending`);
  }
  if (gst.isGstHold && !settled) {
    open.push(
      inProcess
        ? 'Release in process'
        : ctx.isSales
          ? 'Receipt pending'
          : 'Release pending'
    );
  }

  return createNode(EDocChainStage.GST, EDocChainNodeState.MISSING, ctx, {
    ...common,
    statusLabel: open.join(' · '),
  });
}

function tdsNodeData(
  tds: IPoBreakdownInvoiceTds,
  ctx: IDocGraphBuildContext
): IDocChainNodeVm {
  const common = {
    docNumber: 'TDS',
    docDate: tds.lastDepositedAt,
    amount: positiveAmount(tds.tdsAmount),
  };

  if (ctx.isSales) {
    return createNode(
      EDocChainStage.TDS,
      tds.isVerified ? EDocChainNodeState.DONE : EDocChainNodeState.MISSING,
      ctx,
      {
        ...common,
        statusLabel: tds.isVerified ? '26AS verified' : '26AS pending',
      }
    );
  }

  if (!tds.isDeposited) {
    return createNode(EDocChainStage.TDS, EDocChainNodeState.MISSING, ctx, {
      ...common,
      statusLabel: 'Challan pending',
    });
  }

  return createNode(
    EDocChainStage.TDS,
    tds.isVerified ? EDocChainNodeState.DONE : EDocChainNodeState.PENDING,
    ctx,
    {
      ...common,
      statusLabel: tds.isVerified ? 'Deposited · 26Q filed' : '26Q pending',
    }
  );
}

/** Vendor: GST book payment → its bank transfer, off the GST node. */
function appendGstReleaseRail(
  nodes: Node[],
  links: Edge[],
  gstNodeId: string,
  release: IPoBreakdownBookPayment,
  ctx: IDocGraphBuildContext
): void {
  const bookPaymentNodeId = `${release.id}-gst-bp`;
  pushNode(
    nodes,
    bookPaymentNodeId,
    createNode(
      EDocChainStage.BOOK_PAYMENT,
      approvalState(release.status),
      ctx,
      {
        docNumber: 'GST release',
        docDate: release.bookingDate,
        amount: positiveAmount(release.paymentTotalAmount),
      }
    )
  );
  pushLink(links, gstNodeId, bookPaymentNodeId);

  const transferNodeId = `${release.id}-gst-bt`;
  pushNode(nodes, transferNodeId, bankTransferNodeData(release, ctx));
  pushLink(links, bookPaymentNodeId, transferNodeId);
  appendPaymentAdviceNode(
    nodes,
    links,
    transferNodeId,
    release.bankTransfers[0],
    ctx
  );
}

function gstReceiptNodeData(
  receipt: IPoBreakdownBankTransfer,
  ctx: IDocGraphBuildContext
): IDocChainNodeVm {
  return createNode(
    EDocChainStage.BANK_TRANSFER,
    approvalState(receipt.status),
    ctx,
    {
      docName: 'GST receipt',
      docNumber: receipt.utrNumber,
      docDate: receipt.transferDate,
      amount: positiveAmount(receipt.transferAmount),
    }
  );
}

/**
 * Vendor advance off the PO: its own state (approval, then settlement against invoices), and its
 * payment — the bank transfer of the booking created when it was approved.
 */
function appendAdvanceBranch(
  nodes: Node[],
  links: Edge[],
  poNodeId: string,
  advance: IPoBreakdownAdvance,
  ctx: IDocGraphBuildContext
): void {
  const advanceNodeId = `${advance.id}-advance`;
  pushNode(nodes, advanceNodeId, advanceNodeData(advance, ctx));
  pushLink(links, poNodeId, advanceNodeId);

  if (advance.status.toUpperCase() !== 'APPROVED') {
    return;
  }

  const paymentNodeId = `${advance.id}-advance-payment`;
  if (isAdvancePaid(advance)) {
    pushNode(
      nodes,
      paymentNodeId,
      createNode(EDocChainStage.BANK_TRANSFER, EDocChainNodeState.DONE, ctx, {
        docNumber: advance.utrNumber ?? 'Transferred',
        docDate: advance.lastPaidAt,
        amount: positiveAmount(advance.paidAmount),
      })
    );
    pushLink(links, advanceNodeId, paymentNodeId);
    return;
  }

  const due = advance.bookedAmount > 0 ? advance.bookedAmount : advance.amount;
  pushExpectedMissingNode(
    nodes,
    links,
    advanceNodeId,
    paymentNodeId,
    EDocChainStage.BANK_TRANSFER,
    ctx,
    { amount: positiveAmount(due - advance.paidAmount) }
  );
}

function advanceNodeData(
  advance: IPoBreakdownAdvance,
  ctx: IDocGraphBuildContext
): IDocChainNodeVm {
  const fileNote = advance.hasUpload ? '' : ' · No file';
  const common = {
    docNumber: advance.advanceNumber,
    docDate: advance.advanceDate,
    amount: positiveAmount(advance.amount),
  };

  if (advance.status.toUpperCase() !== 'APPROVED') {
    const state = approvalState(advance.status);
    return createNode(EDocChainStage.ADVANCE, state, ctx, {
      ...common,
      statusLabel: `${statusLabel(EDocChainStage.ADVANCE, state, ctx.isSales)}${fileNote}`,
    });
  }

  if (!isAdvancePaid(advance)) {
    return createNode(EDocChainStage.ADVANCE, EDocChainNodeState.DONE, ctx, {
      ...common,
      statusLabel: `Approved${fileNote}`,
    });
  }

  if (advance.unsettled <= 0) {
    return createNode(EDocChainStage.ADVANCE, EDocChainNodeState.DONE, ctx, {
      ...common,
      statusLabel: `Settled${fileNote}`,
    });
  }

  return createNode(EDocChainStage.ADVANCE, EDocChainNodeState.PARTIAL, ctx, {
    ...common,
    statusLabel: `${advance.settledAmount > 0 ? 'Partly settled' : 'Not settled'}${fileNote}`,
  });
}

function appendSalesPayments(
  nodes: Node[],
  links: Edge[],
  invoiceNodeId: string,
  invoice: IPoBreakdownInvoice,
  ctx: IDocGraphBuildContext
): void {
  for (const transfer of invoice.bankTransfers) {
    const nodeId = `${transfer.id}-payment`;
    pushNode(
      nodes,
      nodeId,
      createNode(
        EDocChainStage.BANK_TRANSFER,
        approvalState(transfer.status),
        ctx,
        {
          docNumber: transfer.utrNumber,
          docDate: transfer.transferDate,
          amount: salesBankTransferAmount(transfer, invoice),
        }
      )
    );
    pushLink(links, invoiceNodeId, nodeId);
  }

  if (getSalesPaymentNextMissing(invoice) !== EDocChainStage.BANK_TRANSFER) {
    return;
  }

  pushExpectedMissingNode(
    nodes,
    links,
    invoiceNodeId,
    `${invoice.id}-payment-missing`,
    EDocChainStage.BANK_TRANSFER,
    ctx,
    {
      statusLabel: statusLabel(
        EDocChainStage.BANK_TRANSFER,
        salesPaymentState(invoice),
        ctx.isSales
      ),
      amount: positiveAmount(invoice.remaining),
    }
  );
}

function appendPurchasePayments(
  nodes: Node[],
  links: Edge[],
  invoiceNodeId: string,
  invoice: IPoBreakdownInvoice,
  ctx: IDocGraphBuildContext
): void {
  if (!invoice.bookPayments.length) {
    // Nothing left to pay — e.g. the net payable was covered by an advance.
    if (invoice.remaining <= 0) {
      return;
    }

    pushExpectedMissingNode(
      nodes,
      links,
      invoiceNodeId,
      `${invoice.id}-bp-missing`,
      EDocChainStage.BOOK_PAYMENT,
      ctx,
      { amount: positiveAmount(invoice.remaining) }
    );
    return;
  }

  for (const [index, bookPayment] of invoice.bookPayments.entries()) {
    appendPurchaseRail(nodes, links, invoiceNodeId, bookPayment, index, ctx);
  }

  if (!needsAdditionalBookPayment(invoice)) {
    return;
  }

  pushExpectedMissingNode(
    nodes,
    links,
    invoiceNodeId,
    `${invoice.id}-bp-balance-missing`,
    EDocChainStage.BOOK_PAYMENT,
    ctx,
    {
      statusLabel: 'Missing',
      amount: positiveAmount(getInvoicePendingToBook(invoice)),
    }
  );
}

function appendPurchaseRail(
  nodes: Node[],
  links: Edge[],
  invoiceNodeId: string,
  bookPayment: IPoBreakdownBookPayment,
  index: number,
  ctx: IDocGraphBuildContext
): void {
  const bookPaymentNodeId = `${bookPayment.id}-bp`;
  pushNode(
    nodes,
    bookPaymentNodeId,
    createNode(
      EDocChainStage.BOOK_PAYMENT,
      approvalState(bookPayment.status),
      ctx,
      {
        docNumber: `Entry #${index + 1}`,
        docDate: bookPayment.bookingDate,
        amount: positiveAmount(bookPayment.paymentTotalAmount),
      }
    )
  );
  pushLink(links, invoiceNodeId, bookPaymentNodeId);

  const transferNodeId = `${bookPayment.id}-bt`;
  pushNode(nodes, transferNodeId, bankTransferNodeData(bookPayment, ctx));
  pushLink(links, bookPaymentNodeId, transferNodeId);
  appendPaymentAdviceNode(
    nodes,
    links,
    transferNodeId,
    bookPayment.bankTransfers[0],
    ctx
  );
}

function reportNodeData(
  jmc: IPoBreakdownJmc,
  ctx: IDocGraphBuildContext
): IDocChainNodeVm {
  if (jmc.report) {
    return createNode(
      EDocChainStage.REPORT,
      approvalState(jmc.report.status),
      ctx,
      {
        docDate: jmc.report.reportDate,
      }
    );
  }

  return createExpectedMissingNode(EDocChainStage.REPORT, ctx);
}

function invoiceNodeData(
  invoice: IPoBreakdownInvoice,
  ctx: IDocGraphBuildContext
): IDocChainNodeVm {
  return createNode(
    EDocChainStage.INVOICE,
    approvalState(invoice.status),
    ctx,
    {
      docNumber: invoice.invoiceNumber,
      docDate: invoice.invoiceDate,
      amount: positiveAmount(invoice.totalAmount),
      missingFileLabel: invoice.fileMissing ? NO_FILE_LABEL : null,
    }
  );
}

function bankTransferNodeData(
  bookPayment: IPoBreakdownBookPayment,
  ctx: IDocGraphBuildContext
): IDocChainNodeVm {
  const transfer = bookPayment.bankTransfers[0];
  if (transfer) {
    return createNode(
      EDocChainStage.BANK_TRANSFER,
      approvalState(transfer.status),
      ctx,
      {
        docNumber: transfer.utrNumber,
        docDate: transfer.transferDate,
        amount: purchaseBankTransferAmount(transfer, bookPayment),
      }
    );
  }

  if (bookPayment.hasTransfer) {
    return createNode(
      EDocChainStage.BANK_TRANSFER,
      EDocChainNodeState.DONE,
      ctx,
      {
        docNumber: 'Transferred',
        amount: positiveAmount(bookPayment.paymentTotalAmount),
      }
    );
  }

  return createExpectedMissingNode(EDocChainStage.BANK_TRANSFER, ctx, {
    amount: positiveAmount(bookPayment.paymentTotalAmount),
  });
}

function positiveAmount(value: number | null | undefined): number | null {
  if (value === null || value === undefined || value <= 0) {
    return null;
  }
  return value;
}

function salesBankTransferAmount(
  transfer: IPoBreakdownInvoice['bankTransfers'][number],
  invoice: IPoBreakdownInvoice
): number | null {
  const direct = positiveAmount(transfer.transferAmount);
  if (direct !== null) {
    return direct;
  }

  if (invoice.bankTransfers.length === 1) {
    return positiveAmount(invoice.paidTotal);
  }

  return null;
}

function purchaseBankTransferAmount(
  transfer: IPoBreakdownBookPayment['bankTransfers'][number],
  bookPayment: IPoBreakdownBookPayment
): number | null {
  return (
    positiveAmount(transfer.transferAmount) ??
    positiveAmount(bookPayment.paymentTotalAmount)
  );
}

function notApplicableReportNodeData(
  jmc: IPoBreakdownJmc,
  ctx: IDocGraphBuildContext
): Partial<IDocChainNodeVm> {
  if (jmc.report) {
    const state = approvalState(jmc.report.status);

    return {
      state,
      statusLabel: statusLabel(EDocChainStage.REPORT, state, ctx.isSales),
      docDate: jmc.report.reportDate,
    };
  }

  return {
    state: EDocChainNodeState.DONE,
    statusLabel: 'Approved',
  };
}

function notApplicableInvoiceNodeData(
  jmc: IPoBreakdownJmc,
  ctx: IDocGraphBuildContext
): Partial<IDocChainNodeVm> {
  if (jmc.invoice) {
    const state = approvalState(jmc.invoice.status);

    return {
      state,
      statusLabel: statusLabel(EDocChainStage.INVOICE, state, ctx.isSales),
      docNumber: jmc.invoice.invoiceNumber,
      docDate: jmc.invoice.invoiceDate,
      amount: positiveAmount(jmc.invoice.totalAmount),
    };
  }

  return {
    state: EDocChainNodeState.DONE,
    statusLabel: 'Approved',
  };
}

function stageDocName(stage: EDocChainStage, isSales: boolean): string {
  switch (stage) {
    case EDocChainStage.PO:
      return 'PO';
    case EDocChainStage.JMC:
      return 'JMC';
    case EDocChainStage.REPORT:
      return 'Report';
    case EDocChainStage.INVOICE:
      return 'Invoice';
    case EDocChainStage.BOOK_PAYMENT:
      return 'Book Payment';
    case EDocChainStage.BANK_TRANSFER:
      return isSales ? 'Payment' : 'Bank Transfer';
    case EDocChainStage.GST:
      return 'GST';
    case EDocChainStage.TDS:
      return 'TDS';
    case EDocChainStage.ADVANCE:
      return 'Advance';
    case EDocChainStage.PAYMENT_ADVICE:
      return 'Payment Advice';
    default:
      return 'Document';
  }
}

function createExpectedMissingNode(
  stage: EDocChainStage,
  ctx: IDocGraphBuildContext,
  extra: Partial<IDocChainNodeVm> = {}
): IDocChainNodeVm {
  return createNode(stage, EDocChainNodeState.MISSING, ctx, {
    isExpectedMissing: true,
    statusLabel: 'Missing',
    ...extra,
  });
}

function createNotApplicableNode(
  stage: EDocChainStage,
  ctx: IDocGraphBuildContext,
  extra: Partial<IDocChainNodeVm> = {}
): IDocChainNodeVm {
  const state = extra.state ?? EDocChainNodeState.DONE;

  return createNode(stage, state, ctx, {
    isNotApplicable: true,
    ...extra,
  });
}

function pushExpectedMissingNode(
  nodes: Node[],
  links: Edge[],
  sourceId: string,
  targetId: string,
  stage: EDocChainStage,
  ctx: IDocGraphBuildContext,
  extra: Partial<IDocChainNodeVm> = {}
): void {
  pushNode(nodes, targetId, createExpectedMissingNode(stage, ctx, extra));
  pushLink(links, sourceId, targetId);
}

function pushNotApplicableNode(
  nodes: Node[],
  links: Edge[],
  sourceId: string,
  targetId: string,
  stage: EDocChainStage,
  ctx: IDocGraphBuildContext,
  extra: Partial<IDocChainNodeVm> = {}
): void {
  pushNode(nodes, targetId, createNotApplicableNode(stage, ctx, extra));
  pushLink(links, sourceId, targetId);
}

function createNode(
  stage: EDocChainStage,
  state: EDocChainNodeState,
  ctx: IDocGraphBuildContext,
  extra: Partial<IDocChainNodeVm> = {}
): IDocChainNodeVm {
  return {
    docName: extra.docName ?? stageDocName(stage, ctx.isSales),
    stage,
    docNumber: extra.docNumber ?? null,
    docDate: extra.docDate ?? null,
    statusLabel: extra.statusLabel ?? statusLabel(stage, state, ctx.isSales),
    state,
    ...extra,
  };
}

function statusLabel(
  stage: EDocChainStage,
  state: EDocChainNodeState,
  isSales: boolean
): string {
  switch (state) {
    case EDocChainNodeState.DONE:
      if (stage === EDocChainStage.BOOK_PAYMENT) {
        return 'Booked';
      }
      if (stage === EDocChainStage.BANK_TRANSFER) {
        return isSales ? 'Received' : 'Paid';
      }
      return 'Approved';
    case EDocChainNodeState.PENDING:
      return 'Pending';
    case EDocChainNodeState.REJECTED:
      return 'Rejected';
    case EDocChainNodeState.PARTIAL:
      return isSales ? 'Partially received' : 'Partially paid';
    default:
      if (stage === EDocChainStage.REPORT) {
        return 'Not uploaded';
      }
      if (stage === EDocChainStage.BOOK_PAYMENT) {
        return 'Not booked';
      }
      if (stage === EDocChainStage.BANK_TRANSFER) {
        return isSales ? 'Not received' : 'Not paid';
      }
      if (stage === EDocChainStage.INVOICE) {
        return 'Not raised';
      }
      return 'Not created';
  }
}

function approvalState(status: string): EDocChainNodeState {
  switch (status.toUpperCase()) {
    case 'APPROVED':
      return EDocChainNodeState.DONE;
    case 'REJECTED':
      return EDocChainNodeState.REJECTED;
    case 'PENDING':
      return EDocChainNodeState.PENDING;
    default:
      return EDocChainNodeState.PENDING;
  }
}

function salesPaymentState(invoice: IPoBreakdownInvoice): EDocChainNodeState {
  if (invoice.paidTotal > 0 && invoice.remaining > 0) {
    return EDocChainNodeState.PARTIAL;
  }
  if (invoice.paidTotal > 0) {
    return EDocChainNodeState.DONE;
  }
  return EDocChainNodeState.MISSING;
}

function pushNode(nodes: Node[], id: string, data: IDocChainNodeVm): void {
  nodes.push({
    id,
    label: data.docName,
    data,
    dimension: { width: NODE_WIDTH, height: NODE_HEIGHT },
  });
}

function pushLink(links: Edge[], source: string, target: string): void {
  links.push({
    id: `${source}->${target}`,
    source,
    target,
  });
}
