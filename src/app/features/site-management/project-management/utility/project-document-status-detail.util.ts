import { getPoUninvoicedAmount } from './project-document-status-chain.util';
import { buildPoDocumentGraph } from './project-document-status-graph.util';
import { buildPoBreakdownCounts } from './po-breakdown.mapper';
import {
  IDocChainNodeVm,
  IPoBreakdownRecord,
  IPoPanelMetric,
  IPoPanelMetrics,
} from '../types/po-breakdown.interface';
import {
  EDocChainNodeState,
  EDocChainStage,
} from '../types/project-document-status-detail.enum';
import { IDocGraphBuildContext } from '../types/project-document-status-detail.interface';

function approvalTone(done: number, total: number): 'ok' | 'warn' | 'danger' {
  if (total <= 0) {
    return 'warn';
  }
  if (done >= total) {
    return 'ok';
  }
  if (done <= 0) {
    return 'danger';
  }
  return 'warn';
}

function countPoApproved(status: string): number {
  return status.toUpperCase() === 'APPROVED' ? 1 : 0;
}

function isGraphNodeComplete(state: EDocChainNodeState): boolean {
  return state === EDocChainNodeState.DONE;
}

function countGraphStage(
  nodes: readonly IDocChainNodeVm[],
  stage: EDocChainStage,
  mode: 'complete' | 'present' = 'complete'
): { done: number; total: number } {
  let total = 0;
  let done = 0;

  for (const node of nodes) {
    if (node.stage !== stage) {
      continue;
    }

    total += 1;

    if (mode === 'present' ? !node.isExpectedMissing : isGraphNodeComplete(node.state)) {
      done += 1;
    }
  }

  return { total, done };
}

function buildGraphStageMetric(
  nodes: readonly IDocChainNodeVm[],
  stage: EDocChainStage,
  label: string,
  mode: 'complete' | 'present' = 'complete'
): IPoPanelMetric {
  const { done, total } = countGraphStage(nodes, stage, mode);

  if (!total) {
    return { label, value: '—' };
  }

  return {
    label,
    value: `${done}/${total}`,
    tone: approvalTone(done, total),
  };
}

function buildGraphApprovalMetrics(
  nodes: readonly IDocChainNodeVm[],
  record: IPoBreakdownRecord,
  isSales: boolean
): IPoPanelMetric[] {
  const poApproved = countPoApproved(record.status);

  const metrics: IPoPanelMetric[] = [
    {
      label: 'PO',
      value: `${poApproved}/1`,
      tone: approvalTone(poApproved, 1),
    },
    buildGraphStageMetric(nodes, EDocChainStage.JMC, 'JMC'),
    buildGraphStageMetric(nodes, EDocChainStage.REPORT, 'Report'),
    buildGraphStageMetric(nodes, EDocChainStage.INVOICE, 'Invoice', 'present'),
  ];

  if (isSales) {
    metrics.push(
      buildGraphStageMetric(nodes, EDocChainStage.BANK_TRANSFER, 'Payment')
    );
  } else {
    metrics.push(
      buildGraphStageMetric(nodes, EDocChainStage.BOOK_PAYMENT, 'Book Payment'),
      buildGraphStageMetric(nodes, EDocChainStage.BANK_TRANSFER, 'Payment')
    );
  }

  return metrics;
}

export function buildPoPanelMetrics(
  record: IPoBreakdownRecord,
  isSales: boolean,
  formatCurrency: (value: number) => string,
  graphContext?: Pick<IDocGraphBuildContext, 'showPoUninvoicedBalanceNode'>
): IPoPanelMetrics {
  const graph = buildPoDocumentGraph(record, {
    isSales,
    ...graphContext,
  });
  const nodes = graph.nodes
    .map(node => node.data)
    .filter((data): data is IDocChainNodeVm => !!data);

  const c = buildPoBreakdownCounts(record.jmcs);
  const invoicePaymentDue = Math.max(c.amounts.invoiceTotal - c.amounts.paid, 0);
  const uninvoicedAmount = getPoUninvoicedAmount(record);
  const amountDue = isSales ? uninvoicedAmount : invoicePaymentDue;

  const approvals = buildGraphApprovalMetrics(nodes, record, isSales);

  const amounts: IPoPanelMetric[] = [
    {
      label: 'PO Amount',
      value: formatCurrency(record.totalAmount),
      tone: record.totalAmount > 0 ? 'ok' : null,
    },
    { label: 'Invoiced', value: formatCurrency(c.amounts.invoiceTotal) },
    ...(isSales
      ? []
      : [{ label: 'Booked', value: formatCurrency(c.amounts.booked) }]),
    {
      label: isSales ? 'To invoice' : 'Invoice to pay',
      value: formatCurrency(amountDue),
      tone: amountDue > 0 ? 'warn' : 'ok',
    },
    {
      label: isSales ? 'Invoice received' : 'Invoice paid',
      value: formatCurrency(c.amounts.paid),
      tone: c.amounts.paid > 0 ? 'ok' : null,
    },
  ];

  return { approvals, amounts };
}
