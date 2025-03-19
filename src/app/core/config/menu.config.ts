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
          label: 'Dashboard',
          icon: 'pi pi-home',
          routerLink: '/dashboard',
        },
        {
          label: 'Attendance',
          icon: 'pi pi-calendar',
          children: [
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
          children: [
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
      ],
    },
  ],
};