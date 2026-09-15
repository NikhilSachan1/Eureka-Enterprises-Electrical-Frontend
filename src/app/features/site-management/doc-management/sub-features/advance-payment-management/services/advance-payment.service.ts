import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  AddAdvancePaymentRequestSchema,
  AddAdvancePaymentResponseSchema,
  ApproveAdvancePaymentRequestSchema,
  ApproveAdvancePaymentResponseSchema,
  DeleteAdvancePaymentResponseSchema,
  EditAdvancePaymentRequestSchema,
  EditAdvancePaymentResponseSchema,
  AdvancePaymentDetailGetResponseSchema,
  AdvancePaymentGetRequestSchema,
  AdvancePaymentGetResponseSchema,
  RejectAdvancePaymentRequestSchema,
  RejectAdvancePaymentResponseSchema,
} from '../schemas';
import {
  IAddAdvancePaymentFormDto,
  IAddAdvancePaymentResponseDto,
  IApproveAdvancePaymentFormDto,
  IApproveAdvancePaymentResponseDto,
  IDeleteAdvancePaymentResponseDto,
  IEditAdvancePaymentFormDto,
  IEditAdvancePaymentResponseDto,
  IAdvancePaymentDetailGetResponseDto,
  IAdvancePaymentGetFormDto,
  IAdvancePaymentGetResponseDto,
  IRejectAdvancePaymentFormDto,
  IRejectAdvancePaymentResponseDto,
} from '../types/advance-payment.dto';

@Injectable({
  providedIn: 'root',
})
export class AdvancePaymentService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addAdvancePayment(
    formData: IAddAdvancePaymentFormDto
  ): Observable<IAddAdvancePaymentResponseDto> {
    this.logger.logUserAction('Add Advance Payment');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.ADVANCE_PAYMENT.ADD,
        {
          response: AddAdvancePaymentResponseSchema,
          request: AddAdvancePaymentRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IAddAdvancePaymentResponseDto) => {
          this.logger.logUserAction('Add Advance Payment Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Add Advance Payment Error',
              error
            );
          } else {
            this.logger.logUserAction('Add Advance Payment Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  editAdvancePayment(
    formData: IEditAdvancePaymentFormDto,
    advancePaymentId: string
  ): Observable<IEditAdvancePaymentResponseDto> {
    this.logger.logUserAction('Edit Advance Payment', { advancePaymentId });

    return this.apiService
      .patchValidated(
        API_ROUTES.SITE.DOCUMENT.ADVANCE_PAYMENT.EDIT(advancePaymentId),
        {
          response: EditAdvancePaymentResponseSchema,
          request: EditAdvancePaymentRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IEditAdvancePaymentResponseDto) => {
          this.logger.logUserAction('Edit Advance Payment Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Edit Advance Payment Error',
              error
            );
          } else {
            this.logger.logUserAction('Edit Advance Payment Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  deleteAdvancePayment(
    advancePaymentId: string
  ): Observable<IDeleteAdvancePaymentResponseDto> {
    this.logger.logUserAction('Delete Advance Payment', { advancePaymentId });

    return this.apiService
      .deleteValidated(
        API_ROUTES.SITE.DOCUMENT.ADVANCE_PAYMENT.DELETE(advancePaymentId),
        {
          response: DeleteAdvancePaymentResponseSchema,
        }
      )
      .pipe(
        tap((response: IDeleteAdvancePaymentResponseDto) => {
          this.logger.logUserAction(
            'Delete Advance Payment Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Delete Advance Payment Error',
              error
            );
          } else {
            this.logger.logUserAction('Delete Advance Payment Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  approveAdvancePayment(
    formData: IApproveAdvancePaymentFormDto,
    advancePaymentId: string
  ): Observable<IApproveAdvancePaymentResponseDto> {
    this.logger.logUserAction('Approve Advance Payment', { advancePaymentId });

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.ADVANCE_PAYMENT.APPROVE(advancePaymentId),
        {
          response: ApproveAdvancePaymentResponseSchema,
          request: ApproveAdvancePaymentRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IApproveAdvancePaymentResponseDto) => {
          this.logger.logUserAction(
            'Approve Advance Payment Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Approve Advance Payment Error',
              error
            );
          } else {
            this.logger.logUserAction('Approve Advance Payment Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  rejectAdvancePayment(
    formData: IRejectAdvancePaymentFormDto,
    advancePaymentId: string
  ): Observable<IRejectAdvancePaymentResponseDto> {
    this.logger.logUserAction('Reject Advance Payment', { advancePaymentId });

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.ADVANCE_PAYMENT.REJECT(advancePaymentId),
        {
          response: RejectAdvancePaymentResponseSchema,
          request: RejectAdvancePaymentRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IRejectAdvancePaymentResponseDto) => {
          this.logger.logUserAction(
            'Reject Advance Payment Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Reject Advance Payment Error',
              error
            );
          } else {
            this.logger.logUserAction('Reject Advance Payment Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getAdvancePaymentList(
    params: IAdvancePaymentGetFormDto
  ): Observable<IAdvancePaymentGetResponseDto> {
    this.logger.logUserAction('Get Advance Payment List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.DOCUMENT.ADVANCE_PAYMENT.LIST,
        {
          response: AdvancePaymentGetResponseSchema,
          request: AdvancePaymentGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IAdvancePaymentGetResponseDto) => {
          this.logger.logUserAction(
            'Get Advance Payment List Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Advance Payment List Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Advance Payment List Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getAdvancePaymentDetailById(
    advancePaymentId: string
  ): Observable<IAdvancePaymentDetailGetResponseDto> {
    this.logger.logUserAction('Get Advance Payment Detail By Id Request', {
      advancePaymentId,
    });

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.DOCUMENT.ADVANCE_PAYMENT.GET_BY_ID(advancePaymentId),
        {
          response: AdvancePaymentDetailGetResponseSchema,
        }
      )
      .pipe(
        tap((response: IAdvancePaymentDetailGetResponseDto) => {
          this.logger.logUserAction(
            'Get Advance Payment Detail By Id Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Advance Payment Detail By Id Error',
              error
            );
          } else {
            this.logger.logUserAction(
              'Get Advance Payment Detail By Id Error',
              error
            );
          }
          return throwError(() => error);
        })
      );
  }
}
