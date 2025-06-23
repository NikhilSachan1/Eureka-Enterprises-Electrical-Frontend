import { Component, input, computed, signal } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { ITabItem } from '../../models';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-shared-tabs',
  standalone: true,
  imports: [
    RouterModule,
    TabsModule,
    TooltipModule
  ],
  templateUrl: './shared-tabs.component.html',
  styleUrl: './shared-tabs.component.scss'
})
export class SharedTabsComponent {

  tabs = input.required<ITabItem[]>();
  activeTabIndex = input<number>(0);
  showRouterOutlet = input<boolean>(true);

  private currentRoute = signal<string>('');

  constructor(private router: Router) {
    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute.set(event.url);
    });

    // Set initial route
    this.currentRoute.set(this.router.url);
  }

  protected currentActiveTab = computed(() => {
    const currentUrl = this.currentRoute();
    const tabs = this.tabs();
    
    // Find the tab that matches the current route
    const matchingTab = tabs.find(tab => currentUrl.includes(tab.route));

    if (matchingTab) {
      return matchingTab.route;
    }

    // Fallback to first tab
    return tabs[0]?.route || '';
  });


} 