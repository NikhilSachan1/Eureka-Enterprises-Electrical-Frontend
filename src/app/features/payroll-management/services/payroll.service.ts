import { inject, Injectable } from '@angular/core';
import { ApiService, LoggerService } from '@core/services';
import {
  ISalaryIncrementAddRequestDto,
  ISalaryIncrementAddResponseDto,
  ISalaryStructureGetRequestDto,
  ISalaryStructureGetRequestInputDto,
  ISalaryStructureGetResponseDto,
  ISalaryStructureHistoryGetResponseDto,
} from '../types/payroll.dto';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { API_ROUTES } from '@core/constants';
import {
  SalaryIncrementAddRequestSchema,
  SalaryIncrementAddResponseSchema,
  SalaryStructureGetRequestSchema,
  SalaryStructureGetResponseSchema,
} from '../schemas';
import { SalaryStructureHistoryGetResponseSchema } from '../schemas/get-salary-change-history.schema';

@Injectable({
  providedIn: 'root',
})
export class PayrollService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addSalaryIncrement(
    formData: ISalaryIncrementAddRequestDto
  ): Observable<ISalaryIncrementAddResponseDto> {
    this.logger.logUserAction('Add Salary Increment Request');

    return this.apiService
      .postValidated(
        API_ROUTES.PAYROLL.ADD_SALARY_INCREMENT,
        formData,
        SalaryIncrementAddRequestSchema,
        SalaryIncrementAddResponseSchema
      )
      .pipe(
        tap((response: ISalaryIncrementAddResponseDto) => {
          this.logger.logUserAction('Add Salary Increment Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Add Salary Increment Error',
              error
            );
          } else {
            this.logger.logUserAction('Add Salary Increment Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getSalaryStructureList(
    params?: ISalaryStructureGetRequestDto | ISalaryStructureGetRequestInputDto
  ): Observable<ISalaryStructureGetResponseDto> {
    this.logger.logUserAction('Get Salary Structure List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.PAYROLL.STRUCTURE,
        SalaryStructureGetResponseSchema,
        params,
        SalaryStructureGetRequestSchema
      )
      .pipe(
        tap((response: ISalaryStructureGetResponseDto) => {
          this.logger.logUserAction(
            'Get Salary Structure List Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Salary Structure List Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Salary Structure List Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getSalaryStructureHistory(
    structureId: string
  ): Observable<ISalaryStructureHistoryGetResponseDto> {
    this.logger.logUserAction('Get Salary Structure History Request');

    return this.apiService
      .getValidated(
        API_ROUTES.PAYROLL.GET_STRUCTURE_HISTORY(structureId),
        SalaryStructureHistoryGetResponseSchema
      )
      .pipe(
        tap((response: ISalaryStructureHistoryGetResponseDto) => {
          this.logger.logUserAction(
            'Get Salary Structure History Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Salary Structure History Error',
              error
            );
          } else {
            this.logger.logUserAction(
              'Get Salary Structure History Error',
              error
            );
          }
          return throwError(() => error);
        })
      );
  }
}
