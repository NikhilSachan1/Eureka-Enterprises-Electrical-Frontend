import { EDocChainNodeState } from '../types/project-document-status-detail.enum';
import {
  IDocChainNodeVm,
  IDocGraph,
  IGraphCardView,
} from '../types/project-document-status-detail.interface';
import { buildGraphCardView } from './project-document-status-graph.util';

/** One document of a PO's chain, with the documents that follow it. */
export interface IDocTreeNode {
  id: string;
  data: IDocChainNodeVm;
  card: IGraphCardView;
  children: IDocTreeNode[];
  /** Documents in this branch (itself included) that still need something. */
  gapCount: number;
}

const GAP_STATES = new Set<EDocChainNodeState>([
  EDocChainNodeState.PENDING,
  EDocChainNodeState.REJECTED,
  EDocChainNodeState.MISSING,
  EDocChainNodeState.PARTIAL,
]);

/** Pending, rejected, partial or not made yet — and actually expected. */
export function isDocGap(data: IDocChainNodeVm): boolean {
  return !data.isNotApplicable && GAP_STATES.has(data.state);
}

/**
 * The chain graph (nodes + "follows" links) as a tree: a node's children are the documents
 * linked from it, in the order the chain added them. Roots are the nodes nothing links to (the
 * PO). The status logic stays in the graph builder; this only changes how it is laid out.
 */
export function buildDocTree(graph: IDocGraph): IDocTreeNode[] {
  const childIds = new Map<string, string[]>();
  const hasParent = new Set<string>();
  for (const link of graph.links) {
    const list = childIds.get(link.source) ?? [];
    list.push(link.target);
    childIds.set(link.source, list);
    hasParent.add(link.target);
  }

  const dataById = new Map(graph.nodes.map(node => [node.id, node.data]));

  const build = (id: string, seen: Set<string>): IDocTreeNode | null => {
    const data = dataById.get(id);
    // `seen` guards against a cycle, which the chain never has but a bad link could create.
    if (!data || seen.has(id)) {
      return null;
    }
    const nextSeen = new Set(seen).add(id);
    const children = (childIds.get(id) ?? [])
      .map(childId => build(childId, nextSeen))
      .filter((child): child is IDocTreeNode => child !== null);

    return {
      id,
      data,
      card: buildGraphCardView(data),
      children,
      gapCount:
        (isDocGap(data) ? 1 : 0) +
        children.reduce((sum, child) => sum + child.gapCount, 0),
    };
  };

  return graph.nodes
    .filter(node => !hasParent.has(node.id))
    .map(node => build(node.id, new Set()))
    .filter((node): node is IDocTreeNode => node !== null);
}
