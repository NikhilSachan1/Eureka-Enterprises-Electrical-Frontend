import { ApplicationMenu } from '@shared/types';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';

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
          icon: ICONS.EMPLOYEE.GROUP,
          basePath: ROUTE_BASE_PATHS.EMPLOYEE,
          children: [
            {
              label: 'Employee Directory',
              icon: ICONS.COMMON.USERS,
              routerLink: ROUTES.EMPLOYEE.LIST,
              permission: [APP_PERMISSION.EMPLOYEE.TABLE_VIEW],
            },
            {
              label: 'Add Employee',
              icon: ICONS.COMMON.ADD,
              routerLink: ROUTES.EMPLOYEE.ADD,
              permission: [APP_PERMISSION.EMPLOYEE.ADD],
            },
          ],
        },
        {
          label: 'Attendance',
          icon: ICONS.ATTENDANCE.CALENDAR,
          basePath: ROUTE_BASE_PATHS.ATTENDANCE,
          children: [
            {
              label: 'My Attendance',
              icon: ICONS.COMMON.CALENDAR,
              routerLink: ROUTES.ATTENDANCE.LIST,
              permission: [APP_PERMISSION.ATTENDANCE.TABLE_VIEW],
            },
            {
              label: 'Mark Attendance',
              icon: ICONS.ATTENDANCE.CHECK_IN,
              routerLink: ROUTES.ATTENDANCE.APPLY,
              permission: [APP_PERMISSION.ATTENDANCE.APPLY],
            },
            {
              label: 'Manual Attendance',
              icon: ICONS.COMMON.FORCE,
              routerLink: ROUTES.ATTENDANCE.FORCE,
              permission: [APP_PERMISSION.ATTENDANCE.FORCE],
            },
          ],
        },
        {
          label: 'Expense',
          icon: ICONS.EXPENSE.MONEY,
          basePath: ROUTE_BASE_PATHS.EXPENSE,
          children: [
            {
              label: 'Expense Ledger',
              icon: ICONS.COMMON.CHART_LINE,
              routerLink: ROUTES.EXPENSE.LEDGER,
              permission: [APP_PERMISSION.EXPENSE.TABLE_VIEW],
            },
            {
              label: 'Add Expense',
              icon: ICONS.COMMON.PLUS,
              routerLink: ROUTES.EXPENSE.ADD,
              permission: [APP_PERMISSION.EXPENSE.ADD],
            },
            {
              label: 'Manual Expense',
              icon: ICONS.COMMON.FORCE,
              routerLink: ROUTES.EXPENSE.FORCE,
              permission: [APP_PERMISSION.EXPENSE.FORCE],
            },
            {
              label: 'Reimburse Expense',
              icon: ICONS.PAYROLL.WALLET,
              routerLink: ROUTES.EXPENSE.REIMBURSE,
              permission: [APP_PERMISSION.EXPENSE.REIMBURSE],
            },
          ],
        },
        {
          label: 'Leave',
          icon: ICONS.LEAVE.CALENDAR_PLUS,
          basePath: ROUTE_BASE_PATHS.LEAVE,
          children: [
            {
              label: 'Leave Requests',
              icon: ICONS.COMMON.INBOX,
              routerLink: ROUTES.LEAVE.LIST,
              permission: [APP_PERMISSION.LEAVE.TABLE_VIEW],
            },
            {
              label: 'Apply Leave',
              icon: ICONS.COMMON.CALENDAR_PLUS,
              routerLink: ROUTES.LEAVE.APPLY,
              permission: [APP_PERMISSION.LEAVE.APPLY],
            },
            {
              label: 'Manual Leave',
              icon: ICONS.COMMON.FORCE,
              routerLink: ROUTES.LEAVE.FORCE,
              permission: [APP_PERMISSION.LEAVE.FORCE],
            },
          ],
        },
        {
          label: 'Asset',
          icon: ICONS.ASSET.BOX,
          basePath: ROUTE_BASE_PATHS.ASSET,
          children: [
            {
              label: 'Asset Inventory',
              icon: ICONS.COMMON.TH_LARGE,
              routerLink: ROUTES.ASSET.LIST,
              permission: [APP_PERMISSION.ASSET.TABLE_VIEW],
            },
            {
              label: 'Add Asset',
              icon: ICONS.COMMON.PLUS,
              routerLink: ROUTES.ASSET.ADD,
              permission: [APP_PERMISSION.ASSET.ADD],
            },
            {
              label: 'Event History',
              icon: ICONS.COMMON.HISTORY,
              routerLink: ROUTES.ASSET.EVENT_HISTORY,
              permission: [APP_PERMISSION.ASSET.EVENT_HISTORY],
            },
          ],
        },
        {
          label: 'Transport',
          icon: ICONS.ASSET.CAR,
          basePath: ROUTE_BASE_PATHS.TRANSPORT,
          children: [
            {
              label: 'Vehicles',
              icon: ICONS.ASSET.CAR,
              basePath: ROUTE_BASE_PATHS.VEHICLE,
              children: [
                {
                  label: 'Vehicle List',
                  icon: ICONS.COMMON.VIEW,
                  routerLink: ROUTES.VEHICLE.LIST,
                  permission: [APP_PERMISSION.VEHICLE.TABLE_VIEW],
                },
                {
                  label: 'Add Vehicle',
                  icon: ICONS.COMMON.PLUS,
                  routerLink: ROUTES.VEHICLE.ADD,
                  permission: [APP_PERMISSION.VEHICLE.ADD],
                },
                {
                  label: 'Event History',
                  icon: ICONS.COMMON.HISTORY,
                  routerLink: ROUTES.VEHICLE.EVENT_HISTORY,
                  permission: [APP_PERMISSION.VEHICLE.EVENT_HISTORY],
                },
              ],
            },
            {
              label: 'Vehicle Services',
              icon: ICONS.SETTINGS.WRENCH,
              basePath: ROUTE_BASE_PATHS.VEHICLE_SERVICE,
              children: [
                {
                  label: 'Vehicle Service List',
                  icon: ICONS.COMMON.VIEW,
                  routerLink: ROUTES.VEHICLE_SERVICE.LIST,
                  permission: [APP_PERMISSION.VEHICLE_SERVICE.TABLE_VIEW],
                },
                {
                  label: 'Add Vehicle Service',
                  icon: ICONS.COMMON.PLUS,
                  routerLink: ROUTES.VEHICLE_SERVICE.ADD,
                  permission: [APP_PERMISSION.VEHICLE_SERVICE.ADD],
                },
              ],
            },
            {
              label: 'Vehicle Readings',
              icon: ICONS.COMMON.GAUGE,
              basePath: ROUTE_BASE_PATHS.VEHICLE_READING,
              children: [
                {
                  label: 'Vehicle Reading List',
                  icon: ICONS.COMMON.GAUGE,
                  routerLink: ROUTES.VEHICLE_READING.LIST,
                  permission: [APP_PERMISSION.VEHICLE_READING.TABLE_VIEW],
                },
                {
                  label: 'Add Vehicle Reading',
                  icon: ICONS.COMMON.PLUS,
                  routerLink: ROUTES.VEHICLE_READING.ADD,
                  permission: [APP_PERMISSION.VEHICLE_READING.ADD],
                },
                {
                  label: 'Manual Vehicle Reading',
                  icon: ICONS.COMMON.FORCE,
                  routerLink: ROUTES.VEHICLE_READING.FORCE,
                  permission: [APP_PERMISSION.VEHICLE_READING.FORCE],
                },
              ],
            },
            {
              label: 'Petro Cards',
              icon: ICONS.COMMON.CREDIT_CARD,
              basePath: ROUTE_BASE_PATHS.PETRO_CARD,
              children: [
                {
                  label: 'Card List',
                  icon: ICONS.COMMON.VIEW,
                  routerLink: ROUTES.CARD.LIST,
                  permission: [APP_PERMISSION.PETRO_CARD.TABLE_VIEW],
                },
                {
                  label: 'Add Card',
                  icon: ICONS.COMMON.PLUS,
                  routerLink: ROUTES.CARD.ADD,
                  permission: [APP_PERMISSION.PETRO_CARD.ADD],
                },
              ],
            },
            {
              label: 'Fuel',
              icon: ICONS.FUEL.MENU,
              basePath: ROUTE_BASE_PATHS.FUEL,
              children: [
                {
                  label: 'Fuel Expense Ledger',
                  icon: ICONS.COMMON.CHART_LINE,
                  routerLink: ROUTES.FUEL.LEDGER,
                  permission: [APP_PERMISSION.FUEL_EXPENSE.TABLE_VIEW],
                },
                {
                  label: 'Manual Fuel Expense',
                  icon: ICONS.COMMON.FORCE,
                  routerLink: ROUTES.FUEL.FORCE,
                  permission: [APP_PERMISSION.FUEL_EXPENSE.FORCE],
                },
                {
                  label: 'Fuel Reimbursements',
                  icon: ICONS.PAYROLL.WALLET,
                  routerLink: ROUTES.FUEL.REIMBURSEMENT,
                  permission: [APP_PERMISSION.FUEL_EXPENSE.REIMBURSE],
                },
                {
                  label: 'Add Fuel Expense',
                  icon: ICONS.COMMON.PLUS,
                  routerLink: ROUTES.FUEL.ADD,
                  permission: [APP_PERMISSION.FUEL_EXPENSE.ADD],
                },
              ],
            },
          ],
        },
        {
          label: 'Site',
          icon: ICONS.SITE.BUILDING,
          basePath: ROUTE_BASE_PATHS.SITE.BASE,
          children: [
            {
              label: 'Company',
              icon: ICONS.SITE.BUILDING,
              basePath: ROUTE_BASE_PATHS.SITE.COMPANY,
              children: [
                {
                  label: 'Company List',
                  icon: ICONS.COMMON.VIEW,
                  routerLink: ROUTES.SITE.COMPANY.LIST,
                  permission: [APP_PERMISSION.COMPANY.TABLE_VIEW],
                },
                {
                  label: 'Add Company',
                  icon: ICONS.COMMON.PLUS,
                  routerLink: ROUTES.SITE.COMPANY.ADD,
                  permission: [APP_PERMISSION.COMPANY.ADD],
                },
              ],
            },
            {
              label: 'Contractor',
              icon: ICONS.COMMON.BRIEFCASE,
              basePath: ROUTE_BASE_PATHS.SITE.CONTRACTOR,
              children: [
                {
                  label: 'Contractor List',
                  icon: ICONS.COMMON.VIEW,
                  routerLink: ROUTES.SITE.CONTRACTOR.LIST,
                  permission: [APP_PERMISSION.CONTRACTOR.TABLE_VIEW],
                },
                {
                  label: 'Add Contractor',
                  icon: ICONS.COMMON.PLUS,
                  routerLink: ROUTES.SITE.CONTRACTOR.ADD,
                  permission: [APP_PERMISSION.CONTRACTOR.ADD],
                },
              ],
            },
            {
              label: 'Vendor',
              icon: ICONS.COMMON.BRIEFCASE,
              basePath: ROUTE_BASE_PATHS.SITE.VENDOR,
              children: [
                {
                  label: 'Vendor List',
                  icon: ICONS.COMMON.VIEW,
                  routerLink: ROUTES.SITE.VENDOR.LIST,
                  // permission: [APP_PERMISSION.VENDOR.TABLE_VIEW],
                },
                {
                  label: 'Add Vendor',
                  icon: ICONS.COMMON.PLUS,
                  routerLink: ROUTES.SITE.VENDOR.ADD,
                  // permission: [APP_PERMISSION.VENDOR.ADD],
                },
              ],
            },
            {
              label: 'Project',
              icon: ICONS.COMMON.BRIEFCASE,
              basePath: ROUTE_BASE_PATHS.SITE.PROJECT,
              children: [
                {
                  label: 'Project List',
                  icon: ICONS.COMMON.LIST,
                  routerLink: ROUTES.SITE.PROJECT.LIST,
                  permission: [APP_PERMISSION.PROJECT.TABLE_VIEW],
                },
                {
                  label: 'Add Project',
                  icon: ICONS.COMMON.PLUS,
                  routerLink: ROUTES.SITE.PROJECT.ADD,
                  permission: [APP_PERMISSION.PROJECT.ADD],
                },
                {
                  label: 'Project workspace',
                  icon: ICONS.COMMON.CHART,
                  routerLink: ROUTES.SITE.PROJECT.WORKSPACE,
                  permission: [APP_PERMISSION.PROJECT.WORKSPACE],
                },
              ],
            },
          ],
        },
        {
          label: 'Announcement',
          icon: ICONS.COMMON.MEGAPHONE,
          basePath: ROUTE_BASE_PATHS.ANNOUNCEMENT,
          children: [
            {
              label: 'Announcement List',
              icon: ICONS.COMMON.MEGAPHONE,
              routerLink: ROUTES.ANNOUNCEMENT.LIST,
              permission: [APP_PERMISSION.ANNOUNCEMENT.TABLE_VIEW],
            },
            {
              label: 'Add Announcement',
              icon: ICONS.ACTIONS.SEND,
              routerLink: ROUTES.ANNOUNCEMENT.ADD,
              permission: [APP_PERMISSION.ANNOUNCEMENT.ADD],
            },
          ],
        },
        {
          label: 'Payroll',
          icon: ICONS.PAYROLL.WALLET,
          basePath: ROUTE_BASE_PATHS.PAYROLL,
          children: [
            {
              label: 'Payslip',
              icon: ICONS.PAYROLL.PAID,
              routerLink: ROUTES.PAYROLL.PAYSLIP,
              permission: [APP_PERMISSION.PAYROLL.TABLE_VIEW],
            },
            {
              label: 'Salary Structure',
              icon: ICONS.SETTINGS.SLIDERS,
              routerLink: ROUTES.PAYROLL.STRUCTURE,
              permission: [APP_PERMISSION.SALARY_STRUCTURE.TABLE_VIEW],
            },
            {
              label: 'Increment',
              icon: ICONS.COMMON.BOLT,
              routerLink: ROUTES.PAYROLL.INCREMENT,
              permission: [APP_PERMISSION.PAYROLL.ADD_INCREMENT],
            },
          ],
        },
        {
          label: 'Settings',
          icon: ICONS.SETTINGS.COG,
          basePath: ROUTE_BASE_PATHS.SETTINGS.BASE,
          children: [
            {
              label: 'Permission Management',
              icon: ICONS.SECURITY.SHIELD,
              basePath: ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
              routerLink: ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
              children: [
                {
                  label: 'System Permission',
                  icon: ICONS.SECURITY.SHIELD,
                  routerLink: ROUTE_BASE_PATHS.SETTINGS.PERMISSION.SYSTEM,
                  permission: [APP_PERMISSION.SYSTEM_PERMISSION.TABLE_VIEW],
                },
                {
                  label: 'Role Permission',
                  icon: ICONS.COMMON.ID_CARD,
                  routerLink: ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE,
                  permission: [APP_PERMISSION.ROLE_PERMISSION.TABLE_VIEW],
                },
                {
                  label: 'User Permission',
                  icon: ICONS.COMMON.USERS,
                  routerLink: ROUTE_BASE_PATHS.SETTINGS.PERMISSION.USER,
                  permission: [APP_PERMISSION.USER_PERMISSION.TABLE_VIEW],
                },
              ],
            },
            {
              label: 'Configuration Management',
              icon: ICONS.SETTINGS.COG,
              basePath: ROUTE_BASE_PATHS.SETTINGS.CONFIGURATION.BASE,
              children: [
                {
                  label: 'Configuration List',
                  icon: ICONS.COMMON.VIEW,
                  routerLink: ROUTES.SETTINGS.CONFIGURATION.LIST,
                  permission: [APP_PERMISSION.CONFIGURATION.TABLE_VIEW],
                },
                {
                  label: 'Add Configuration',
                  icon: ICONS.COMMON.PLUS,
                  routerLink: ROUTES.SETTINGS.CONFIGURATION.ADD,
                  permission: [APP_PERMISSION.CONFIGURATION.ADD],
                },
              ],
            },
            {
              label: 'Cron Management',
              icon: ICONS.COMMON.CLOCK,
              basePath: ROUTE_BASE_PATHS.SETTINGS.CRON.BASE,
              children: [
                {
                  label: 'Cron List',
                  icon: ICONS.COMMON.VIEW,
                  routerLink: ROUTES.SETTINGS.CRON.LIST,
                  permission: [APP_PERMISSION.CRON.TABLE_VIEW],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
