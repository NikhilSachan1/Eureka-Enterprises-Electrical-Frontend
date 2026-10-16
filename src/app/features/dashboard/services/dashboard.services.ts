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
  DocumentGapDetailGetResponseSchema,
  DocumentGapsDashboardGetResponseSchema,
  HolidaysDashboardGetResponseSchema,
  LedgerBalanceDashboardGetResponseSchema,
  ReceivablesPayablesGetResponseSchema,
  ReceivablesPayablesQuerySchema,
  VehicleReadingsAlertsDashboardGetResponseSchema,
} from '../schemas';
import {
  IAnniversariesDashboardGetResponseDto,
  IApprovalPendingDashboardGetResponseDto,
  IAssetFleetAlertsDashboardGetResponseDto,
  IBirthdaysDashboardGetResponseDto,
  IDocumentGapDetailGetResponseDto,
  IDocumentGapsDashboardGetResponseDto,
  IHolidaysDashboardGetResponseDto,
  ILedgerBalanceDashboardGetResponseDto,
  IReceivablesPayablesGetResponseDto,
  IReceivablesPayablesQueryDto,
  IVehicleReadingsAlertsDashboardGetResponseDto,
} from '../types/dashboard.dto';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);
  private ledgerBalanceShared$?: Observable<ILedgerBalanceDashboardGetResponseDto>;
  private receivablesPayablesShared$?: Observable<IReceivablesPayablesGetResponseDto>;
  private assetFleetAlertsShared$?: Observable<IAssetFleetAlertsDashboardGetResponseDto>;

  getDocumentGaps(): Observable<IDocumentGapsDashboardGetResponseDto> {
    return this.fetch(
      'Get Document Gaps',
      API_ROUTES.DASHBOARD.DOCUMENT_GAPS,
      DocumentGapsDashboardGetResponseSchema
    );
  }

  getDocumentGapDetail(
    key: string
  ): Observable<IDocumentGapDetailGetResponseDto> {
    return this.fetch(
      'Get Document Gap Detail',
      API_ROUTES.DASHBOARD.DOCUMENT_GAP(key),
      DocumentGapDetailGetResponseSchema
    );
  }

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

  getReceivablesPayables(
    filters: IReceivablesPayablesQueryDto
  ): Observable<IReceivablesPayablesGetResponseDto> {
    return this.fetchQuery(
      'Get Receivables Payables',
      API_ROUTES.DASHBOARD.RECEIVABLES_PAYABLES,
      ReceivablesPayablesQuerySchema,
      ReceivablesPayablesGetResponseSchema,
      filters
    );
  }

  getReceivablesPayablesShared(): Observable<IReceivablesPayablesGetResponseDto> {
    this.receivablesPayablesShared$ ??= this.getReceivablesPayables({}).pipe(
      shareReplay({ bufferSize: 1, refCount: true })
    );
    return this.receivablesPayablesShared$;
  }

  private fetchQuery<TRequest extends object, TResponse>(
    action: string,
    url: string,
    request: z.ZodType<TRequest>,
    response: z.ZodType<TResponse>,
    input: TRequest
  ): Observable<TResponse> {
    this.logger.logUserAction(`${action} Request`, input);

    return this.apiService.getValidated(url, { request, response }, input).pipe(
      tap(payload => {
        this.logger.logUserAction(`${action} Response`, payload);
      }),
      catchError(error => this.rethrowDashboardError(action, error))
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
