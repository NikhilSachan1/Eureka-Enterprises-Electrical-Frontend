import {
  Component,
  input,
  computed,
  signal,
  output,
  OnInit,
  inject,
  ChangeDetectionStrategy,
  DestroyRef,
} from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { ITabChange, ITabItem, ETabMode } from '@shared/types';
import { RouterNavigationService } from '@shared/services';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-nav-tabs',
  standalone: true,
  imports: [RouterModule, TabsModule, BadgeModule, TooltipModule],
  templateUrl: './nav-tabs.component.html',
  styleUrl: './nav-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavTabsComponent implements OnInit {
  tabs = input.required<ITabItem[]>();
  activeTabIndex = input<number>(0);
  tabMode = input<ETabMode>(ETabMode.ROUTER_OUTLET);
  allTabMode = ETabMode;

  tabChanged = output<ITabChange>();

  private currentRoute = signal<string>('');

  private readonly destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private routerNavigationService = inject(RouterNavigationService);

  ngOnInit(): void {
    if (this.tabMode() === this.allTabMode.CONTENT) {
      this.activatedRoute.queryParams
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(params => {
          const tabIndexParam = params['tab'];
          if (tabIndexParam !== undefined) {
            const tabIndex = parseInt(tabIndexParam, 10);
            if (
              !isNaN(tabIndex) &&
              tabIndex >= 0 &&
              tabIndex < this.tabs().length
            ) {
              this.setActiveTabByIndex(tabIndex);
            }
          }
        });
    } else {
      this.currentRoute.set(this.router.url);
    }
  }

  protected currentActiveTab = computed(() => {
    const tabs = this.tabs();

    if (this.tabMode() === this.allTabMode.ROUTER_OUTLET) {
      const currentUrl = this.currentRoute();
      const matchingTab = tabs.find(tab => currentUrl.includes(tab.route));
      return matchingTab ? matchingTab.route : tabs[0]?.route || '';
    }
    const tabIndexParam =
      this.routerNavigationService.getRouteQueryParam('tab');
    if (tabIndexParam !== null) {
      const tabIndex = parseInt(tabIndexParam, 10);
      if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex < tabs.length) {
        return tabs[tabIndex]?.route || tabs[0]?.route || '';
      }
    }

    return tabs[this.activeTabIndex()]?.route || tabs[0]?.route || '';
  });

  onTabClick(tab: ITabItem, index: number): void {
    if (this.tabMode() === this.allTabMode.CONTENT) {
      void this.routerNavigationService.navigateWithQueryParams(
        [],
        { tab: index },
        {
          queryParamsHandling: 'merge',
          relativeTo: this.activatedRoute,
        }
      );

      this.tabChanged.emit({ tab, index });
    }
  }

  private setActiveTabByIndex(index: number): void {
    const tab = this.tabs()[index];
    if (tab) {
      this.tabChanged.emit({ tab, index });
    }
  }
}
