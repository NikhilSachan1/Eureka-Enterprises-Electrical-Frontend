import { Component, OnInit, signal, HostListener, Renderer2 } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { SidebarModule } from 'primeng/sidebar';
import { DividerModule } from 'primeng/divider';
import { RippleModule } from 'primeng/ripple';
import { trigger, transition, style, animate } from '@angular/animations';

interface CustomMenuItem extends MenuItem {
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    AvatarModule,
    SidebarModule,
    DividerModule,
    RippleModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translate3d(-50%, -8px, 0)',
          transformOrigin: 'top',
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          perspective: 1000
        }),
        animate('80ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({
            opacity: 1,
            transform: 'translate3d(-50%, 0, 0)'
          })
        )
      ]),
      transition(':leave', [
        style({
          transformOrigin: 'top',
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          perspective: 1000
        }),
        animate('60ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({
            opacity: 0,
            transform: 'translate3d(-50%, -8px, 0)'
          })
        )
      ])
    ])
  ]
})
export class SidebarComponent implements OnInit {
  items: CustomMenuItem[] = [];
  sidebarVisible = signal(true);
  showUserOptions = signal(false);
  isDarkTheme = signal(false);
  isMobile = window.innerWidth <= 768;

  // User data - in a real app, this would come from a service
  user = {
    name: 'John Doe',
    designation: 'Software Engineer',
    avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png'
  };

  constructor(
    public router: Router,
    private renderer: Renderer2
  ) {
    this.sidebarVisible.set(!this.isMobile);
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    this.isDarkTheme.set(savedTheme === 'dark');
    this.applyTheme(this.isDarkTheme());
  }

  @HostListener('window:resize')
  onResize() {
    const wasNotMobile = !this.isMobile;
    this.isMobile = window.innerWidth <= 768;
    
    if (wasNotMobile && this.isMobile) {
      this.sidebarVisible.set(false);
    } else if (!wasNotMobile && !this.isMobile) {
      this.sidebarVisible.set(true);
    }
  }

  @HostListener('window:click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-options') && !target.matches('img')) {
      this.showUserOptions.set(false);
    }
  }

  toggleUserOptions() {
    this.showUserOptions.update(v => !v);
  }

  toggleTheme() {
    this.isDarkTheme.update(v => !v);
    this.applyTheme(this.isDarkTheme());
    // Save theme preference
    localStorage.setItem('theme', this.isDarkTheme() ? 'dark' : 'light');
  }

  private applyTheme(isDark: boolean) {
    if (isDark) {
      this.renderer.addClass(document.body, 'dark-theme');
    } else {
      this.renderer.removeClass(document.body, 'dark-theme');
    }
  }

  // Navigation methods
  navigateToProfile() {
    this.router.navigate(['/profile']);
    this.showUserOptions.set(false);
  }

  navigateToSettings() {
    this.router.navigate(['/settings']);
    this.showUserOptions.set(false);
  }

  navigateToResetPassword() {
    this.router.navigate(['/reset-password']);
    this.showUserOptions.set(false);
  }

  logout() {
    // Add your logout logic here
    this.router.navigate(['/login']);
  }

  toggleSidebar() {
    this.sidebarVisible.update((value) => !value);
    if (this.isMobile) {
      document.body.style.overflow = this.sidebarVisible() ? 'hidden' : '';
    }
  }

  toggleSubmenu(category: CustomMenuItem) {
    if (category.items) {
      this.items[0].items?.forEach(item => {
        if (item !== category && item.items) {
          item.expanded = false;
        }
      });
      category.expanded = !category.expanded;
    } else {
      this.items[0].items?.forEach(item => {
        if (item.items) {
          item.expanded = false;
        }
      });
    }
  }

  ngOnInit() {
    this.items = [
      {
        label: 'Services',
        items: [
          {
            label: 'Dashboard',
            icon: 'pi pi-home',
            routerLink: '/dashboard',
          },
          {
            label: 'Attendance',
            icon: 'pi pi-calendar',
            items: [
              {
                label: 'Check In/Out',
                icon: 'pi pi-clock',
                routerLink: '/attendance/check',
              },
              {
                label: 'History',
                icon: 'pi pi-history',
                routerLink: '/attendance/history',
              },
            ],
          },
          {
            label: 'Leave',
            icon: 'pi pi-calendar-minus',
            items: [
              {
                label: 'Apply Leave',
                icon: 'pi pi-plus-circle',
                routerLink: '/leave/apply',
              },
              {
                label: 'Leave Status',
                icon: 'pi pi-list',
                routerLink: '/leave/status',
              },
            ],
          },
          {
            label: 'Expenses',
            icon: 'pi pi-wallet',
            items: [
              {
                label: 'Add Expense',
                icon: 'pi pi-plus',
                routerLink: '/expenses/add',
              },
              {
                label: 'Ledger',
                icon: 'pi pi-book',
                routerLink: '/expenses/ledger',
              },
            ],
          },
          {
            label: 'Payroll',
            icon: 'pi pi-dollar',
            items: [
              {
                label: 'Salary Slips',
                icon: 'pi pi-file',
                routerLink: '/payroll/slips',
              },
              {
                label: 'Tax Documents',
                icon: 'pi pi-file-pdf',
                routerLink: '/payroll/tax',
              },
            ],
          },
          {
            label: 'Projects',
            icon: 'pi pi-briefcase',
            routerLink: '/projects',
          },
          {
            label: 'Team',
            icon: 'pi pi-users',
            routerLink: '/team',
          }
        ],
      },
    ];
    // Apply initial theme
    this.applyTheme(this.isDarkTheme());
  }
}
