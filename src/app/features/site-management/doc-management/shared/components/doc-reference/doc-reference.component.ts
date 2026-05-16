import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import {
  IDocReferenceHierarchyNode,
  EDocReferenceHierarchyKind,
} from '@features/site-management/doc-management/shared/types/doc-reference.interface';
import { DOC_REFERENCE_KIND_LABELS } from '@features/site-management/doc-management/shared/utils/doc-reference-hierarchy.builder';

@Component({
  selector: 'app-doc-reference',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  templateUrl: './doc-reference.component.html',
  styleUrl: './doc-reference.component.scss',
})
export class DocReferenceComponent {
  /**
   * Tree produced by `DocReferenceHierarchy` (canonical PO → … chain); callers
   * pass only values/DTO extracts — ordering and tiers live in shared code.
   */
  readonly root = input<IDocReferenceHierarchyNode | null>(null);

  protected nodeTplContext(
    node: IDocReferenceHierarchyNode,
    isRoot: boolean
  ): { node: IDocReferenceHierarchyNode; isRoot: boolean } {
    return { node, isRoot };
  }

  protected label(node: IDocReferenceHierarchyNode): string {
    return node.labelOverride ?? DOC_REFERENCE_KIND_LABELS[node.kind];
  }

  protected nextNode(
    node: IDocReferenceHierarchyNode
  ): IDocReferenceHierarchyNode | null {
    const c = node.child;
    return c?.value?.trim() ? c : null;
  }

  protected tone(kind: EDocReferenceHierarchyKind): string {
    switch (kind) {
      case EDocReferenceHierarchyKind.Po:
        return 'po';
      case EDocReferenceHierarchyKind.Jmc:
        return 'jmc';
      case EDocReferenceHierarchyKind.Report:
        return 'report';
      case EDocReferenceHierarchyKind.Invoice:
        return 'invoice';
      case EDocReferenceHierarchyKind.BookPayment:
      case EDocReferenceHierarchyKind.BankTransfer:
        return 'payment';
      default:
        return 'x0';
    }
  }
}
