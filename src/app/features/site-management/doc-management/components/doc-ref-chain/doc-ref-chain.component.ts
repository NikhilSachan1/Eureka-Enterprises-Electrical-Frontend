import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import {
  DocIndexedDbService,
  IDocIndexedDbRow,
} from '../../services/doc-indexed-db.service';
import { AppConfigurationService } from '@shared/services';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { getDocTypeClass } from '../../utils/doc-type-colors.util';

export type DocContext = 'sales' | 'purchase';

@Component({
  selector: 'app-doc-ref-chain',
  imports: [CurrencyPipe, DatePipe, NgClass],
  templateUrl: './doc-ref-chain.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.display]': 'chain().length === 0 && !loading() ? "none" : "block"',
  },
})
export class DocRefChainComponent {
  private readonly docIndexedDbService = inject(DocIndexedDbService);
  private readonly appConfigService = inject(AppConfigurationService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly refDocId = input<string | null>(null);
  readonly docContext = input<DocContext>('sales');

  protected readonly chain = signal<IDocIndexedDbRow[]>([]);
  protected readonly loading = signal(false);

  constructor() {
    effect(() => {
      const id = this.refDocId();
      if (!id) {
        this.chain.set([]);
        return;
      }
      this.loading.set(true);
      void this.docIndexedDbService
        .getDocChain(id)
        .then(docs => {
          this.chain.set(docs.reverse()); // root first (PO → JMC → …)
          this.loading.set(false);
          this.cdr.markForCheck();
        })
        .catch(() => {
          this.chain.set([]);
          this.loading.set(false);
          this.cdr.markForCheck();
        });
    });
  }

  protected readonly getDocTypeClass = getDocTypeClass;

  protected resolveParty(doc: IDocIndexedDbRow): string | null {
    const id =
      this.docContext() === 'sales' ? doc.contractorName : doc.vendorName;
    if (!id) {
      return null;
    }
    const contractorList = this.appConfigService.contractorList();
    const mapped = getMappedValueFromArrayOfObjects(
      contractorList,
      id as never
    );
    return mapped ? String(mapped) : id;
  }
}
