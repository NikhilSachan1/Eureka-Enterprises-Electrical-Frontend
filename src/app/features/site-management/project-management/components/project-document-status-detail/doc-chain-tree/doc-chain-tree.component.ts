import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ICONS } from '@shared/constants';
import { IndianCurrencyPipe } from '@shared/pipes/indian-currency.pipe';
import { EDocChainStage } from '../../../types/project-document-status-detail.enum';
import { IDocGraph } from '../../../types/project-document-status-detail.interface';
import {
  buildDocTree,
  IDocTreeNode,
} from '../../../utility/project-document-status-tree.util';

/**
 * A PO's document chain as an indented tree: one line per document, its follow-ups nested under
 * it. Stays readable however many JMCs or payments a PO has — it grows in rows, not in width,
 * and a folded branch still shows how many of its documents need something.
 */
@Component({
  selector: 'app-doc-chain-tree',
  imports: [NgTemplateOutlet],
  providers: [IndianCurrencyPipe],
  templateUrl: './doc-chain-tree.component.html',
  styleUrl: './doc-chain-tree.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocChainTreeComponent {
  private readonly currencyPipe = inject(IndianCurrencyPipe);

  readonly graph = input.required<IDocGraph>();
  /** Opens the document's list in the project workspace. */
  readonly openStage = output<EDocChainStage>();

  protected readonly icons = ICONS;
  protected readonly roots = computed(() => buildDocTree(this.graph()));
  protected readonly gapTotal = computed(() =>
    this.roots().reduce((sum, root) => sum + root.gapCount, 0)
  );

  /** Folded branches (everything starts open: a chain is short enough to read in full). */
  private readonly folded = signal<ReadonlySet<string>>(new Set());
  protected readonly gapsOnly = signal(false);

  protected isOpen(node: IDocTreeNode): boolean {
    return node.children.length > 0 && !this.folded().has(node.id);
  }

  /** With "only gaps", a line shows when it or something under it needs attention. */
  protected isShown(node: IDocTreeNode): boolean {
    return !this.gapsOnly() || node.gapCount > 0;
  }

  /** Placeholders (not made yet / not needed) have no document to open. */
  protected canOpen(node: IDocTreeNode): boolean {
    return !node.data.isExpectedMissing && !node.data.isNotApplicable;
  }

  protected toggle(node: IDocTreeNode): void {
    if (!node.children.length) {
      return;
    }
    const next = new Set(this.folded());
    if (next.has(node.id)) {
      next.delete(node.id);
    } else {
      next.add(node.id);
    }
    this.folded.set(next);
  }

  protected expandAll(): void {
    this.folded.set(new Set());
  }

  /** Folds everything below the PO, so its JMCs and advances read as a list. */
  protected collapseAll(): void {
    const ids = new Set<string>();
    const walk = (nodes: IDocTreeNode[], depth: number): void => {
      for (const node of nodes) {
        if (depth > 0 && node.children.length) {
          ids.add(node.id);
        }
        walk(node.children, depth + 1);
      }
    };
    walk(this.roots(), 0);
    this.folded.set(ids);
  }

  protected toggleGapsOnly(): void {
    this.gapsOnly.update(value => !value);
  }

  protected formatAmount(value: number | null | undefined): string {
    return value && value > 0
      ? this.currencyPipe.transform(value, 'full') || String(value)
      : '';
  }

  protected open(node: IDocTreeNode, event: Event): void {
    event.stopPropagation();
    this.openStage.emit(node.data.stage);
  }
}
