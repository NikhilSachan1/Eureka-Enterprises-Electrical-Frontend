import { ApplicationMenu } from '../../shared/models';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '../../shared/constants';

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
          label: 'Settings',
          icon: ICONS.SETTINGS.COG,
          children: [
            {
              label: 'Permission Management',
              icon: ICONS.SECURITY.SHIELD,
              routerLink: `${ROUTE_BASE_PATHS.SETTINGS.BASE}/${ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE}/${ROUTE_BASE_PATHS.SETTINGS.PERMISSION.SYSTEM}`,
            },
          ],
        },
        {
          label: 'Permission Management',
          icon: ICONS.SECURITY.SHIELD,
          children: [
            {
              label: 'View Permissions',
              icon: ICONS.COMMON.LIST,
              routerLink: `${ROUTE_BASE_PATHS.PERMISSION}/${ROUTES.PERMISSION.LIST}`,
            },
            {
              label: 'Add Permission',
              icon: ICONS.COMMON.ADD,
              routerLink: `${ROUTE_BASE_PATHS.PERMISSION}/${ROUTES.PERMISSION.ADD}`,
            },
            {
              label: 'Manage Assignments',
              icon: ICONS.SETTINGS.COG,
              routerLink: `${ROUTE_BASE_PATHS.PERMISSION}/${ROUTES.PERMISSION.MANAGE}`,
            },
          ],
        },
      ],
    },
  ],
};