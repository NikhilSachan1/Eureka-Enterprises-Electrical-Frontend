import { ApplicationMenu } from '@shared/models';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';

export const appMenu: ApplicationMenu = {
  sections: [
    {
      label: 'Main',
      items: [
        {
          label: 'Dashboard',
          icon: ICONS.COMMON.HOME,
          routerLink: ROUTE_BASE_PATHS.DASHBOARD,
        },
        {
          label: 'Attendance',
          icon: ICONS.COMMON.HOME,
          children: [
            {
              label: 'Attendance List',
              icon: ICONS.ATTENDANCE.CALENDAR,
              routerLink: `${ROUTE_BASE_PATHS.ATTENDANCE}/${ROUTES.ATTENDANCE.LIST}`,
            },
            {
              label: 'Apply Attendance',
              icon: ICONS.ATTENDANCE.CHECK,
              routerLink: `${ROUTE_BASE_PATHS.ATTENDANCE}/${ROUTES.ATTENDANCE.APPLY}`,
            },
            {
              label: 'Force Attendance',
              icon: ICONS.ATTENDANCE.FORCE,
              routerLink: `${ROUTE_BASE_PATHS.ATTENDANCE}/${ROUTES.ATTENDANCE.FORCE}`,
            },
          ],
        },
        {
          label: 'Settings',
          icon: ICONS.SETTINGS.COG,
          children: [
            {
              label: 'Permission Management',
              icon: ICONS.SECURITY.SHIELD,
              routerLink: `${ROUTE_BASE_PATHS.SETTINGS.BASE}/${ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE}`,
            },
          ],
        },
      ],
    },
  ],
};
