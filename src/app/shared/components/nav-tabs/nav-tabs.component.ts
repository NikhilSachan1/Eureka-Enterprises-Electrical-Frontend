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
import { trigger, transition, style, animate } from '@angular/animations';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  RouterModule,
  Router,
  ActivatedRoute,
  NavigationEnd,
} from '@angular/router';
import { Location, NgClass } from '@angular/common';
import { filter } from 'rxjs/operators';
import { TabsModule } from 'primeng/tabs';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { ITabChange, ITabItem, ETabMode, ETabLayout } from '@shared/types';

@Component({
  selector: 'app-nav-tabs',
  standalone: true,
  imports: [RouterModule, TabsModule, BadgeModule, TooltipModule, NgClass],
  templateUrl: './nav-tabs.component.html',
  styleUrl: './nav-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    // Opacity only — translateY read as extra “jerk” with router swaps + scroll.
    trigger('routeOutletFade', [
      transition('* => *', [
        style({ opacity: 0.92 }),
        animate('140ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class NavTabsComponent implements OnInit {
  tabs = input.required<ITabItem[]>();
  activeTabIndex = input<number>(0);
  tabMode = input<ETabMode>(ETabMode.ROUTER_OUTLET);
  layout = input<ETabLayout>(ETabLayout.HORIZONTAL);
  allTabMode = ETabMode;
  protected readonly tabLayout = ETabLayout;

  tabChanged = output<ITabChange>();

  /** URL used for outlet fade + active tab; protected for template binding. */
  protected readonly currentRoute = signal<string>('');
  protected selectedTabIndex = signal<number>(0);

  private router = inject(Router);
  /** Host route for relative `routerLink` when using `ROUTER_OUTLET` mode. */
  protected readonly route = inject(ActivatedRoute);
  private location = inject(Location);
  private destroyRef = inject(DestroyRef);

  protected readonly visibleTabs = computed(() =>
    this.tabs().filter(tab => tab.visible !== false)
  );

  ngOnInit(): void {
    if (this.tabMode() === this.allTabMode.CONTENT) {
      const currentParams = this.route.snapshot.queryParams;
      const tabIndexParam = currentParams['tab'];

      if (tabIndexParam !== undefined) {
        const tabIndex = parseInt(tabIndexParam, 10);
        if (
          !isNaN(tabIndex) &&
          tabIndex >= 0 &&
          tabIndex < this.visibleTabs().length
        ) {
          this.selectedTabIndex.set(tabIndex);
          this.setActiveTabByIndex(tabIndex);
        } else {
          this.selectedTabIndex.set(this.activeTabIndex());
          this.setActiveTabByIndex(this.activeTabIndex());
        }
      } else {
        const initialIndex = this.activeTabIndex();
        this.selectedTabIndex.set(initialIndex);
        this.updateUrlWithoutNavigation(initialIndex);
        this.setActiveTabByIndex(initialIndex);
      }
    } else {
      this.currentRoute.set(this.router.url);
      this.redirectToFirstVisibleTabIfAtParent(this.router.url);

      this.router.events
        .pipe(
          filter(
            (event): event is NavigationEnd => event instanceof NavigationEnd
          ),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe((event: NavigationEnd) => {
          this.currentRoute.set(event.url);
          this.redirectToFirstVisibleTabIfAtParent(event.urlAfterRedirects);
        });
    }
  }

  /** When the URL ends at this tab host route, open the first visible child tab. */
  private redirectToFirstVisibleTabIfAtParent(url: string): void {
    const parentPath = this.route.snapshot.routeConfig?.path;
    const firstTab = this.visibleTabs()[0];

    if (!parentPath || !firstTab) {
      return;
    }

    const segments = url.split('?')[0].split('/').filter(Boolean);
    if (segments.at(-1) !== parentPath) {
      return;
    }

    void this.router.navigate([firstTab.route], {
      relativeTo: this.route,
      replaceUrl: true,
    });
  }

  protected currentActiveTab = computed(() => {
    const tabs = this.visibleTabs();

    if (this.tabMode() === this.allTabMode.ROUTER_OUTLET) {
      const path = this.currentRoute().split('?')[0];
      const segments = path.split('/').filter(s => s.length > 0);
      let match: ITabItem | undefined;
      for (const seg of segments) {
        const tab = tabs.find(t => t.route === seg);
        if (tab) {
          match = tab;
        }
      }
      return match?.route ?? tabs[0]?.route ?? '';
    }

    return tabs[this.selectedTabIndex()]?.route || tabs[0]?.route || '';
  });

  onTabClick(tab: ITabItem, index: number): void {
    if (this.tabMode() === this.allTabMode.CONTENT) {
      this.selectedTabIndex.set(index);
      this.updateUrlWithoutNavigation(index);
      this.tabChanged.emit({ tab, index });
    }
  }

  private updateUrlWithoutNavigation(tabIndex: number): void {
    const tree = this.router.parseUrl(this.router.url);
    tree.queryParams = {
      ...tree.queryParams,
      tab: tabIndex.toString(),
    };

    this.location.replaceState(tree.toString());
  }

  private setActiveTabByIndex(index: number): void {
    const tab = this.visibleTabs()[index];
    if (tab) {
      this.tabChanged.emit({ tab, index });
    }
  }
}
