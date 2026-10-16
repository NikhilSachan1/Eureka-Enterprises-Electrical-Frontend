import { z } from 'zod';
import {
  AnniversariesDashboardGetResponseSchema,
  ApprovalPendingDashboardGetResponseSchema,
  AssetFleetAlertsDashboardGetResponseSchema,
  BirthdaysDashboardGetResponseSchema,
  DocumentGapDetailGetResponseSchema,
  DocumentGapsDashboardGetResponseSchema,
  HolidaysDashboardGetResponseSchema,
  LedgerBalanceDashboardGetResponseSchema,
  ReceivablesPayablesGetResponseSchema,
  ReceivablesPayablesQuerySchema,
  VehicleReadingsAlertsDashboardGetResponseSchema,
} from '../schemas';

/*
  KPM Dashboard Get
*/
export type IApprovalPendingDashboardGetResponseDto = z.infer<
  typeof ApprovalPendingDashboardGetResponseSchema
>;

export type IDocumentGapsDashboardGetResponseDto = z.infer<
  typeof DocumentGapsDashboardGetResponseSchema
>;

export type IDocumentGapDetailGetResponseDto = z.infer<
  typeof DocumentGapDetailGetResponseSchema
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

export type IReceivablesPayablesQueryDto = z.infer<
  typeof ReceivablesPayablesQuerySchema
>;

export type IReceivablesPayablesGetResponseDto = z.infer<
  typeof ReceivablesPayablesGetResponseSchema
>;

export type IReceivablesPayablesSideDto =
  IReceivablesPayablesGetResponseDto['receivable'];
