import { MenuItem } from '@shared/types';
import { ICONS, ROUTES } from '@shared/constants';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';

/**
 * Tabs inside pages, offered by page search (Ctrl/Cmd+K) but never drawn in the sidebar.
 * Attached to menu items as `searchTabs`.
 *
 * Keep each list in step with the page's own tabs: same labels, same order (content tabs
 * open by `?tab=<index>` among the visible tabs) and the same permissions that decide
 * whether the page shows the tab.
 */

const {
  ASSET,
  VEHICLE,
  SYSTEM_USER,
  PROJECT,
  PO_DOC,
  ADVANCE_PAYMENT_DOC,
  JMC_DOC,
  REPORT_DOC,
  INVOICE_DOC,
  PAYMENT_REQUEST_DOC,
  BOOK_PAYMENT_DOC,
  BANK_TRANSFER_DOC,
  GST,
  TDS,
  DSR,
} = APP_PERMISSION;

const { WORKSPACE_DOC, DAILY_PROGRESS_TAB, ALLOCATION_HISTORY_TAB } =
  ROUTES.SITE.PROJECT;

/** My / All / Pending appear together, for anyone who may answer a handover or return. */
const ASSET_SCOPE_TAB_PERMISSIONS = [
  ASSET.HANDOVER_ACCEPTED,
  ASSET.HANDOVER_REJECTED,
  ASSET.RETURN_ACCEPTED,
  ASSET.RETURN_REJECTED,
];
const VEHICLE_SCOPE_TAB_PERMISSIONS = [
  VEHICLE.HANDOVER_ACCEPTED,
  VEHICLE.HANDOVER_REJECTED,
  VEHICLE.RETURN_ACCEPTED,
  VEHICLE.RETURN_REJECTED,
];

export const EMPLOYEE_LIST_SEARCH_TABS: MenuItem[] = [
  {
    label: 'Employee',
    icon: ICONS.COMMON.USERS,
    queryParams: { tab: '0' },
    permission: [SYSTEM_USER.TABLE_VIEW],
  },
  {
    label: 'Non Employee',
    icon: ICONS.COMMON.USER,
    queryParams: { tab: '1' },
    permission: [SYSTEM_USER.TABLE_VIEW],
  },
];

export const ASSET_LIST_SEARCH_TABS: MenuItem[] = [
  {
    label: 'My Assets',
    icon: ICONS.COMMON.USER,
    queryParams: { tab: '0' },
    permission: ASSET_SCOPE_TAB_PERMISSIONS,
  },
  {
    label: 'All Assets',
    icon: ICONS.COMMON.USERS,
    queryParams: { tab: '1' },
    permission: ASSET_SCOPE_TAB_PERMISSIONS,
  },
  {
    label: 'Pending Assets',
    icon: ICONS.ACTIONS.SEND,
    queryParams: { tab: '2' },
    permission: ASSET_SCOPE_TAB_PERMISSIONS,
  },
];

export const VEHICLE_LIST_SEARCH_TABS: MenuItem[] = [
  {
    label: 'My Vehicles',
    icon: ICONS.COMMON.USER,
    queryParams: { tab: '0' },
    permission: VEHICLE_SCOPE_TAB_PERMISSIONS,
  },
  {
    label: 'All Vehicles',
    icon: ICONS.COMMON.USERS,
    queryParams: { tab: '1' },
    permission: VEHICLE_SCOPE_TAB_PERMISSIONS,
  },
  {
    label: 'Pending Vehicles',
    icon: ICONS.ACTIONS.SEND,
    queryParams: { tab: '2' },
    permission: VEHICLE_SCOPE_TAB_PERMISSIONS,
  },
];

export const FUEL_LEDGER_SEARCH_TABS: MenuItem[] = [
  {
    label: 'Employee Ledger',
    icon: ICONS.COMMON.USERS,
    queryParams: { tab: '0' },
  },
  {
    label: 'Vehicle Wise',
    icon: ICONS.COMMON.CAR,
    queryParams: { tab: '1' },
  },
];

const CONTRACTOR_DOC_SEARCH_TABS: MenuItem[] = [
  {
    label: 'PO',
    icon: ICONS.COMMON.FILE,
    routerLink: WORKSPACE_DOC.PO,
    permission: [PO_DOC.TABLE_VIEW],
  },
  {
    label: 'JMC',
    icon: ICONS.COMMON.FILE,
    routerLink: WORKSPACE_DOC.JMC,
    permission: [JMC_DOC.TABLE_VIEW],
  },
  {
    label: 'Report',
    icon: ICONS.COMMON.CHART,
    routerLink: WORKSPACE_DOC.REPORT,
    permission: [REPORT_DOC.TABLE_VIEW],
  },
  {
    label: 'Invoice',
    icon: ICONS.COMMON.FILE,
    routerLink: WORKSPACE_DOC.INVOICE,
    permission: [INVOICE_DOC.TABLE_VIEW],
  },
  {
    label: 'Bank Received',
    icon: ICONS.COMMON.ARROW_RIGHT_LEFT,
    routerLink: WORKSPACE_DOC.BANK_TRANSFER,
    permission: [BANK_TRANSFER_DOC.TABLE_VIEW],
  },
  {
    label: 'GST Summary',
    icon: ICONS.COMMON.TAG,
    routerLink: ROUTES.SITE.PROJECT.GST_SUMMARY,
    permission: [GST.TABLE_VIEW],
  },
  {
    label: 'TDS Summary',
    icon: ICONS.COMMON.TAG,
    routerLink: ROUTES.SITE.PROJECT.TDS_SUMMARY,
    permission: [TDS.TABLE_VIEW],
  },
];

const VENDOR_DOC_SEARCH_TABS: MenuItem[] = [
  {
    label: 'PO',
    icon: ICONS.COMMON.FILE,
    routerLink: WORKSPACE_DOC.PO,
    permission: [PO_DOC.TABLE_VIEW],
  },
  {
    label: 'Advance Payment',
    icon: ICONS.PAYROLL.WALLET,
    routerLink: WORKSPACE_DOC.ADVANCE_PAYMENT,
    permission: [ADVANCE_PAYMENT_DOC.TABLE_VIEW],
  },
  {
    label: 'JMC',
    icon: ICONS.COMMON.FILE,
    routerLink: WORKSPACE_DOC.JMC,
    permission: [JMC_DOC.TABLE_VIEW],
  },
  {
    label: 'Report',
    icon: ICONS.COMMON.CHART,
    routerLink: WORKSPACE_DOC.REPORT,
    permission: [REPORT_DOC.TABLE_VIEW],
  },
  {
    label: 'Invoice',
    icon: ICONS.COMMON.FILE,
    routerLink: WORKSPACE_DOC.INVOICE,
    permission: [INVOICE_DOC.TABLE_VIEW],
  },
  {
    label: 'Payment Request',
    icon: ICONS.COMMON.FILE,
    routerLink: WORKSPACE_DOC.PAYMENT_REQUEST,
    permission: [PAYMENT_REQUEST_DOC.TABLE_VIEW],
  },
  {
    label: 'Book Payment',
    icon: ICONS.COMMON.BOOK,
    routerLink: WORKSPACE_DOC.BOOK_PAYMENT,
    permission: [BOOK_PAYMENT_DOC.TABLE_VIEW],
  },
  {
    label: 'Bank Transfer',
    icon: ICONS.COMMON.ARROW_RIGHT_LEFT,
    routerLink: WORKSPACE_DOC.BANK_TRANSFER,
    permission: [BANK_TRANSFER_DOC.TABLE_VIEW],
  },
  {
    label: 'GST Summary',
    icon: ICONS.COMMON.TAG,
    routerLink: ROUTES.SITE.PROJECT.GST_SUMMARY,
    permission: [GST.TABLE_VIEW],
  },
  {
    label: 'TDS Summary',
    icon: ICONS.COMMON.TAG,
    routerLink: ROUTES.SITE.PROJECT.TDS_SUMMARY,
    permission: [TDS.TABLE_VIEW],
  },
];

export const PROJECT_WORKSPACE_SEARCH_TABS: MenuItem[] = [
  {
    label: 'Profitability',
    icon: ICONS.COMMON.CHART,
    routerLink: ROUTES.SITE.PROJECT.PROFITABILITY,
    permission: [PROJECT.PROFITABILITY],
  },
  {
    label: 'Contractor (Sales)',
    icon: ICONS.COMMON.FILE,
    routerLink: ROUTES.SITE.PROJECT.CONTRACTOR_DOC,
    permission: [
      PO_DOC.TABLE_VIEW,
      JMC_DOC.TABLE_VIEW,
      REPORT_DOC.TABLE_VIEW,
      INVOICE_DOC.TABLE_VIEW,
      BANK_TRANSFER_DOC.TABLE_VIEW,
      GST.TABLE_VIEW,
      TDS.TABLE_VIEW,
    ],
    searchTabs: CONTRACTOR_DOC_SEARCH_TABS,
  },
  {
    label: 'Vendor (Purchase)',
    icon: ICONS.COMMON.FILE,
    routerLink: ROUTES.SITE.PROJECT.VENDOR_DOC,
    permission: [
      PO_DOC.TABLE_VIEW,
      ADVANCE_PAYMENT_DOC.TABLE_VIEW,
      JMC_DOC.TABLE_VIEW,
      REPORT_DOC.TABLE_VIEW,
      INVOICE_DOC.TABLE_VIEW,
      PAYMENT_REQUEST_DOC.TABLE_VIEW,
      BANK_TRANSFER_DOC.TABLE_VIEW,
      BOOK_PAYMENT_DOC.TABLE_VIEW,
      GST.TABLE_VIEW,
      TDS.TABLE_VIEW,
    ],
    searchTabs: VENDOR_DOC_SEARCH_TABS,
  },
  {
    label: 'Daily Progress',
    icon: ICONS.COMMON.CALENDAR,
    routerLink: ROUTES.SITE.PROJECT.DAILY_PROGRESS,
    permission: [DSR.TABLE_VIEW],
    searchTabs: [
      {
        label: 'Entries',
        icon: ICONS.COMMON.LIST,
        routerLink: DAILY_PROGRESS_TAB.ENTRIES,
      },
      {
        label: 'Project wise',
        icon: ICONS.SITE.BUILDING,
        routerLink: DAILY_PROGRESS_TAB.PROJECT_WISE,
      },
    ],
  },
  {
    label: 'Allocation history',
    icon: ICONS.COMMON.HISTORY,
    routerLink: ROUTES.SITE.PROJECT.ALLOCATION_HISTORY,
    permission: [PROJECT.ALLOCATION_HISTORY_TABLE_VIEW],
    searchTabs: [
      {
        label: 'Entries',
        icon: ICONS.COMMON.LIST,
        routerLink: ALLOCATION_HISTORY_TAB.ENTRIES,
      },
      {
        label: 'Employee wise',
        icon: ICONS.COMMON.USERS,
        routerLink: ALLOCATION_HISTORY_TAB.EMPLOYEE_WISE,
      },
      {
        label: 'Project wise',
        icon: ICONS.SITE.BUILDING,
        routerLink: ALLOCATION_HISTORY_TAB.PROJECT_WISE,
      },
    ],
  },
];
