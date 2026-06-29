import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  FuelExpenseOutstandingGetRequestSchema,
  FuelExpenseOutstandingGetResponseSchema,
} from '../schemas';
import {
  IFuelExpenseOutstandingGetFormDto,
  IFuelExpenseOutstandingGetResponseDto,
} from '../types/fuel-expense-outstanding.dto';

@Injectable({
  providedIn: 'root',
})
export class FuelExpenseOutstandingService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  getFuelExpenseOutstandingList(
    params?: IFuelExpenseOutstandingGetFormDto
  ): Observable<IFuelExpenseOutstandingGetResponseDto> {
    this.logger.logUserAction(
      'Get Fuel Expense Outstanding List Request',
      params
    );

    return this.apiService
      .getValidated(
        API_ROUTES.CENTRALIZED_PAYMENT.FUEL_EXPENSE_PENDING_SETTLEMENT,
        {
          response: FuelExpenseOutstandingGetResponseSchema,
          request: FuelExpenseOutstandingGetRequestSchema,
        },
        params
      )
      .pipe(
        tap(response => {
          this.logger.logUserAction(
            'Get Fuel Expense Outstanding List Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Fuel Expense Outstanding List Error',
              error
            );
          } else {
            this.logger.logUserAction(
              'Get Fuel Expense Outstanding List Error',
              error
            );
          }
          return throwError(() => error);
        })
      );
  }
}
