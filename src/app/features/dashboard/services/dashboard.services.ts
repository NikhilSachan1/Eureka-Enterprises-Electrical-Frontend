import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { LoggerService } from '@core/services/logger.service';
import { catchError, Observable, shareReplay, tap, throwError } from 'rxjs';
import { z } from 'zod';
import { API_ROUTES } from '@core/constants';
import {
  AnniversariesDashboardGetResponseSchema,
  ApprovalPendingDashboardGetResponseSchema,
  AssetFleetAlertsDashboardGetResponseSchema,
  BirthdaysDashboardGetResponseSchema,
  HolidaysDashboardGetResponseSchema,
  LedgerBalanceDashboardGetResponseSchema,
  VehicleReadingsAlertsDashboardGetResponseSchema,
} from '../schemas';
import {
  IAnniversariesDashboardGetResponseDto,
  IApprovalPendingDashboardGetResponseDto,
  IAssetFleetAlertsDashboardGetResponseDto,
  IBirthdaysDashboardGetResponseDto,
  IHolidaysDashboardGetResponseDto,
  ILedgerBalanceDashboardGetResponseDto,
  IVehicleReadingsAlertsDashboardGetResponseDto,
} from '../types/dashboard.dto';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);
  private ledgerBalanceShared$?: Observable<ILedgerBalanceDashboardGetResponseDto>;
  private assetFleetAlertsShared$?: Observable<IAssetFleetAlertsDashboardGetResponseDto>;

  getApprovalPending(): Observable<IApprovalPendingDashboardGetResponseDto> {
    return this.fetch(
      'Get Approval Pending',
      API_ROUTES.DASHBOARD.APPROVAL_PENDING,
      ApprovalPendingDashboardGetResponseSchema
    );
  }

  getLedgerBalanceShared(): Observable<ILedgerBalanceDashboardGetResponseDto> {
    this.ledgerBalanceShared$ ??= this.fetch(
      'Get Ledger Balance',
      API_ROUTES.DASHBOARD.LEDGER_BALANCES,
      LedgerBalanceDashboardGetResponseSchema
    ).pipe(shareReplay({ bufferSize: 1, refCount: true }));
    return this.ledgerBalanceShared$;
  }

  getAssetFleetAlertsShared(): Observable<IAssetFleetAlertsDashboardGetResponseDto> {
    this.assetFleetAlertsShared$ ??= this.fetch(
      'Get Asset Fleet Alerts',
      API_ROUTES.DASHBOARD.ASSET_FLEET_ALERTS,
      AssetFleetAlertsDashboardGetResponseSchema
    ).pipe(shareReplay({ bufferSize: 1, refCount: true }));
    return this.assetFleetAlertsShared$;
  }

  getVehicleReadingsAlerts(): Observable<IVehicleReadingsAlertsDashboardGetResponseDto> {
    return this.fetch(
      'Get Vehicle Readings Alerts',
      API_ROUTES.DASHBOARD.VEHICLE_READINGS_ALERTS,
      VehicleReadingsAlertsDashboardGetResponseSchema
    );
  }

  getAnniversaries(): Observable<IAnniversariesDashboardGetResponseDto> {
    return this.fetch(
      'Get Anniversaries',
      API_ROUTES.DASHBOARD.ANNIVERSARIES,
      AnniversariesDashboardGetResponseSchema
    );
  }

  getHolidays(): Observable<IHolidaysDashboardGetResponseDto> {
    return this.fetch(
      'Get Holidays',
      API_ROUTES.DASHBOARD.HOLIDAYS,
      HolidaysDashboardGetResponseSchema
    );
  }

  getBirthdays(): Observable<IBirthdaysDashboardGetResponseDto> {
    return this.fetch(
      'Get Birthdays',
      API_ROUTES.DASHBOARD.BIRTHDAYS,
      BirthdaysDashboardGetResponseSchema
    );
  }

  private fetch<TResponse>(
    action: string,
    url: string,
    response: z.ZodType<TResponse>
  ): Observable<TResponse> {
    this.logger.logUserAction(`${action} Request`);

    return this.apiService.getValidated(url, { response }).pipe(
      tap(payload => {
        this.logger.logUserAction(`${action} Response`, payload);
      }),
      catchError(error => this.rethrowDashboardError(action, error))
    );
  }

  private rethrowDashboardError(action: string, error: unknown) {
    if (error instanceof z.ZodError) {
      this.logger.logDtoValidationErrors(`${action} Error`, error);
    } else {
      this.logger.logUserAction(`${action} Error`, error);
    }
    return throwError(() => error);
  }
}
