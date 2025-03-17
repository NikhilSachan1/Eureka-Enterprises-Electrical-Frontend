import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

interface MenuItem {
  label: string;
  icon?: string;
  routerLink?: string;
  items?: MenuItem[];
  expanded?: boolean;
}

interface SidebarItem {
  label: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [CommonModule, RouterLink]
})
export class SidebarComponent implements OnInit {
  sidebarVisible = signal(true);
  showOptionsMenu = false;
  isMobile = window.innerWidth <= 768;
  isDarkTheme = signal(false);

  user = {
    name: 'John Doe',
    designation: 'Admin',
    avatar: 'https://i.pravatar.cc/150?img=3'
  };

  items: SidebarItem[] = [
    {
      label: 'Services',
      items: [
        {
          label: 'Dashboard',
          icon: 'pi pi-home',
          routerLink: '/dashboard'
        },
        {
          label: 'Employees',
          icon: 'pi pi-users',
          routerLink: '/employees'
        },
        {
          label: 'Reports',
          icon: 'pi pi-chart-bar',
          items: [
            {
              label: 'Daily Reports',
              icon: 'pi pi-calendar',
              routerLink: '/reports/daily'
            },
            {
              label: 'Monthly Reports',
              icon: 'pi pi-calendar',
              routerLink: '/reports/monthly'
            }
          ]
        },
        {
          label: 'Dashboard',
          icon: 'pi pi-home',
          routerLink: '/dashboard'
        },
        {
          label: 'Employees',
          icon: 'pi pi-users',
          routerLink: '/employees'
        },
        {
          label: 'Reports',
          icon: 'pi pi-chart-bar',
          items: [
            {
              label: 'Daily Reports',
              icon: 'pi pi-calendar',
              routerLink: '/reports/daily'
            },
            {
              label: 'Monthly Reports',
              icon: 'pi pi-calendar',
              routerLink: '/reports/monthly'
            }
          ]
        },
        {
          label: 'Dashboard',
          icon: 'pi pi-home',
          routerLink: '/dashboard'
        },
        {
          label: 'Employees',
          icon: 'pi pi-users',
          routerLink: '/employees'
        },
        {
          label: 'Reports',
          icon: 'pi pi-chart-bar',
          items: [
            {
              label: 'Daily Reports',
              icon: 'pi pi-calendar',
              routerLink: '/reports/daily'
            },
            {
              label: 'Monthly Reports',
              icon: 'pi pi-calendar',
              routerLink: '/reports/monthly'
            }
          ]
        },
        {
          label: 'Dashboard',
          icon: 'pi pi-home',
          routerLink: '/dashboard'
        },
        {
          label: 'Employees',
          icon: 'pi pi-users',
          routerLink: '/employees'
        },
        {
          label: 'Reports',
          icon: 'pi pi-chart-bar',
          items: [
            {
              label: 'Daily Reports',
              icon: 'pi pi-calendar',
              routerLink: '/reports/daily'
            },
            {
              label: 'Monthly Reports',
              icon: 'pi pi-calendar',
              routerLink: '/reports/monthly'
            }
          ]
        },
        {
          label: 'Dashboard',
          icon: 'pi pi-home',
          routerLink: '/dashboard'
        },
        {
          label: 'Employees',
          icon: 'pi pi-users',
          routerLink: '/employees'
        },
        {
          label: 'Reports',
          icon: 'pi pi-chart-bar',
          items: [
            {
              label: 'Daily Reports',
              icon: 'pi pi-calendar',
              routerLink: '/reports/daily'
            },
            {
              label: 'Monthly Reports',
              icon: 'pi pi-calendar',
              routerLink: '/reports/monthly'
            },
            {
              label: 'Daily Reports',
              icon: 'pi pi-calendar',
              routerLink: '/reports/daily'
            },
            {
              label: 'Monthly Reports',
              icon: 'pi pi-calendar',
              routerLink: '/reports/monthly'
            },
            {
              label: 'Daily Reports',
              icon: 'pi pi-calendar',
              routerLink: '/reports/daily'
            },
            {
              label: 'Monthly Reports',
              icon: 'pi pi-calendar',
              routerLink: '/reports/monthly'
            },
            {
              label: 'Daily Reports',
              icon: 'pi pi-calendar',
              routerLink: '/reports/daily'
            },
            {
              label: 'Monthly Reports',
              icon: 'pi pi-calendar',
              routerLink: '/reports/monthly'
            }
          ]
        }
      ]
    }
  ];

  constructor(public router: Router) {
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 768;
    });

    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.toggleTheme(true);
    }
  }

  ngOnInit(): void {
    // Initialize any necessary data
  }

  toggleSidebar(): void {
    this.sidebarVisible.set(!this.sidebarVisible());
  }

  toggleSubmenu(item: MenuItem): void {
    if (item.items) {
      item.expanded = !item.expanded;
    } else if (item.routerLink) {
      this.router.navigate([item.routerLink]);
      if (this.isMobile) {
        this.sidebarVisible.set(false);
      }
    }
  }

  toggleOptionsMenu(): void {
    this.showOptionsMenu = !this.showOptionsMenu;
  }

  toggleTheme(value?: boolean): void {
    const newValue = value !== undefined ? value : !this.isDarkTheme();
    this.isDarkTheme.set(newValue);
    
    // Update host class
    const hostElement = document.querySelector('app-sidebar');
    if (hostElement) {
      if (newValue) {
        hostElement.classList.add('dark-theme');
      } else {
        hostElement.classList.remove('dark-theme');
      }
    }

    // Save preference to localStorage
    localStorage.setItem('theme', newValue ? 'dark' : 'light');
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const optionsMenu = document.querySelector('.options-menu');
    const optionsTrigger = document.querySelector('.options-trigger');
    
    if (this.showOptionsMenu && optionsMenu && optionsTrigger) {
      const clickedElement = event.target as HTMLElement;
      if (!optionsMenu.contains(clickedElement) && !optionsTrigger.contains(clickedElement)) {
        this.showOptionsMenu = false;
      }
    }
  }

  logout(): void {
    console.log('Logging out...');
    this.router.navigate(['/login']);
  }
}
