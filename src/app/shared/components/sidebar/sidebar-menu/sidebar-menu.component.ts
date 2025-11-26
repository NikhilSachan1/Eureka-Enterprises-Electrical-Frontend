import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuService } from '@core/services';
import { slideInOut } from '@shared/animations';
import { MenuItem } from '@shared/types';
import { ICONS } from '@shared/constants';

@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss'],
  animations: [slideInOut],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarMenuComponent {
  readonly menuService = inject(MenuService);
  readonly icons = ICONS;

  /**
   * Toggle a submenu item's expanded state
   * Only one submenu can be open at a time
   */
  toggleSubmenu(item: MenuItem): void {
    if (!item.children?.length) {
      return;
    }

    this.menuService.toggleMenuItem(item);
  }

  /**
   * Close all submenus
   * Used when clicking on route menu items to ensure all submenus are closed
   */
  closeAllSubmenus(): void {
    this.menuService.closeAllMenuItems();
  }

  /**
   * Check if a menu item is expanded
   */
  isMenuItemExpanded(item: MenuItem): boolean {
    return this.menuService.isMenuItemExpanded(item);
  }

  /**
   * Check if a menu item is active based on the current route
   */
  isMenuItemActive(item: MenuItem): boolean {
    return this.menuService.isMenuItemActive(item);
  }
}
