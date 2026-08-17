import type { Edge, Node } from '@swimlane/ngx-graph';

export type { IDocChainNodeVm } from './po-breakdown.interface';

export interface IDocGraphBuildContext {
  isSales: boolean;
}

export interface IDocGraph {
  nodes: Node[];
  links: Edge[];
}

export interface IGraphCardView {
  className: string;
  stageTone: string;
  stageIcon: string;
  state: string;
  statusLabel: string;
  docName: string;
  primaryText: string;
  isPlaceholder: boolean;
  dateLabel: string;
  formattedDate: string;
  amount: number | null | undefined;
  hasFacts: boolean;
}
