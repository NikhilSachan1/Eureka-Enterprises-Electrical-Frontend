import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ICONS, ROUTES } from '@shared/constants';
import { ETabMode, ITabItem } from '@shared/types';
import { NavTabsComponent } from '@shared/components/nav-tabs/nav-tabs.component';
import { EDocContext } from '../../types/doc.enum';

@Component({
  selector: 'app-doc-integration',
  standalone: true,
  imports: [NavTabsComponent],
  templateUrl: './doc-integration.component.html',
  styleUrl: './doc-integration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocIntegrationComponent {
  private readonly route = inject(ActivatedRoute);

  /** From parent route `data.docContext` (contractor-doc / vendor-doc). */
  private readonly docContext = this.route.snapshot.data[
    'docContext'
  ] as EDocContext;

  protected readonly tabModeType = ETabMode.ROUTER_OUTLET;

  protected readonly docItems = computed(() => this.getDocTabs());

  private getDocTabs(): ITabItem[] {
    const ctx = this.docContext;
    return [
      {
        route: ROUTES.SITE.PROJECT.WORKSPACE_DOC.PO,
        label: 'PO',
        icon: ICONS.COMMON.FILE,
      },
      {
        route: ROUTES.SITE.PROJECT.WORKSPACE_DOC.JMC,
        label: 'JMC',
        icon: ICONS.COMMON.FILE,
      },
      {
        route: ROUTES.SITE.PROJECT.WORKSPACE_DOC.REPORT,
        label: 'Report',
        icon: ICONS.COMMON.CHART,
      },
      {
        route: ROUTES.SITE.PROJECT.WORKSPACE_DOC.INVOICE,
        label: 'Invoice',
        icon: ICONS.COMMON.FILE,
      },
      {
        route: ROUTES.SITE.PROJECT.WORKSPACE_DOC.BOOK_PAYMENT,
        label: 'Book Payment',
        icon: ICONS.COMMON.BOOK,
        visible: ctx === EDocContext.PURCHASE,
      },
      {
        route: ROUTES.SITE.PROJECT.WORKSPACE_DOC.BANK_TRANSFER,
        label: 'Bank Transfer',
        icon: ICONS.COMMON.ARROW_RIGHT_LEFT,
      },
      {
        route: ROUTES.SITE.PROJECT.WORKSPACE_DOC.PAYMENT_ADVICE,
        label: 'Payment Advice',
        icon: ICONS.COMMON.EMAIL,
        visible: ctx === EDocContext.PURCHASE,
      },
    ];
  }
}
