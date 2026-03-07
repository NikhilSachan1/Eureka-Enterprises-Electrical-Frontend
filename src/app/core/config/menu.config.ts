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
          basePath: ROUTE_BASE_PATHS.EMPLOYEE,
          children: [
            {
              label: 'Employee Directory',
              icon: ICONS.COMMON.LIST,
              routerLink: ROUTES.EMPLOYEE.LIST,
            },
            {
              label: 'Add Employee',
              icon: ICONS.COMMON.ADD,
              routerLink: ROUTES.EMPLOYEE.ADD,
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
              icon: ICONS.COMMON.LIST,
              routerLink: ROUTES.ATTENDANCE.LIST,
            },
            {
              label: 'Mark Attendance',
              icon: ICONS.COMMON.ADD,
              routerLink: ROUTES.ATTENDANCE.APPLY,
            },
            {
              label: 'Manual Attendance',
              icon: ICONS.ACTIONS.PENCIL,
              routerLink: ROUTES.ATTENDANCE.FORCE,
            },
          ],
        },
        {
          label: 'Expense',
          icon: ICONS.LEAVE.GET,
          basePath: ROUTE_BASE_PATHS.EXPENSE,
          children: [
            {
              label: 'Expense Ledger',
              icon: ICONS.COMMON.VIEW,
              routerLink: ROUTES.EXPENSE.LEDGER,
            },
            {
              label: 'Add Expense',
              icon: ICONS.COMMON.PLUS,
              routerLink: ROUTES.EXPENSE.ADD,
            },
            {
              label: 'Manual Expense',
              icon: ICONS.ACTIONS.PENCIL,
              routerLink: ROUTES.EXPENSE.FORCE,
            },
            {
              label: 'Reimburse Expense',
              icon: ICONS.ACTIONS.PENCIL,
              routerLink: ROUTES.EXPENSE.REIMBURSE,
            },
          ],
        },
        {
          label: 'Leave',
          icon: ICONS.LEAVE.GET,
          basePath: ROUTE_BASE_PATHS.LEAVE,
          children: [
            {
              label: 'Leave Requests',
              icon: ICONS.COMMON.VIEW,
              routerLink: ROUTES.LEAVE.LIST,
            },
            {
              label: 'Apply Leave',
              icon: ICONS.COMMON.PLUS,
              routerLink: ROUTES.LEAVE.APPLY,
            },
            {
              label: 'Manual Leave',
              icon: ICONS.ACTIONS.PENCIL,
              routerLink: ROUTES.LEAVE.FORCE,
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
              icon: ICONS.COMMON.VIEW,
              routerLink: ROUTES.ASSET.LIST,
            },
            {
              label: 'Add Asset',
              icon: ICONS.COMMON.PLUS,
              routerLink: ROUTES.ASSET.ADD,
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
                },
                {
                  label: 'Add Vehicle',
                  icon: ICONS.COMMON.PLUS,
                  routerLink: ROUTES.VEHICLE.ADD,
                },
              ],
            },
            {
              label: 'Vehicle Services',
              icon: ICONS.ASSET.CAR,
              basePath: ROUTE_BASE_PATHS.VEHICLE_SERVICE,
              children: [
                {
                  label: 'Vehicle Service List',
                  icon: ICONS.COMMON.VIEW,
                  routerLink: ROUTES.VEHICLE_SERVICE.LIST,
                },
                {
                  label: 'Add Vehicle Service',
                  icon: ICONS.COMMON.PLUS,
                  routerLink: ROUTES.VEHICLE_SERVICE.ADD,
                },
              ],
            },
            {
              label: 'Vehicle Readings',
              icon: ICONS.ASSET.CAR,
              basePath: ROUTE_BASE_PATHS.VEHICLE_READING,
              children: [
                {
                  label: 'Vehicle Reading List',
                  icon: ICONS.COMMON.VIEW,
                  routerLink: ROUTES.VEHICLE_READING.LIST,
                },
                {
                  label: 'Add Vehicle Reading',
                  icon: ICONS.COMMON.PLUS,
                  routerLink: ROUTES.VEHICLE_READING.ADD,
                },
                {
                  label: 'Manual Vehicle Reading',
                  icon: ICONS.ACTIONS.PENCIL,
                  routerLink: ROUTES.VEHICLE_READING.FORCE,
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
                },
                {
                  label: 'Add Card',
                  icon: ICONS.COMMON.PLUS,
                  routerLink: ROUTES.CARD.ADD,
                },
              ],
            },
            {
              label: 'Fuel',
              icon: ICONS.EXPENSE.MONEY,
              basePath: ROUTE_BASE_PATHS.FUEL,
              children: [
                {
                  label: 'Fuel Expense Ledger',
                  icon: ICONS.COMMON.VIEW,
                  routerLink: ROUTES.FUEL.LEDGER,
                },
                {
                  label: 'Manual Fuel Expense',
                  icon: ICONS.ACTIONS.PENCIL,
                  routerLink: ROUTES.FUEL.FORCE,
                },
                {
                  label: 'Fuel Reimbursements',
                  icon: ICONS.EXPENSE.MONEY,
                  routerLink: ROUTES.FUEL.REIMBURSEMENT,
                },
                {
                  label: 'Add Fuel Expense',
                  icon: ICONS.ACTIONS.PENCIL,
                  routerLink: ROUTES.FUEL.ADD,
                },
              ],
            },
          ],
        },
        {
          label: 'Site',
          icon: ICONS.ASSET.CAR,
          basePath: ROUTE_BASE_PATHS.SITE.BASE,
          children: [
            {
              label: 'Company',
              icon: ICONS.ASSET.CAR,
              basePath: ROUTE_BASE_PATHS.SITE.COMPANY,
              children: [
                {
                  label: 'Company List',
                  icon: ICONS.COMMON.VIEW,
                  routerLink: ROUTES.SITE.COMPANY.LIST,
                },
                {
                  label: 'Add Company',
                  icon: ICONS.COMMON.PLUS,
                  routerLink: ROUTES.SITE.COMPANY.ADD,
                },
              ],
            },
            {
              label: 'Contractor',
              icon: ICONS.COMMON.CREDIT_CARD,
              basePath: ROUTE_BASE_PATHS.SITE.CONTRACTOR,
              children: [
                {
                  label: 'Contractor List',
                  icon: ICONS.COMMON.VIEW,
                  routerLink: ROUTES.SITE.CONTRACTOR.LIST,
                },
                {
                  label: 'Add Contractor',
                  icon: ICONS.COMMON.PLUS,
                  routerLink: ROUTES.SITE.CONTRACTOR.ADD,
                },
              ],
            },
            {
              label: 'Project',
              icon: ICONS.EXPENSE.MONEY,
              basePath: ROUTE_BASE_PATHS.SITE.PROJECT,
              children: [
                {
                  label: 'Project List',
                  icon: ICONS.COMMON.VIEW,
                  routerLink: ROUTES.SITE.PROJECT.LIST,
                },
                {
                  label: 'Add Project',
                  icon: ICONS.ACTIONS.PENCIL,
                  routerLink: ROUTES.SITE.PROJECT.ADD,
                },
              ],
            },
          ],
        },
        {
          label: 'Announcement',
          icon: ICONS.ASSET.BOX,
          basePath: ROUTE_BASE_PATHS.ANNOUNCEMENT,
          children: [
            {
              label: 'Announcement List',
              icon: ICONS.COMMON.VIEW,
              routerLink: ROUTES.ANNOUNCEMENT.LIST,
            },
            {
              label: 'Add Announcement',
              icon: ICONS.COMMON.PLUS,
              routerLink: ROUTES.ANNOUNCEMENT.ADD,
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
              icon: ICONS.COMMON.VIEW,
              routerLink: ROUTES.PAYROLL.PAYSLIP,
            },
            {
              label: 'Salary Structure',
              icon: ICONS.COMMON.VIEW,
              routerLink: ROUTES.PAYROLL.STRUCTURE,
            },
            {
              label: 'Increment',
              icon: ICONS.COMMON.PLUS,
              routerLink: ROUTES.PAYROLL.INCREMENT,
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
              routerLink: ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
            },
          ],
        },
      ],
    },
  ],
};
