import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

import {
  IDocReferenceHierarchyNode,
  EDocReferenceHierarchyKind,
} from '@features/site-management/doc-management/shared/types/doc-reference.interface';
import { DOC_REFERENCE_KIND_LABELS } from '@features/site-management/doc-management/shared/utils/doc-reference-hierarchy.builder';

@Component({
  selector: 'app-doc-reference',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './doc-reference.component.html',
  styleUrl: './doc-reference.component.scss',
})
export class DocReferenceComponent {
  readonly root = input<IDocReferenceHierarchyNode | null>(null);

  /** Flatten the linked-list into a plain array for the horizontal chain. */
  protected readonly flatNodes = computed<IDocReferenceHierarchyNode[]>(() => {
    const result: IDocReferenceHierarchyNode[] = [];
    let node: IDocReferenceHierarchyNode | null | undefined = this.root();
    while (node) {
      if (node.value?.trim()) {
        result.push(node);
      }
      node = node.child ?? null;
    }
    return result;
  });

  protected label(node: IDocReferenceHierarchyNode): string {
    return node.labelOverride ?? DOC_REFERENCE_KIND_LABELS[node.kind];
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
