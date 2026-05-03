import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { LoggerService } from '@core/services/logger.service';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { API_ROUTES } from '@core/constants';
import {
  ApprovalPendingDashboardGetResponseSchema,
  AssetFleetAlertsDashboardGetResponseSchema,
  LedgerBalanceDashboardGetResponseSchema,
  VehicleReadingsAlertsDashboardGetResponseSchema,
} from '../schemas';
import {
  IApprovalPendingDashboardGetResponseDto,
  IAssetFleetAlertsDashboardGetResponseDto,
  ILedgerBalanceDashboardGetResponseDto,
  IVehicleReadingsAlertsDashboardGetResponseDto,
} from '../types/dashboard.dto';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  getApprovalPending(): Observable<IApprovalPendingDashboardGetResponseDto> {
    this.logger.logUserAction('Get Approval Pending Request');

    return this.apiService
      .getValidated(API_ROUTES.DASHBOARD.APPROVAL_PENDING, {
        response: ApprovalPendingDashboardGetResponseSchema,
      })
      .pipe(
        tap((response: IApprovalPendingDashboardGetResponseDto) => {
          this.logger.logUserAction('Get Approval Pending Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Approval Pending Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Approval Pending Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getLedgerBalance(): Observable<ILedgerBalanceDashboardGetResponseDto> {
    this.logger.logUserAction('Get Ledger Balance Request');

    return this.apiService
      .getValidated(API_ROUTES.DASHBOARD.LEDGER_BALANCES, {
        response: LedgerBalanceDashboardGetResponseSchema,
      })
      .pipe(
        tap((response: ILedgerBalanceDashboardGetResponseDto) => {
          this.logger.logUserAction('Get Ledger Balance Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Ledger Balance Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Ledger Balance Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getAssetFleetAlerts(): Observable<IAssetFleetAlertsDashboardGetResponseDto> {
    this.logger.logUserAction('Get Asset Fleet Alerts Request');

    return this.apiService
      .getValidated(API_ROUTES.DASHBOARD.ASSET_FLEET_ALERTS, {
        response: AssetFleetAlertsDashboardGetResponseSchema,
      })
      .pipe(
        tap((response: IAssetFleetAlertsDashboardGetResponseDto) => {
          this.logger.logUserAction(
            'Get Asset Fleet Alerts Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Asset Fleet Alerts Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Asset Fleet Alerts Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getVehicleReadingsAlerts(): Observable<IVehicleReadingsAlertsDashboardGetResponseDto> {
    this.logger.logUserAction('Get Vehicle Readings Alerts Request');

    return this.apiService
      .getValidated(API_ROUTES.DASHBOARD.VEHICLE_READINGS_ALERTS, {
        response: VehicleReadingsAlertsDashboardGetResponseSchema,
      })
      .pipe(
        tap((response: IVehicleReadingsAlertsDashboardGetResponseDto) => {
          this.logger.logUserAction(
            'Get Vehicle Readings Alerts Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Vehicle Readings Alerts Error',
              error
            );
          } else {
            this.logger.logUserAction(
              'Get Vehicle Readings Alerts Error',
              error
            );
          }
          return throwError(() => error);
        })
      );
  }
}
