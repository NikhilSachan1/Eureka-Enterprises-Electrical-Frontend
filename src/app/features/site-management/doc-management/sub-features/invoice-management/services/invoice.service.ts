import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  ApproveInvoiceRequestSchema,
  ApproveInvoiceResponseSchema,
  DeleteInvoiceResponseSchema,
  InvoiceDetailGetResponseSchema,
  RejectInvoiceRequestSchema,
  RejectInvoiceResponseSchema,
  InvoiceGetRequestSchema,
  InvoiceGetResponseSchema,
  InvoiceDropdownGetRequestSchema,
  InvoiceDropdownGetResponseSchema,
  UnlockRequestInvoiceResponseSchema,
  UnlockRequestInvoiceRequestSchema,
  UnlockGrantInvoiceResponseSchema,
  UnlockRejectInvoiceResponseSchema,
  AddInvoiceResponseSchema,
  AddInvoiceRequestSchema,
  EditInvoiceRequestSchema,
  EditInvoiceResponseSchema,
} from '../schemas';
import {
  IApproveInvoiceFormDto,
  IApproveInvoiceResponseDto,
  IInvoiceDetailGetResponseDto,
  IInvoiceGetFormDto,
  IInvoiceGetResponseDto,
  IInvoiceDropdownGetRequestDto,
  IInvoiceDropdownGetResponseDto,
  IRejectInvoiceFormDto,
  IRejectInvoiceResponseDto,
  IDeleteInvoiceResponseDto,
  IUnlockGrantInvoiceResponseDto,
  IUnlockRejectInvoiceResponseDto,
  IUnlockRequestInvoiceFormDto,
  IUnlockRequestInvoiceResponseDto,
  IAddInvoiceFormDto,
  IAddInvoiceResponseDto,
  IEditInvoiceFormDto,
  IEditInvoiceResponseDto,
} from '../types/invoice.dto';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addInvoice(formData: IAddInvoiceFormDto): Observable<IAddInvoiceResponseDto> {
    this.logger.logUserAction('Add Invoice Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.INVOICE.ADD,
        {
          response: AddInvoiceResponseSchema,
          request: AddInvoiceRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IAddInvoiceResponseDto) => {
          this.logger.logUserAction('Add Invoice Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Add Invoice Error', error);
          } else {
            this.logger.logUserAction('Add Invoice Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  editInvoice(
    formData: IEditInvoiceFormDto,
    invoiceId: string
  ): Observable<IEditInvoiceResponseDto> {
    this.logger.logUserAction('Edit Invoice Request', { invoiceId });

    return this.apiService
      .patchValidated(
        API_ROUTES.SITE.DOCUMENT.INVOICE.EDIT(invoiceId),
        {
          response: EditInvoiceResponseSchema,
          request: EditInvoiceRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IEditInvoiceResponseDto) => {
          this.logger.logUserAction('Edit Invoice Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Edit Invoice Error', error);
          } else {
            this.logger.logUserAction('Edit Invoice Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  approveInvoice(
    formData: IApproveInvoiceFormDto,
    invoiceId: string
  ): Observable<IApproveInvoiceResponseDto> {
    this.logger.logUserAction('Approve Invoice Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.INVOICE.APPROVE(invoiceId),
        {
          response: ApproveInvoiceResponseSchema,
          request: ApproveInvoiceRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IApproveInvoiceResponseDto) => {
          this.logger.logUserAction('Approve Invoice Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Approve Invoice Error', error);
          } else {
            this.logger.logUserAction('Approve Invoice Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  rejectInvoice(
    formData: IRejectInvoiceFormDto,
    invoiceId: string
  ): Observable<IRejectInvoiceResponseDto> {
    this.logger.logUserAction('Reject Invoice Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.INVOICE.REJECT(invoiceId),
        {
          response: RejectInvoiceResponseSchema,
          request: RejectInvoiceRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IRejectInvoiceResponseDto) => {
          this.logger.logUserAction('Reject Invoice Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Reject Invoice Error', error);
          } else {
            this.logger.logUserAction('Reject Invoice Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  unlockRequestInvoice(
    formData: IUnlockRequestInvoiceFormDto,
    invoiceId: string
  ): Observable<IUnlockRequestInvoiceResponseDto> {
    this.logger.logUserAction('Unlock Request Invoice Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.INVOICE.UNLOCK_REQUEST(invoiceId),
        {
          response: UnlockRequestInvoiceResponseSchema,
          request: UnlockRequestInvoiceRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IUnlockRequestInvoiceResponseDto) => {
          this.logger.logUserAction(
            'Unlock Request Invoice Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Unlock Request Invoice Error',
              error
            );
          } else {
            this.logger.logUserAction('Unlock Request Invoice Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  unlockGrantInvoice(
    invoiceId: string
  ): Observable<IUnlockGrantInvoiceResponseDto> {
    this.logger.logUserAction('Unlock Grant Invoice Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.INVOICE.UNLOCK_REQUEST_GRANT(invoiceId),
        {
          response: UnlockGrantInvoiceResponseSchema,
        }
      )
      .pipe(
        tap((response: IUnlockGrantInvoiceResponseDto) => {
          this.logger.logUserAction('Unlock Grant Invoice Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Unlock Grant Invoice Error',
              error
            );
          } else {
            this.logger.logUserAction('Unlock Grant Invoice Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  unlockRequestRejectInvoice(
    invoiceId: string
  ): Observable<IUnlockRejectInvoiceResponseDto> {
    this.logger.logUserAction('Unlock Request Reject Invoice Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOCUMENT.INVOICE.UNLOCK_REQUEST_REJECT(invoiceId),
        {
          response: UnlockRejectInvoiceResponseSchema,
        }
      )
      .pipe(
        tap((response: IUnlockRejectInvoiceResponseDto) => {
          this.logger.logUserAction(
            'Unlock Request Reject Invoice Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Unlock Request Reject Invoice Error',
              error
            );
          } else {
            this.logger.logUserAction(
              'Unlock Request Reject Invoice Error',
              error
            );
          }
          return throwError(() => error);
        })
      );
  }

  deleteInvoice(invoiceId: string): Observable<IDeleteInvoiceResponseDto> {
    this.logger.logUserAction('Delete Invoice Request');

    return this.apiService
      .deleteValidated(API_ROUTES.SITE.DOCUMENT.INVOICE.DELETE(invoiceId), {
        response: DeleteInvoiceResponseSchema,
      })
      .pipe(
        tap((response: IDeleteInvoiceResponseDto) => {
          this.logger.logUserAction('Delete Invoice Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Delete Invoice Error', error);
          } else {
            this.logger.logUserAction('Delete Invoice Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getInvoiceList(
    params?: IInvoiceGetFormDto
  ): Observable<IInvoiceGetResponseDto> {
    this.logger.logUserAction('Get Invoice List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.DOCUMENT.INVOICE.LIST,
        {
          response: InvoiceGetResponseSchema,
          request: InvoiceGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IInvoiceGetResponseDto) => {
          this.logger.logUserAction('Get Invoice List Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Get Invoice List Error', error);
          } else {
            this.logger.logUserAction('Get Invoice List Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getInvoiceDropdown(
    params: IInvoiceDropdownGetRequestDto
  ): Observable<IInvoiceDropdownGetResponseDto> {
    this.logger.logUserAction('Get Invoice Dropdown Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.DOCUMENT.INVOICE.DROPDOWN,
        {
          response: InvoiceDropdownGetResponseSchema,
          request: InvoiceDropdownGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IInvoiceDropdownGetResponseDto) => {
          this.logger.logUserAction('Get Invoice Dropdown Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Invoice Dropdown Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Invoice Dropdown Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getInvoiceDetailById(
    invoiceId: string
  ): Observable<IInvoiceDetailGetResponseDto> {
    this.logger.logUserAction('Get Invoice Detail By Id Request', {
      invoiceId,
    });

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.DOCUMENT.INVOICE.GET_INVOICE_BY_ID(invoiceId),
        {
          response: InvoiceDetailGetResponseSchema,
        }
      )
      .pipe(
        tap((response: IInvoiceDetailGetResponseDto) => {
          this.logger.logUserAction(
            'Get Invoice Detail By Id Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Invoice Detail By Id Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Invoice Detail By Id Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
