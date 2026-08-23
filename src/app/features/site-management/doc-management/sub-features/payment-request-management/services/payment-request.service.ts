import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  AddPaymentRequestRequestSchema,
  AddPaymentRequestResponseSchema,
  ApprovePaymentRequestRequestSchema,
  ApprovePaymentRequestResponseSchema,
  DeletePaymentRequestResponseSchema,
  EditPaymentRequestRequestSchema,
  EditPaymentRequestResponseSchema,
  PaymentRequestDetailGetResponseSchema,
  PaymentRequestGetRequestSchema,
  PaymentRequestGetResponseSchema,
  PaymentRequestInvoiceDropdownGetRequestSchema,
  RejectPaymentRequestRequestSchema,
  RejectPaymentRequestResponseSchema,
} from '../schemas';
import { InvoiceDropdownGetResponseSchema } from '@features/site-management/doc-management/sub-features/invoice-management/schemas';
import { IInvoiceDropdownGetResponseDto } from '@features/site-management/doc-management/sub-features/invoice-management/types/invoice.dto';
import {
  IAddPaymentRequestFormDto,
  IAddPaymentRequestResponseDto,
  IApprovePaymentRequestFormDto,
  IApprovePaymentRequestResponseDto,
  IDeletePaymentRequestResponseDto,
  IEditPaymentRequestFormDto,
  IEditPaymentRequestResponseDto,
  IPaymentRequestDetailGetResponseDto,
  IPaymentRequestGetFormDto,
  IPaymentRequestGetResponseDto,
  IPaymentRequestInvoiceDropdownGetRequestDto,
  IRejectPaymentRequestFormDto,
  IRejectPaymentRequestResponseDto,
} from '../types/payment-request.dto';

@Injectable({
  providedIn: 'root',
})
export class PaymentRequestService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addPaymentRequest(
    formData: IAddPaymentRequestFormDto
  ): Observable<IAddPaymentRequestResponseDto> {
    this.logger.logUserAction('Add Payment Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.PAYMENT_REQUEST.ADD,
        {
          response: AddPaymentRequestResponseSchema,
          request: AddPaymentRequestRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IAddPaymentRequestResponseDto) => {
          this.logger.logUserAction('Add Payment Request Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Add Payment Request Error',
              error
            );
          } else {
            this.logger.logUserAction('Add Payment Request Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  editPaymentRequest(
    formData: IEditPaymentRequestFormDto,
    paymentRequestId: string
  ): Observable<IEditPaymentRequestResponseDto> {
    this.logger.logUserAction('Edit Payment Request', { paymentRequestId });

    return this.apiService
      .patchValidated(
        API_ROUTES.SITE.DOCUMENT.PAYMENT_REQUEST.EDIT(paymentRequestId),
        {
          response: EditPaymentRequestResponseSchema,
          request: EditPaymentRequestRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IEditPaymentRequestResponseDto) => {
          this.logger.logUserAction('Edit Payment Request Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Edit Payment Request Error',
              error
            );
          } else {
            this.logger.logUserAction('Edit Payment Request Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  deletePaymentRequest(
    paymentRequestId: string
  ): Observable<IDeletePaymentRequestResponseDto> {
    this.logger.logUserAction('Delete Payment Request', { paymentRequestId });

    return this.apiService
      .deleteValidated(
        API_ROUTES.SITE.DOCUMENT.PAYMENT_REQUEST.DELETE(paymentRequestId),
        {
          response: DeletePaymentRequestResponseSchema,
        }
      )
      .pipe(
        tap((response: IDeletePaymentRequestResponseDto) => {
          this.logger.logUserAction(
            'Delete Payment Request Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Delete Payment Request Error',
              error
            );
          } else {
            this.logger.logUserAction('Delete Payment Request Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  approvePaymentRequest(
    formData: IApprovePaymentRequestFormDto,
    paymentRequestId: string
  ): Observable<IApprovePaymentRequestResponseDto> {
    this.logger.logUserAction('Approve Payment Request', { paymentRequestId });

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.PAYMENT_REQUEST.APPROVE(paymentRequestId),
        {
          response: ApprovePaymentRequestResponseSchema,
          request: ApprovePaymentRequestRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IApprovePaymentRequestResponseDto) => {
          this.logger.logUserAction(
            'Approve Payment Request Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Approve Payment Request Error',
              error
            );
          } else {
            this.logger.logUserAction('Approve Payment Request Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  rejectPaymentRequest(
    formData: IRejectPaymentRequestFormDto,
    paymentRequestId: string
  ): Observable<IRejectPaymentRequestResponseDto> {
    this.logger.logUserAction('Reject Payment Request', { paymentRequestId });

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.PAYMENT_REQUEST.REJECT(paymentRequestId),
        {
          response: RejectPaymentRequestResponseSchema,
          request: RejectPaymentRequestRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IRejectPaymentRequestResponseDto) => {
          this.logger.logUserAction(
            'Reject Payment Request Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Reject Payment Request Error',
              error
            );
          } else {
            this.logger.logUserAction('Reject Payment Request Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getPaymentRequestList(
    params: IPaymentRequestGetFormDto
  ): Observable<IPaymentRequestGetResponseDto> {
    this.logger.logUserAction('Get Payment Request List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.DOCUMENT.PAYMENT_REQUEST.LIST,
        {
          response: PaymentRequestGetResponseSchema,
          request: PaymentRequestGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IPaymentRequestGetResponseDto) => {
          this.logger.logUserAction(
            'Get Payment Request List Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Payment Request List Error',
              error
            );
          } else {
            this.logger.logUserAction(
              'Get Payment Request List Error',
              error
            );
          }
          return throwError(() => error);
        })
      );
  }

  getPaymentRequestDetailById(
    paymentRequestId: string
  ): Observable<IPaymentRequestDetailGetResponseDto> {
    this.logger.logUserAction('Get Payment Request Detail By Id Request', {
      paymentRequestId,
    });

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.DOCUMENT.PAYMENT_REQUEST.GET_BY_ID(paymentRequestId),
        {
          response: PaymentRequestDetailGetResponseSchema,
        }
      )
      .pipe(
        tap((response: IPaymentRequestDetailGetResponseDto) => {
          this.logger.logUserAction(
            'Get Payment Request Detail By Id Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Payment Request Detail By Id Error',
              error
            );
          } else {
            this.logger.logUserAction(
              'Get Payment Request Detail By Id Error',
              error
            );
          }
          return throwError(() => error);
        })
      );
  }

  getInvoiceDropdown(
    params: IPaymentRequestInvoiceDropdownGetRequestDto
  ): Observable<IInvoiceDropdownGetResponseDto> {
    this.logger.logUserAction('Get Payment Request Invoice Dropdown Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.DOCUMENT.INVOICE.DROPDOWN,
        {
          response: InvoiceDropdownGetResponseSchema,
          request: PaymentRequestInvoiceDropdownGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IInvoiceDropdownGetResponseDto) => {
          this.logger.logUserAction(
            'Get Payment Request Invoice Dropdown Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Payment Request Invoice Dropdown Error',
              error
            );
          } else {
            this.logger.logUserAction(
              'Get Payment Request Invoice Dropdown Error',
              error
            );
          }
          return throwError(() => error);
        })
      );
  }
}
