import { ApplicationMenu } from '@shared/models';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';

export const appMenu: ApplicationMenu = {
  sections: [
    {
      items: [
        {
          label: 'Dashboard',
          icon: ICONS.COMMON.HOME,
          routerLink: ROUTE_BASE_PATHS.DASHBOARD,
        },
        {
          label: 'Attendance',
          icon: ICONS.ATTENDANCE.CALENDAR,
          children: [
            {
              label: 'Attendance List',
              icon: ICONS.COMMON.LIST,
              routerLink: `${ROUTE_BASE_PATHS.ATTENDANCE}/${ROUTES.ATTENDANCE.LIST}`,
            },
            {
              label: 'Apply Attendance',
              icon: ICONS.COMMON.ADD,
              routerLink: `${ROUTE_BASE_PATHS.ATTENDANCE}/${ROUTES.ATTENDANCE.APPLY}`,
            },
            {
              label: 'Force Attendance',
              icon: ICONS.ACTIONS.PENCIL,
              routerLink: `${ROUTE_BASE_PATHS.ATTENDANCE}/${ROUTES.ATTENDANCE.FORCE}`,
            },
          ],
        },
        {
          label: 'Expense Management',
          icon: ICONS.LEAVE.GET,
          children: [
            {
              label: 'Expense Ledger',
              icon: ICONS.COMMON.VIEW,
              routerLink: `${ROUTE_BASE_PATHS.EXPENSE}/${ROUTES.EXPENSE.LEDGER}`,
            },
            {
              label: 'Add Expense',
              icon: ICONS.COMMON.PLUS,
              routerLink: `${ROUTE_BASE_PATHS.EXPENSE}/${ROUTES.EXPENSE.ADD}`,
            },
            {
              label: 'Force Expense',
              icon: ICONS.ACTIONS.PENCIL,
              routerLink: `${ROUTE_BASE_PATHS.EXPENSE}/${ROUTES.EXPENSE.FORCE}`,
            },
            {
              label: 'Reimburse Expense',
              icon: ICONS.ACTIONS.PENCIL,
              routerLink: `${ROUTE_BASE_PATHS.EXPENSE}/${ROUTES.EXPENSE.REIMBURSE}`,
            },
          ],
        },
        {
          label: 'Leave Management',
          icon: ICONS.LEAVE.GET,
          children: [
            {
              label: 'Get Leave',
              icon: ICONS.COMMON.VIEW,
              routerLink: `${ROUTE_BASE_PATHS.LEAVE}/${ROUTES.LEAVE.LIST}`,
            },
            {
              label: 'Apply Leave',
              icon: ICONS.COMMON.PLUS,
              routerLink: `${ROUTE_BASE_PATHS.LEAVE}/${ROUTES.LEAVE.APPLY}`,
            },
            {
              label: 'Force Leave',
              icon: ICONS.ACTIONS.PENCIL,
              routerLink: `${ROUTE_BASE_PATHS.LEAVE}/${ROUTES.LEAVE.FORCE}`,
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
