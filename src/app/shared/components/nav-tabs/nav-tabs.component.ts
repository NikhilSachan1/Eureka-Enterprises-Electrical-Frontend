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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  RouterModule,
  Router,
  ActivatedRoute,
  NavigationEnd,
} from '@angular/router';
import { Location } from '@angular/common';
import { filter } from 'rxjs/operators';
import { TabsModule } from 'primeng/tabs';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { ITabChange, ITabItem, ETabMode } from '@shared/types';

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
  protected selectedTabIndex = signal<number>(0);

  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private location = inject(Location);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    if (this.tabMode() === this.allTabMode.CONTENT) {
      // Check for tab in query params first (for deep linking)
      const currentParams = this.activatedRoute.snapshot.queryParams;
      const tabIndexParam = currentParams['tab'];

      if (tabIndexParam !== undefined) {
        const tabIndex = parseInt(tabIndexParam, 10);
        if (
          !isNaN(tabIndex) &&
          tabIndex >= 0 &&
          tabIndex < this.tabs().length
        ) {
          this.selectedTabIndex.set(tabIndex);
          // Emit event so parent component shows correct content
          this.setActiveTabByIndex(tabIndex);
        } else {
          this.selectedTabIndex.set(this.activeTabIndex());
          this.setActiveTabByIndex(this.activeTabIndex());
        }
      } else {
        const initialIndex = this.activeTabIndex();
        this.selectedTabIndex.set(initialIndex);
        this.updateUrlWithoutNavigation(initialIndex);
        // Emit event so parent component shows correct content
        this.setActiveTabByIndex(initialIndex);
      }
    } else {
      this.currentRoute.set(this.router.url);

      this.router.events
        .pipe(
          filter(
            (event): event is NavigationEnd => event instanceof NavigationEnd
          ),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe((event: NavigationEnd) => {
          this.currentRoute.set(event.url);
        });
    }
  }

  protected currentActiveTab = computed(() => {
    const tabs = this.tabs();

    if (this.tabMode() === this.allTabMode.ROUTER_OUTLET) {
      const currentUrl = this.currentRoute();
      const matchingTab = tabs.find(tab => currentUrl.includes(tab.route));
      return matchingTab ? matchingTab.route : tabs[0]?.route || '';
    }

    // For CONTENT mode, use selectedTabIndex signal (no URL dependency)
    return tabs[this.selectedTabIndex()]?.route || tabs[0]?.route || '';
  });

  onTabClick(tab: ITabItem, index: number): void {
    if (this.tabMode() === this.allTabMode.CONTENT) {
      // Update selected tab
      this.selectedTabIndex.set(index);

      // Update URL without router navigation (no animation!)
      this.updateUrlWithoutNavigation(index);

      // Emit tab change event
      this.tabChanged.emit({ tab, index });
    }
  }

  private updateUrlWithoutNavigation(tabIndex: number): void {
    // Get current URL
    const tree = this.router.parseUrl(this.router.url);

    // Update query params
    tree.queryParams = {
      ...tree.queryParams,
      tab: tabIndex.toString(),
    };

    // Replace URL without navigation (no animation!)
    this.location.replaceState(tree.toString());
  }

  private setActiveTabByIndex(index: number): void {
    const tab = this.tabs()[index];
    if (tab) {
      this.tabChanged.emit({ tab, index });
    }
  }
}
