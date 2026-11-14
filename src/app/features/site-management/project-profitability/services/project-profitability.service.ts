import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  IProjectProfitabilityGetFormDto,
  IProjectProfitabilityGetResponseDto,
  IProjectsPnlSummaryGetFormDto,
  IProjectsPnlSummaryGetResponseDto,
} from '../types/project-profitability.dto';
import {
  ProjectsPnlSummaryGetRequestSchema,
  ProjectsPnlSummaryGetResponseSchema,
} from '../schemas/get-projects-pnl-summary.schema';
import {
  ProjectProfitabilityGetRequestSchema,
  ProjectProfitabilityGetResponseSchema,
} from '../schemas/get-project-profitability.schema';

@Injectable({
  providedIn: 'root',
})
export class ProjectProfitabilityService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  getProjectProfitability(
    params: IProjectProfitabilityGetFormDto
  ): Observable<IProjectProfitabilityGetResponseDto> {
    this.logger.logUserAction('Get Project Profitability Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.PROFITABILITY.GET,
        {
          response: ProjectProfitabilityGetResponseSchema,
          request: ProjectProfitabilityGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IProjectProfitabilityGetResponseDto) => {
          this.logger.logUserAction(
            'Get Project Profitability Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Project Profitability Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Project Profitability Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  /** P&L summary of several projects in one call (project list column). */
  getProjectsPnlSummary(
    params: IProjectsPnlSummaryGetFormDto
  ): Observable<IProjectsPnlSummaryGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.SITE.PROFITABILITY.SUMMARY,
        {
          response: ProjectsPnlSummaryGetResponseSchema,
          request: ProjectsPnlSummaryGetRequestSchema,
        },
        params
      )
      .pipe(
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get projects P&L summary error',
              error
            );
          } else {
            this.logger.logUserAction('Get projects P&L summary error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
