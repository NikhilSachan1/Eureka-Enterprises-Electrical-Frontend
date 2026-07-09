import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { AttachmentsGetResponseSchema } from '@shared/schemas/attachments.schema';
import { IAttachmentsGetResponseDto } from '@shared/types';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  AddPaymentSheetItemsRequestSchema,
  AddPaymentSheetItemsResponseSchema,
  CreatePaymentSheetRequestSchema,
  CreatePaymentSheetResponseSchema,
  DeletePaymentSheetItemRequestSchema,
  DeletePaymentSheetItemResponseSchema,
  ForwardPaymentSheetResponseSchema,
  PaymentSheetDetailGetResponseSchema,
  PaymentSheetGetRequestSchema,
  PaymentSheetGetResponseSchema,
  PayPaymentSheetItemRequestSchema,
  PayPaymentSheetItemResponseSchema,
  RejectPaymentSheetItemRequestSchema,
  RejectPaymentSheetItemResponseSchema,
  RejectPaymentSheetRequestSchema,
  RejectPaymentSheetResponseSchema,
  ReturnPaymentSheetRequestSchema,
  ReturnPaymentSheetResponseSchema,
  SubmitPaymentSheetResponseSchema,
  UpdatePaymentSheetItemRequestSchema,
  UpdatePaymentSheetItemResponseSchema,
  VerifyPaymentSheetItemsRequestSchema,
  VerifyPaymentSheetItemsResponseSchema,
  UnverifyPaymentSheetItemsRequestSchema,
  UnverifyPaymentSheetItemsResponseSchema,
} from '../schemas';
import {
  IAddPaymentSheetItemsFormDto,
  IAddPaymentSheetItemsResponseDto,
  ICreatePaymentSheetFormDto,
  ICreatePaymentSheetResponseDto,
  IDeletePaymentSheetItemFormDto,
  IDeletePaymentSheetItemResponseDto,
  IForwardPaymentSheetResponseDto,
  IPaymentSheetDetailGetFormDto,
  IPaymentSheetDetailGetResponseDto,
  IPaymentSheetGetFormDto,
  IPaymentSheetGetResponseDto,
  IPayPaymentSheetItemFormDto,
  IPayPaymentSheetItemResponseDto,
  IRejectPaymentSheetFormDto,
  IRejectPaymentSheetItemFormDto,
  IRejectPaymentSheetItemResponseDto,
  IRejectPaymentSheetResponseDto,
  IReturnPaymentSheetFormDto,
  IReturnPaymentSheetResponseDto,
  ISubmitPaymentSheetResponseDto,
  IUpdatePaymentSheetItemFormDto,
  IUpdatePaymentSheetItemResponseDto,
  IVerifyPaymentSheetItemsFormDto,
  IVerifyPaymentSheetItemsResponseDto,
  IUnverifyPaymentSheetItemsFormDto,
  IUnverifyPaymentSheetItemsResponseDto,
  IPaymentSheetPdfFormDto,
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

  addPaymentSheetItems(
    paymentSheetId: string,
    formData: IAddPaymentSheetItemsFormDto
  ): Observable<IAddPaymentSheetItemsResponseDto> {
    this.logger.logUserAction('Add Payment Sheet Items Request', {
      paymentSheetId,
      formData,
    });

    return this.apiService
      .postValidated(
        API_ROUTES.CENTRALIZED_PAYMENT.ADD_PAYMENT_SHEET_ITEMS_BY_ID(
          paymentSheetId
        ),
        {
          response: AddPaymentSheetItemsResponseSchema,
          request: AddPaymentSheetItemsRequestSchema,
        },
        formData
      )
      .pipe(
        tap(response => {
          this.logger.logUserAction(
            'Add Payment Sheet Items Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Add Payment Sheet Items Error',
              error
            );
          } else {
            this.logger.logUserAction('Add Payment Sheet Items Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  updatePaymentSheetItem(
    paymentSheetId: string,
    itemId: string,
    formData: IUpdatePaymentSheetItemFormDto
  ): Observable<IUpdatePaymentSheetItemResponseDto> {
    this.logger.logUserAction('Update Payment Sheet Item Request', {
      paymentSheetId,
      itemId,
      formData,
    });

    return this.apiService
      .patchValidated(
        API_ROUTES.CENTRALIZED_PAYMENT.UPDATE_PAYMENT_SHEET_ITEM_BY_ID(
          paymentSheetId,
          itemId
        ),
        {
          response: UpdatePaymentSheetItemResponseSchema,
          request: UpdatePaymentSheetItemRequestSchema,
        },
        formData
      )
      .pipe(
        tap(response => {
          this.logger.logUserAction(
            'Update Payment Sheet Item Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Update Payment Sheet Item Error',
              error
            );
          } else {
            this.logger.logUserAction('Update Payment Sheet Item Error', error);
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

  submitPaymentSheet(
    paymentSheetId: string
  ): Observable<ISubmitPaymentSheetResponseDto> {
    this.logger.logUserAction('Submit Payment Sheet Request', {
      paymentSheetId,
    });

    return this.apiService
      .postValidated(
        API_ROUTES.CENTRALIZED_PAYMENT.SUBMIT_PAYMENT_SHEET_BY_ID(
          paymentSheetId
        ),
        {
          response: SubmitPaymentSheetResponseSchema,
        }
      )
      .pipe(
        tap(response => {
          this.logger.logUserAction('Submit Payment Sheet Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Submit Payment Sheet Error',
              error
            );
          } else {
            this.logger.logUserAction('Submit Payment Sheet Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  forwardPaymentSheet(
    paymentSheetId: string
  ): Observable<IForwardPaymentSheetResponseDto> {
    this.logger.logUserAction('Forward Payment Sheet Request', {
      paymentSheetId,
    });

    return this.apiService
      .postValidated(
        API_ROUTES.CENTRALIZED_PAYMENT.FORWARD_PAYMENT_SHEET_BY_ID(
          paymentSheetId
        ),
        {
          response: ForwardPaymentSheetResponseSchema,
        }
      )
      .pipe(
        tap(response => {
          this.logger.logUserAction('Forward Payment Sheet Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Forward Payment Sheet Error',
              error
            );
          } else {
            this.logger.logUserAction('Forward Payment Sheet Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  returnPaymentSheet(
    paymentSheetId: string,
    formData: IReturnPaymentSheetFormDto
  ): Observable<IReturnPaymentSheetResponseDto> {
    this.logger.logUserAction('Return Payment Sheet Request', {
      paymentSheetId,
      formData,
    });

    return this.apiService
      .postValidated(
        API_ROUTES.CENTRALIZED_PAYMENT.RETURN_PAYMENT_SHEET_BY_ID(
          paymentSheetId
        ),
        {
          response: ReturnPaymentSheetResponseSchema,
          request: ReturnPaymentSheetRequestSchema,
        },
        formData
      )
      .pipe(
        tap(response => {
          this.logger.logUserAction('Return Payment Sheet Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Return Payment Sheet Error',
              error
            );
          } else {
            this.logger.logUserAction('Return Payment Sheet Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  payPaymentSheetItem(
    paymentSheetId: string,
    itemId: string,
    formData: IPayPaymentSheetItemFormDto
  ): Observable<IPayPaymentSheetItemResponseDto> {
    this.logger.logUserAction('Pay Payment Sheet Item Request', {
      paymentSheetId,
      itemId,
      formData,
    });

    return this.apiService
      .postValidated(
        API_ROUTES.CENTRALIZED_PAYMENT.PAY_PAYMENT_SHEET_ITEM_BY_ID(
          paymentSheetId,
          itemId
        ),
        {
          response: PayPaymentSheetItemResponseSchema,
          request: PayPaymentSheetItemRequestSchema,
        },
        formData
      )
      .pipe(
        tap(response => {
          this.logger.logUserAction(
            'Pay Payment Sheet Item Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Pay Payment Sheet Item Error',
              error
            );
          } else {
            this.logger.logUserAction('Pay Payment Sheet Item Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  rejectPaymentSheetItem(
    paymentSheetId: string,
    itemId: string,
    formData: IRejectPaymentSheetItemFormDto
  ): Observable<IRejectPaymentSheetItemResponseDto> {
    this.logger.logUserAction('Reject Payment Sheet Item Request', {
      paymentSheetId,
      itemId,
      formData,
    });

    return this.apiService
      .postValidated(
        API_ROUTES.CENTRALIZED_PAYMENT.REJECT_PAYMENT_SHEET_ITEM_BY_ID(
          paymentSheetId,
          itemId
        ),
        {
          response: RejectPaymentSheetItemResponseSchema,
          request: RejectPaymentSheetItemRequestSchema,
        },
        formData
      )
      .pipe(
        tap(response => {
          this.logger.logUserAction(
            'Reject Payment Sheet Item Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Reject Payment Sheet Item Error',
              error
            );
          } else {
            this.logger.logUserAction('Reject Payment Sheet Item Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  rejectPaymentSheet(
    paymentSheetId: string,
    formData: IRejectPaymentSheetFormDto
  ): Observable<IRejectPaymentSheetResponseDto> {
    this.logger.logUserAction('Reject Payment Sheet Request', {
      paymentSheetId,
      formData,
    });

    return this.apiService
      .postValidated(
        API_ROUTES.CENTRALIZED_PAYMENT.REJECT_PAYMENT_SHEET_BY_ID(
          paymentSheetId
        ),
        {
          response: RejectPaymentSheetResponseSchema,
          request: RejectPaymentSheetRequestSchema,
        },
        formData
      )
      .pipe(
        tap(response => {
          this.logger.logUserAction('Reject Payment Sheet Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Reject Payment Sheet Error',
              error
            );
          } else {
            this.logger.logUserAction('Reject Payment Sheet Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  verifyPaymentSheetItems(
    paymentSheetId: string,
    formData: IVerifyPaymentSheetItemsFormDto
  ): Observable<IVerifyPaymentSheetItemsResponseDto> {
    this.logger.logUserAction('Verify Payment Sheet Items Request', {
      paymentSheetId,
      formData,
    });

    return this.apiService
      .postValidated(
        API_ROUTES.CENTRALIZED_PAYMENT.VERIFY_PAYMENT_SHEET_BY_ID(
          paymentSheetId
        ),
        {
          response: VerifyPaymentSheetItemsResponseSchema,
          request: VerifyPaymentSheetItemsRequestSchema,
        },
        formData
      )
      .pipe(
        tap(response => {
          this.logger.logUserAction(
            'Verify Payment Sheet Items Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Verify Payment Sheet Items Error',
              error
            );
          } else {
            this.logger.logUserAction(
              'Verify Payment Sheet Items Error',
              error
            );
          }
          return throwError(() => error);
        })
      );
  }

  unverifyPaymentSheetItems(
    paymentSheetId: string,
    formData: IUnverifyPaymentSheetItemsFormDto
  ): Observable<IUnverifyPaymentSheetItemsResponseDto> {
    this.logger.logUserAction('Unverify Payment Sheet Items Request', {
      paymentSheetId,
      formData,
    });

    return this.apiService
      .postValidated(
        API_ROUTES.CENTRALIZED_PAYMENT.UNVERIFY_PAYMENT_SHEET_BY_ID(
          paymentSheetId
        ),
        {
          response: UnverifyPaymentSheetItemsResponseSchema,
          request: UnverifyPaymentSheetItemsRequestSchema,
        },
        formData
      )
      .pipe(
        tap(response => {
          this.logger.logUserAction(
            'Unverify Payment Sheet Items Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Unverify Payment Sheet Items Error',
              error
            );
          } else {
            this.logger.logUserAction(
              'Unverify Payment Sheet Items Error',
              error
            );
          }
          return throwError(() => error);
        })
      );
  }

  getPaymentSheetPdf(
    paymentSheetId: string,
    params?: IPaymentSheetPdfFormDto
  ): Observable<IAttachmentsGetResponseDto> {
    this.logger.logUserAction('Get Payment Sheet PDF Request', {
      paymentSheetId,
      params,
    });

    return this.apiService
      .getValidated(
        API_ROUTES.CENTRALIZED_PAYMENT.PAYMENT_SHEET_PDF_BY_ID(paymentSheetId),
        {
          response: AttachmentsGetResponseSchema,
        },
        params
      )
      .pipe(
        tap(response => {
          this.logger.logUserAction('Get Payment Sheet PDF Response', {
            paymentSheetId,
            params,
            key: response.key,
          });
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Payment Sheet PDF Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Payment Sheet PDF Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
