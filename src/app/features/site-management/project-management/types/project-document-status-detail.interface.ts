import type { IDocChainNodeVm } from './po-breakdown.interface';

export type { IDocChainNodeVm } from './po-breakdown.interface';

/** One document of a PO's chain. */
export interface IDocGraphNode {
  id: string;
  label: string;
  data: IDocChainNodeVm;
}

/** "`target` follows `source`" in a PO's chain. */
export interface IDocGraphLink {
  id: string;
  source: string;
  target: string;
}

export interface IDocGraphBuildContext {
  isSales: boolean;
  /** PO-level uninvoiced balance node (direct from PO). Off for single-branch workspace views. */
  showPoUninvoicedBalanceNode?: boolean;
}

/** A PO's documents and how they follow each other; shown as a tree. */
export interface IDocGraph {
  nodes: IDocGraphNode[];
  links: IDocGraphLink[];
}

/** What one line of the document tree shows. */
export interface IGraphCardView {
  stageTone: string;
  stageIcon: string;
  state: string;
  statusLabel: string;
  docName: string;
  primaryText: string;
  isPlaceholder: boolean;
  formattedDate: string;
  amount: number | null | undefined;
  /** "No file" badge when the document's upload is missing. */
  missingFileLabel: string | null;
}
