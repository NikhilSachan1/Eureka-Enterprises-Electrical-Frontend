import { Component, OnInit, signal, HostListener } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { SidebarModule } from 'primeng/sidebar';
import { DividerModule } from 'primeng/divider';
import { RippleModule } from 'primeng/ripple';

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
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  items: CustomMenuItem[] = [];
  sidebarVisible = signal(true);
  showUserMenu = false;
  isMobile = window.innerWidth <= 768;

  // User data - in a real app, this would come from a service
  user = {
    name: 'John Doe',
    designation: 'Senior Engineer',
    avatar: 'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png',
  };

  constructor(public router: Router) {
    this.sidebarVisible.set(!this.isMobile);
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

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
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
  }
}
