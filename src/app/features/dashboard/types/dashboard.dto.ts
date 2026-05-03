import { z } from 'zod';
import {
  ApprovalPendingDashboardGetResponseSchema,
  AssetFleetAlertsDashboardGetResponseSchema,
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
