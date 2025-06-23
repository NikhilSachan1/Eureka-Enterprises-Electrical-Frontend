import { ApplicationMenu } from '../../shared/models';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '../../shared/constants';

/**
 * Main application menu configuration
 * This file defines the structure of the sidebar menu
 */
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
          label: 'Employee Management',
          icon: ICONS.EMPLOYEE.GROUP,
          children: [
            {
              label: 'View Employees',
              icon: ICONS.COMMON.LIST,
              routerLink: `${ROUTE_BASE_PATHS.EMPLOYEE}/${ROUTES.EMPLOYEE.LIST}`,
            },
            {
              label: 'Register Employee',
              icon: ICONS.EMPLOYEE.ADD_USER,
              routerLink: `${ROUTE_BASE_PATHS.EMPLOYEE}/${ROUTES.EMPLOYEE.ADD}`,
            },
          ],
        },
        {
          label: 'Attendance Management',
          icon: ICONS.ATTENDANCE.CALENDAR,
          children: [
            {
              label: 'View Attendance',
              icon: ICONS.COMMON.LIST,
              routerLink: `${ROUTE_BASE_PATHS.ATTENDANCE}/${ROUTES.ATTENDANCE.LIST}`,
            },
            {
              label: 'Record Attendance',
              icon: ICONS.ATTENDANCE.CHECK,
              routerLink: `${ROUTE_BASE_PATHS.ATTENDANCE}/${ROUTES.ATTENDANCE.APPLY}`,
            },
            {
              label: 'Manual Entry',
              icon: ICONS.COMMON.MANUAL,
              routerLink: `${ROUTE_BASE_PATHS.ATTENDANCE}/${ROUTES.ATTENDANCE.FORCE}`,
            },
          ],
        },
        {
          label: 'Expense Management',
          icon: ICONS.EXPENSE.MONEY,
          children: [
            {
              label: 'Transaction History',
              icon: ICONS.COMMON.BOOK,
              routerLink: `${ROUTE_BASE_PATHS.EXPENSE}/${ROUTES.EXPENSE.LEDGER}`,
            },
            {
              label: 'Manual Entry',
              icon: ICONS.COMMON.MANUAL,
              routerLink: `${ROUTE_BASE_PATHS.EXPENSE}/${ROUTES.EXPENSE.FORCE}`,
            },
            {
              label: 'Record Expense',
              icon: ICONS.COMMON.ADD,
              routerLink: `${ROUTE_BASE_PATHS.EXPENSE}/${ROUTES.EXPENSE.ADD}`,
            },
            {
              label: 'Process Reimbursement',
              icon: ICONS.COMMON.SYNC,
              routerLink: `${ROUTE_BASE_PATHS.EXPENSE}/${ROUTES.EXPENSE.REIMBURSEMENT}`,
            },
          ],
        },
        {
          label: 'Fuel Management',
          icon: ICONS.EXPENSE.CAR,
          children: [
            {
              label: 'Transaction History',
              icon: ICONS.COMMON.BOOK,
              routerLink: `${ROUTE_BASE_PATHS.FUEL}/${ROUTES.FUEL.LEDGER}`,
            },
            {
              label: 'Manual Entry',
              icon: ICONS.COMMON.MANUAL,
              routerLink: `${ROUTE_BASE_PATHS.FUEL}/${ROUTES.FUEL.FORCE}`,
            },
            {
              label: 'Record Expense',
              icon: ICONS.COMMON.ADD,
              routerLink: `${ROUTE_BASE_PATHS.FUEL}/${ROUTES.FUEL.ADD}`,
            },
            {
              label: 'Process Reimbursement',
              icon: ICONS.COMMON.SYNC,
              routerLink: `${ROUTE_BASE_PATHS.FUEL}/${ROUTES.FUEL.REIMBURSEMENT}`,
            },
          ],
        },
        {
          label: 'Site Management',
          icon: ICONS.SITE.BUILDING,
          children: [
            {
              label: 'View Companies',
              icon: ICONS.COMMON.LIST,
              routerLink: `${ROUTE_BASE_PATHS.SITE.BASE}/${ROUTE_BASE_PATHS.SITE.COMPANY}/${ROUTES.SITE.COMPANY.LIST}`,
            },
            {
              label: 'Register Company',
              icon: ICONS.COMMON.ADD,
              routerLink: `${ROUTE_BASE_PATHS.SITE.BASE}/${ROUTE_BASE_PATHS.SITE.COMPANY}/${ROUTES.SITE.COMPANY.ADD}`,
            },
            {
              label: 'View Contractors',
              icon: ICONS.COMMON.LIST,
              routerLink: `${ROUTE_BASE_PATHS.SITE.BASE}/${ROUTE_BASE_PATHS.SITE.CONTRACTOR}/${ROUTES.SITE.CONTRACTOR.LIST}`,
            },
            {
              label: 'Register Contractor',
              icon: ICONS.COMMON.ADD,
              routerLink: `${ROUTE_BASE_PATHS.SITE.BASE}/${ROUTE_BASE_PATHS.SITE.CONTRACTOR}/${ROUTES.SITE.CONTRACTOR.ADD}`,
            },
            {
              label: 'View Projects',
              icon: ICONS.COMMON.LIST,
              routerLink: `${ROUTE_BASE_PATHS.SITE.BASE}/${ROUTE_BASE_PATHS.SITE.PROJECT}/${ROUTES.SITE.PROJECT.LIST}`,
            },
            {
              label: 'Register Project',
              icon: ICONS.COMMON.ADD,
              routerLink: `${ROUTE_BASE_PATHS.SITE.BASE}/${ROUTE_BASE_PATHS.SITE.PROJECT}/${ROUTES.SITE.PROJECT.ADD}`,
            },
          ],
        },
        {
          label: 'Leave Management',
          icon: ICONS.LEAVE.CALENDAR_MINUS,
          children: [
            {
              label: 'Request Leave',
              icon: ICONS.COMMON.ADD,
              routerLink: `${ROUTE_BASE_PATHS.LEAVE}/${ROUTES.LEAVE.APPLY}`,
            },
            {
              label: 'Leave Records',
              icon: ICONS.COMMON.LIST,
              routerLink: `${ROUTE_BASE_PATHS.LEAVE}/${ROUTES.LEAVE.LIST}`,
            },
            {
              label: 'Manual Entry',
              icon: ICONS.COMMON.MANUAL,
              routerLink: `${ROUTE_BASE_PATHS.LEAVE}/${ROUTES.LEAVE.FORCE}`,
            },
          ],
        },
        {
          label: 'Holiday Calendar',
          icon: ICONS.ATTENDANCE.CALENDAR,
          children: [
            {
              label: 'View Calendar',
              icon: ICONS.COMMON.LIST,
              routerLink: `${ROUTE_BASE_PATHS.CALENDAR}/${ROUTES.CALENDAR.LIST}`,
            },
            {
              label: 'Add Holiday',
              icon: ICONS.COMMON.ADD,
              routerLink: `${ROUTE_BASE_PATHS.CALENDAR}/${ROUTES.CALENDAR.ADD}`,
            },
          ],
        },
        {
          label: 'Asset Management',
          icon: ICONS.ASSET.BOX,
          children: [
            {
              label: 'View Assets',
              icon: ICONS.COMMON.LIST,
              routerLink: `${ROUTE_BASE_PATHS.ASSET}/${ROUTES.ASSET.LIST}`,
            },
            {
              label: 'Register Asset',
              icon: ICONS.COMMON.ADD,
              routerLink: `${ROUTE_BASE_PATHS.ASSET}/${ROUTES.ASSET.ADD}`,
            },
          ],
        },
        {
          label: 'Card Management',
          icon: ICONS.ASSET.CARD,
          children: [
            {
              label: 'View Cards',
              icon: ICONS.COMMON.LIST,
              routerLink: `${ROUTE_BASE_PATHS.CARD}/${ROUTES.CARD.LIST}`,
            },
            {
              label: 'Register Card',
              icon: ICONS.COMMON.ADD,
              routerLink: `${ROUTE_BASE_PATHS.CARD}/${ROUTES.CARD.ADD}`,
            },
            {
              label: 'Recharge History',
              icon: ICONS.COMMON.LIST,
              routerLink: `${ROUTE_BASE_PATHS.CARD}/${ROUTES.CARD.RECHARGE_HISTORY}`,
            },
            {
              label: 'Add Recharge',
              icon: ICONS.COMMON.ADD,
              routerLink: `${ROUTE_BASE_PATHS.CARD}/${ROUTES.CARD.ADD_RECHARGE}`,
            },
          ],
        },
        {
          label: 'Vehicle Management',
          icon: ICONS.ASSET.CAR,
          children: [
            {
              label: 'View Vehicles',
              icon: ICONS.COMMON.LIST,
              routerLink: `${ROUTE_BASE_PATHS.VEHICLE}/${ROUTES.VEHICLE.LIST}`,
            },
            {
              label: 'Register Vehicle',
              icon: ICONS.COMMON.ADD,
              routerLink: `${ROUTE_BASE_PATHS.VEHICLE}/${ROUTES.VEHICLE.ADD}`,
            },
          ],
        },
        {
          label: 'Payroll Management',
          icon: ICONS.PAYROLL.WALLET,
          children: [
            {
              label: 'View Payslips',
              icon: ICONS.COMMON.FILE,
              routerLink: `${ROUTE_BASE_PATHS.PAYROLL}/${ROUTES.PAYROLL.PAYSLIP}`,
            },
            {
              label: 'Salary Increment',
              icon: ICONS.COMMON.ARROW_UP,
              routerLink: `${ROUTE_BASE_PATHS.PAYROLL}/${ROUTES.PAYROLL.INCREMENT}`,
            },
            {
              label: 'Monthly Analytics',
              icon: ICONS.COMMON.CHART,
              routerLink: `${ROUTE_BASE_PATHS.PAYROLL}/${ROUTES.PAYROLL.MONTHLY_REPORT}`,
            },
            {
              label: 'Salary Structure',
              icon: ICONS.COMMON.SITEMAP,
              routerLink: `${ROUTE_BASE_PATHS.PAYROLL}/${ROUTES.PAYROLL.STRUCTURE}`,
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