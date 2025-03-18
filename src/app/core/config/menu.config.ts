import { ApplicationMenu } from '../../shared/models';

/**
 * Main application menu configuration
 * This file defines the structure of the sidebar menu
 */
export const appMenu: ApplicationMenu = {
  sections: [
    {
      label: 'Services',
      items: [
        {
          type: 'route',
          label: 'Dashboard',
          icon: 'pi pi-home',
          routerLink: '/dashboard',
          permissions: ['users.view']
        },
        {
          type: 'parent',
          label: 'Attendance',
          icon: 'pi pi-calendar',
          children: [
            {
              type: 'route',
              label: 'Check In/Out',
              icon: 'pi pi-clock',
              routerLink: '/attendance/check',
            },
            {
              type: 'route',
              label: 'History',
              icon: 'pi pi-history',
              routerLink: '/attendance/history',
              permissions: ['users.view']
            },
          ],
        },
        {
          type: 'parent',
          label: 'Leave',
          icon: 'pi pi-calendar-minus',
          children: [
            {
              type: 'route',
              label: 'Apply Leave',
              icon: 'pi pi-plus-circle',
              routerLink: '/leave/apply',
            },
            {
              type: 'route',
              label: 'Leave Status',
              icon: 'pi pi-list',
              routerLink: '/leave/status',
            },
          ],
        },
        {
          type: 'parent',
          label: 'Expenses',
          icon: 'pi pi-wallet',
          permissions: ['expenses.view'],
          children: [
            {
              type: 'route',
              label: 'Add Expense',
              icon: 'pi pi-plus',
              routerLink: '/expenses/add',
              permissions: ['expenses.create']
            },
            {
              type: 'route',
              label: 'Ledger',
              icon: 'pi pi-book',
              routerLink: '/expenses/ledger',
              permissions: ['expenses.view']
            },
          ],
        },
        {
          type: 'parent',
          label: 'Payroll',
          icon: 'pi pi-dollar',
          children: [
            {
              type: 'route',
              label: 'Salary Slips',
              icon: 'pi pi-file',
              routerLink: '/payroll/slips',
            },
            {
              type: 'route',
              label: 'Tax Documents',
              icon: 'pi pi-file-pdf',
              routerLink: '/payroll/tax',
            },
          ],
        },
        {
          type: 'route',
          label: 'Projects',
          icon: 'pi pi-briefcase',
          routerLink: '/projects',
        },
        {
          type: 'route',
          label: 'Team',
          icon: 'pi pi-users',
          routerLink: '/team',
        }
      ],
    },
  ],
};