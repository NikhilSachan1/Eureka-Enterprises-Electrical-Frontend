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
  animations: [
    trigger('routeOutletFade', [
      transition('* => *', [
        style({ opacity: 0.88, transform: 'translateY(3px)' }),
        animate(
          '165ms cubic-bezier(0.33, 1, 0.68, 1)',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
  ],
})
export class NavTabsComponent implements OnInit {
  tabs = input.required<ITabItem[]>();
  activeTabIndex = input<number>(0);
  tabMode = input<ETabMode>(ETabMode.ROUTER_OUTLET);
  allTabMode = ETabMode;

  tabChanged = output<ITabChange>();

  /** URL used for outlet fade + active tab; protected for template binding. */
  protected readonly currentRoute = signal<string>('');
  protected selectedTabIndex = signal<number>(0);

  private router = inject(Router);
  /** Host route for relative `routerLink` when using `ROUTER_OUTLET` mode. */
  protected readonly route = inject(ActivatedRoute);
  private location = inject(Location);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    if (this.tabMode() === this.allTabMode.CONTENT) {
      const currentParams = this.route.snapshot.queryParams;
      const tabIndexParam = currentParams['tab'];

      if (tabIndexParam !== undefined) {
        const tabIndex = parseInt(tabIndexParam, 10);
        if (
          !isNaN(tabIndex) &&
          tabIndex >= 0 &&
          tabIndex < this.tabs().length
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
    const tab = this.tabs()[index];
    if (tab) {
      this.tabChanged.emit({ tab, index });
    }
  }
}
