import { z } from 'zod';
import {
  AnniversariesDashboardGetResponseSchema,
  ApprovalPendingDashboardGetResponseSchema,
  AssetFleetAlertsDashboardGetResponseSchema,
  BirthdaysDashboardGetResponseSchema,
  HolidaysDashboardGetResponseSchema,
  LedgerBalanceDashboardGetResponseSchema,
  VehicleReadingsAlertsDashboardGetResponseSchema,
} from '../schemas';

/*
  KPM Dashboard Get
*/
export type IApprovalPendingDashboardGetResponseDto = z.infer<
  typeof ApprovalPendingDashboardGetResponseSchema
>;

/*
  Ledger Balance Dashboard Get
*/
export type ILedgerBalanceDashboardGetResponseDto = z.infer<
  typeof LedgerBalanceDashboardGetResponseSchema
>;

/*
  Asset Fleet Alerts Dashboard Get
*/
export type IAssetFleetAlertsDashboardGetResponseDto = z.infer<
  typeof AssetFleetAlertsDashboardGetResponseSchema
>;

/*
  Vehicle Readings Alerts Dashboard Get
*/
export type IVehicleReadingsAlertsDashboardGetResponseDto = z.infer<
  typeof VehicleReadingsAlertsDashboardGetResponseSchema
>;

/*
  Anniversaries Dashboard Get
*/
export type IAnniversariesDashboardGetResponseDto = z.infer<
  typeof AnniversariesDashboardGetResponseSchema
>;

/*
  Holidays Dashboard Get
*/
export type IHolidaysDashboardGetResponseDto = z.infer<
  typeof HolidaysDashboardGetResponseSchema
>;

/*
  Birthdays Dashboard Get
*/
export type IBirthdaysDashboardGetResponseDto = z.infer<
  typeof BirthdaysDashboardGetResponseSchema
>;
