import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavTabsComponent } from '@shared/components/nav-tabs/nav-tabs.component';
import { ETabLayout, ETabMode, ETabTier, ITabItem } from '@shared/types';
import { DSR_TABS } from '../../config/page/dsr-tabs.config';

/** Sub-tabs of the workspace daily progress (DSR), laid out like the allocation history tabs. */
@Component({
  selector: 'app-dsr-tabs',
  imports: [NavTabsComponent],
  template: `<app-nav-tabs
    [tabs]="tabs"
    [tabMode]="tabMode"
    [layout]="tabLayout"
    [tier]="tabTier"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsrTabsComponent {
  protected readonly tabMode = ETabMode.ROUTER_OUTLET;
  protected readonly tabLayout = ETabLayout.HORIZONTAL;
  protected readonly tabTier = ETabTier.SECONDARY;
  protected readonly tabs: ITabItem[] = DSR_TABS;
}
