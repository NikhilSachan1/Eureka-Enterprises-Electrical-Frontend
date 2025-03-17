import { Component, OnInit, signal } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
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
  styleUrl: './sidebar.component.scss',
  providers: [MessageService],
})
export class SidebarComponent implements OnInit {
  items: CustomMenuItem[] = [];
  sidebarVisible = signal(true);
  tooltipVisible = false;
  tooltipText = '';
  tooltipPosition = { top: 0, left: 0 };

  // User data - in a real app, this would come from a service
  user = {
    name: 'John Doe',
    designation: 'Senior Engineer',
    avatar:
      'https://primefaces.org/cdn/primeng/images/demo/avatar/amyelsner.png',
  };

  constructor(private router: Router) {}

  toggleSidebar() {
    this.sidebarVisible.update((value) => !value);
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
          },
          {
            label: 'Settings',
            icon: 'pi pi-cog',
            routerLink: '/settings',
          },
          {
            label: 'Settings',
            icon: 'pi pi-cog',
            routerLink: '/settings',
          },
          {
            label: 'Settings',
            icon: 'pi pi-cog',
            routerLink: '/settings',
          },
          {
            label: 'Settings',
            icon: 'pi pi-cog',
            routerLink: '/settings',
          },
          {
            label: 'Settings',
            icon: 'pi pi-cog',
            routerLink: '/settings',
          },
          {
            label: 'Settings',
            icon: 'pi pi-cog',
            routerLink: '/settings',
          },
          {
            label: 'Settings',
            icon: 'pi pi-cog',
            routerLink: '/settings',
          },{
            label: 'Settings',
            icon: 'pi pi-cog',
            routerLink: '/settings',
          },{
            label: 'Settings',
            icon: 'pi pi-cog',
            routerLink: '/settings',
          },{
            label: 'Settings',
            icon: 'pi pi-cog',
            routerLink: '/settings',
          },{
            label: 'Settings',
            icon: 'pi pi-cog',
            routerLink: '/settings',
          },{
            label: 'Settings',
            icon: 'pi pi-cog',
            routerLink: '/settings',
          },

        ],
      },
    ];
  }

  showTooltip(event: MouseEvent, text: string | undefined) {
    this.tooltipText = text || '';
    this.tooltipVisible = true;

    // Position the tooltip next to the menu item
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    this.tooltipPosition = {
      top: rect.top + rect.height / 2 - 10,
      left: rect.right + 10,
    };
  }

  hideTooltip() {
    this.tooltipVisible = false;
  }
}
