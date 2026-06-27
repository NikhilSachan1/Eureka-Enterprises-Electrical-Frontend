import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  CreatePaymentSheetRequestSchema,
  CreatePaymentSheetResponseSchema,
  PaymentSheetGetRequestSchema,
  PaymentSheetGetResponseSchema,
} from '../schemas';
import {
  ICreatePaymentSheetFormDto,
  ICreatePaymentSheetResponseDto,
  IPaymentSheetGetFormDto,
  IPaymentSheetGetResponseDto,
} from '../types/payment-sheet.dto';

@Injectable({
  providedIn: 'root',
})
export class PaymentSheetService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  createPaymentSheet(
    formData: ICreatePaymentSheetFormDto
  ): Observable<ICreatePaymentSheetResponseDto> {
    this.logger.logUserAction('Create Payment Sheet Request', formData);

    return this.apiService
      .postValidated(
        API_ROUTES.CENTRALIZED_PAYMENT.PAYMENT_SHEETS,
        {
          response: CreatePaymentSheetResponseSchema,
          request: CreatePaymentSheetRequestSchema,
        },
        formData
      )
      .pipe(
        tap(response => {
          this.logger.logUserAction('Create Payment Sheet Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Create Payment Sheet Error',
              error
            );
          } else {
            this.logger.logUserAction('Create Payment Sheet Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getPaymentSheetList(
    params?: IPaymentSheetGetFormDto
  ): Observable<IPaymentSheetGetResponseDto> {
    this.logger.logUserAction('Get Payment Sheet List Request', params);

    return this.apiService
      .getValidated(
        API_ROUTES.CENTRALIZED_PAYMENT.PAYMENT_SHEETS,
        {
          response: PaymentSheetGetResponseSchema,
          request: PaymentSheetGetRequestSchema,
        },
        params
      )
      .pipe(
        tap(response => {
          this.logger.logUserAction(
            'Get Payment Sheet List Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Payment Sheet List Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Payment Sheet List Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
