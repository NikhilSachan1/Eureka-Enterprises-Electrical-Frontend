import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  CreatePaymentSheetRequestSchema,
  CreatePaymentSheetResponseSchema,
  DeletePaymentSheetItemRequestSchema,
  DeletePaymentSheetItemResponseSchema,
  PaymentSheetDetailGetResponseSchema,
  PaymentSheetGetRequestSchema,
  PaymentSheetGetResponseSchema,
} from '../schemas';
import {
  ICreatePaymentSheetFormDto,
  ICreatePaymentSheetResponseDto,
  IDeletePaymentSheetItemFormDto,
  IDeletePaymentSheetItemResponseDto,
  IPaymentSheetDetailGetFormDto,
  IPaymentSheetDetailGetResponseDto,
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

  getPaymentSheetDetailById(
    params: IPaymentSheetDetailGetFormDto
  ): Observable<IPaymentSheetDetailGetResponseDto> {
    this.logger.logUserAction('Get Payment Sheet Detail Request', params);

    return this.apiService
      .getValidated(
        API_ROUTES.CENTRALIZED_PAYMENT.PAYMENT_SHEET_BY_ID(
          params.paymentSheetId
        ),
        {
          response: PaymentSheetDetailGetResponseSchema,
        }
      )
      .pipe(
        tap(response => {
          this.logger.logUserAction(
            'Get Payment Sheet Detail Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Payment Sheet Detail Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Payment Sheet Detail Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  deletePaymentSheetItem(
    paymentSheetId: string,
    itemId: string,
    formData: IDeletePaymentSheetItemFormDto
  ): Observable<IDeletePaymentSheetItemResponseDto> {
    this.logger.logUserAction('Delete Payment Sheet Item Request', {
      paymentSheetId,
      itemId,
      formData,
    });

    return this.apiService
      .deleteValidated(
        API_ROUTES.CENTRALIZED_PAYMENT.DELETE_PAYMENT_SHEET_ITEM_BY_ID(
          paymentSheetId,
          itemId
        ),
        {
          response: DeletePaymentSheetItemResponseSchema,
          request: DeletePaymentSheetItemRequestSchema,
        },
        formData
      )
      .pipe(
        tap(response => {
          this.logger.logUserAction(
            'Delete Payment Sheet Item Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Delete Payment Sheet Item Error',
              error
            );
          } else {
            this.logger.logUserAction('Delete Payment Sheet Item Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
