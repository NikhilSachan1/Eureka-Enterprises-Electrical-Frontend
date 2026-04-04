import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  IProjectProfitabilityGetFormDto,
  IProjectProfitabilityGetResponseDto,
} from '../types/project-profitability.dto';
import { ProjectProfitabilityGetResponseSchema } from '../schemas/get-project-profitability.schema';

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
      .getValidated(API_ROUTES.SITE.PROFITABILITY.GET(params.projectName), {
        response: ProjectProfitabilityGetResponseSchema,
      })
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
}
