import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavTabsComponent } from '@shared/components/nav-tabs/nav-tabs.component';
import { ICONS, ROUTES } from '@shared/constants';
import { ETabLayout, ETabMode, ETabTier, ITabItem } from '@shared/types';

const { ENTRIES, EMPLOYEE_WISE, PROJECT_WISE } =
  ROUTES.SITE.PROJECT.ALLOCATION_HISTORY_TAB;

/** Sub-tabs of the workspace allocation history, laid out like the document tabs. */
@Component({
  selector: 'app-allocation-history-tabs',
  imports: [NavTabsComponent],
  template: `<app-nav-tabs
    [tabs]="tabs"
    [tabMode]="tabMode"
    [layout]="tabLayout"
    [tier]="tabTier"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllocationHistoryTabsComponent {
  protected readonly tabMode = ETabMode.ROUTER_OUTLET;
  protected readonly tabLayout = ETabLayout.HORIZONTAL;
  protected readonly tabTier = ETabTier.SECONDARY;

  protected readonly tabs: ITabItem[] = [
    { route: ENTRIES, label: 'Entries', icon: ICONS.COMMON.LIST },
    { route: EMPLOYEE_WISE, label: 'Employee wise', icon: ICONS.COMMON.USERS },
    { route: PROJECT_WISE, label: 'Project wise', icon: ICONS.SITE.BUILDING },
  ];
}
