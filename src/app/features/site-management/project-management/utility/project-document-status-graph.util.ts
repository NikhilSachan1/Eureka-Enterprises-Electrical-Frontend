import type { Edge, Node } from '@swimlane/ngx-graph';
import { APP_CONFIG } from '@core/config';
import { transformDateFormat } from '@shared/utility/date-time.util';
import {
  IDocChainNodeVm,
  IPoBreakdownBookPayment,
  IPoBreakdownInvoice,
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
  getSalesPaymentNextMissing,
  hasPoUninvoicedBalance,
  getPoUninvoicedAmount,
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
    })
  );

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

  if (hasPoUninvoicedBalance(po)) {
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
    hasFacts: !!(data.amount || formattedDate !== '—'),
  };
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
    })
  );
  pushLink(links, poNodeId, jmcNodeId);

  if (ctx.isSales) {
    appendDocChainAfterJmc(nodes, links, jmcNodeId, jmc, ctx, appendSalesPayments);
    return;
  }

  appendDocChainAfterJmc(nodes, links, jmcNodeId, jmc, ctx, appendPurchasePayments);
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
    if (invoice.totalAmount <= 0 && invoice.remaining <= 0) {
      return;
    }

    pushExpectedMissingNode(
      nodes,
      links,
      invoiceNodeId,
      `${invoice.id}-bp-missing`,
      EDocChainStage.BOOK_PAYMENT,
      ctx,
      { amount: positiveAmount(invoice.remaining || invoice.totalAmount) }
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
      amount: positiveAmount(invoice.remaining),
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
  pushNode(
    nodes,
    transferNodeId,
    bankTransferNodeData(bookPayment, ctx)
  );
  pushLink(links, bookPaymentNodeId, transferNodeId);
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
  if (value == null || value <= 0) {
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
