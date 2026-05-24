import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppPermissionService } from '@core/services';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';
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
  private readonly appPermissionService = inject(AppPermissionService);

  /** From parent route `data.docContext` (contractor-doc / vendor-doc). */
  private readonly docContext = this.route.snapshot.data[
    'docContext'
  ] as EDocContext;

  protected readonly tabModeType = ETabMode.ROUTER_OUTLET;

  protected readonly docItems = computed((): ITabItem[] => {
    const ctx = this.docContext;
    const {
      PO_DOC,
      JMC_DOC,
      REPORT_DOC,
      INVOICE_DOC,
      BOOK_PAYMENT_DOC,
      BANK_TRANSFER_DOC,
    } = APP_PERMISSION;

    return [
      {
        route: ROUTES.SITE.PROJECT.WORKSPACE_DOC.PO,
        label: 'PO',
        icon: ICONS.COMMON.FILE,
        visible: this.appPermissionService.hasPermission(PO_DOC.TABLE_VIEW),
      },
      {
        route: ROUTES.SITE.PROJECT.WORKSPACE_DOC.JMC,
        label: 'JMC',
        icon: ICONS.COMMON.FILE,
        visible: this.appPermissionService.hasPermission(JMC_DOC.TABLE_VIEW),
      },
      {
        route: ROUTES.SITE.PROJECT.WORKSPACE_DOC.REPORT,
        label: 'Report',
        icon: ICONS.COMMON.CHART,
        visible: this.appPermissionService.hasPermission(REPORT_DOC.TABLE_VIEW),
      },
      {
        route: ROUTES.SITE.PROJECT.WORKSPACE_DOC.INVOICE,
        label: 'Invoice',
        icon: ICONS.COMMON.FILE,
        visible: this.appPermissionService.hasPermission(
          INVOICE_DOC.TABLE_VIEW
        ),
      },
      {
        route: ROUTES.SITE.PROJECT.WORKSPACE_DOC.BOOK_PAYMENT,
        label: 'Book Payment',
        icon: ICONS.COMMON.BOOK,
        visible:
          ctx === EDocContext.PURCHASE &&
          this.appPermissionService.hasPermission(BOOK_PAYMENT_DOC.TABLE_VIEW),
      },
      {
        route: ROUTES.SITE.PROJECT.WORKSPACE_DOC.BANK_TRANSFER,
        label: 'Bank Transfer',
        icon: ICONS.COMMON.ARROW_RIGHT_LEFT,
        visible: this.appPermissionService.hasPermission(
          BANK_TRANSFER_DOC.TABLE_VIEW
        ),
      },
    ];
  });
}
