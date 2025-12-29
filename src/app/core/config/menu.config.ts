import { ApplicationMenu } from '@shared/types';
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
          label: 'Employees',
          icon: ICONS.ATTENDANCE.CALENDAR,
          children: [
            {
              label: 'Employee Directory',
              icon: ICONS.COMMON.LIST,
              routerLink: `${ROUTE_BASE_PATHS.EMPLOYEE}/${ROUTES.EMPLOYEE.LIST}`,
            },
            {
              label: 'Add Employee',
              icon: ICONS.COMMON.ADD,
              routerLink: `${ROUTE_BASE_PATHS.EMPLOYEE}/${ROUTES.EMPLOYEE.ADD}`,
            },
          ],
        },
        {
          label: 'Attendance',
          icon: ICONS.ATTENDANCE.CALENDAR,
          children: [
            {
              label: 'My Attendance',
              icon: ICONS.COMMON.LIST,
              routerLink: `${ROUTE_BASE_PATHS.ATTENDANCE}/${ROUTES.ATTENDANCE.LIST}`,
            },
            {
              label: 'Mark Attendance',
              icon: ICONS.COMMON.ADD,
              routerLink: `${ROUTE_BASE_PATHS.ATTENDANCE}/${ROUTES.ATTENDANCE.APPLY}`,
            },
            {
              label: 'Manual Attendance',
              icon: ICONS.ACTIONS.PENCIL,
              routerLink: `${ROUTE_BASE_PATHS.ATTENDANCE}/${ROUTES.ATTENDANCE.FORCE}`,
            },
          ],
        },
        {
          label: 'Expense',
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
              label: 'Manual Expense',
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
          label: 'Leave',
          icon: ICONS.LEAVE.GET,
          children: [
            {
              label: 'Leave Requests',
              icon: ICONS.COMMON.VIEW,
              routerLink: `${ROUTE_BASE_PATHS.LEAVE}/${ROUTES.LEAVE.LIST}`,
            },
            {
              label: 'Apply Leave',
              icon: ICONS.COMMON.PLUS,
              routerLink: `${ROUTE_BASE_PATHS.LEAVE}/${ROUTES.LEAVE.APPLY}`,
            },
            {
              label: 'Manual Leave',
              icon: ICONS.ACTIONS.PENCIL,
              routerLink: `${ROUTE_BASE_PATHS.LEAVE}/${ROUTES.LEAVE.FORCE}`,
            },
          ],
        },
        {
          label: 'Asset',
          icon: ICONS.ASSET.BOX,
          children: [
            {
              label: 'Asset Inventory',
              icon: ICONS.COMMON.VIEW,
              routerLink: `${ROUTE_BASE_PATHS.ASSET}/${ROUTES.ASSET.LIST}`,
            },
            {
              label: 'Add Asset',
              icon: ICONS.COMMON.PLUS,
              routerLink: `${ROUTE_BASE_PATHS.ASSET}/${ROUTES.ASSET.ADD}`,
            },
          ],
        },
      ],
    },
  ],
};
