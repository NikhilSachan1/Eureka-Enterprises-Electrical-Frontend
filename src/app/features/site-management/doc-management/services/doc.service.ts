import { inject, Injectable } from '@angular/core';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { API_ROUTES } from '@core/constants';
import {
  DocDeleteResponseSchema,
  DocGetRequestSchema,
  DocGetResponseSchema,
  InvoiceDocAddRequestSchema,
  InvoiceDocAddResponseSchema,
  JmcDocAddRequestSchema,
  JmcDocAddResponseSchema,
  PaymentAdviceDocAddRequestSchema,
  PaymentAdviceDocAddResponseSchema,
  PaymentDocAddRequestSchema,
  PaymentDocAddResponseSchema,
  PoDocAddRequestSchema,
  PoDocAddResponseSchema,
  ReportDocAddRequestSchema,
  ReportDocAddResponseSchema,
} from '../schemas';
import {
  IDocDeleteResponseDto,
  IDocGetFormDto,
  IDocGetResponseDto,
  IInvoiceDocAddFormDto,
  IInvoiceDocAddResponseDto,
  IJmcDocAddFormDto,
  IJmcDocAddResponseDto,
  IPaymentAdviceDocAddFormDto,
  IPaymentAdviceDocAddResponseDto,
  IPaymentDocAddFormDto,
  IPaymentDocAddResponseDto,
  IPoDocAddFormDto,
  IPoDocAddResponseDto,
  IReportDocAddFormDto,
  IReportDocAddResponseDto,
} from '../types/doc.dto';

@Injectable({
  providedIn: 'root',
})
export class DocService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addPoDoc(formData: IPoDocAddFormDto): Observable<IPoDocAddResponseDto> {
    this.logger.logUserAction('Add PO Doc Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOC.ADD,
        {
          response: PoDocAddResponseSchema,
          request: PoDocAddRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(
        tap((response: IPoDocAddResponseDto) => {
          this.logger.logUserAction('Add PO Doc Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Add PO Doc Error', error);
          } else {
            this.logger.logUserAction('Add PO Doc Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  addJmcDoc(formData: IJmcDocAddFormDto): Observable<IJmcDocAddResponseDto> {
    this.logger.logUserAction('Add JMC Doc Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOC.ADD,
        {
          response: JmcDocAddResponseSchema,
          request: JmcDocAddRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(
        tap((response: IJmcDocAddResponseDto) => {
          this.logger.logUserAction('Add JMC Doc Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Add JMC Doc Error', error);
          } else {
            this.logger.logUserAction('Add JMC Doc Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  addReportDoc(
    formData: IReportDocAddFormDto
  ): Observable<IReportDocAddResponseDto> {
    this.logger.logUserAction('Add Report Doc Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOC.ADD,
        {
          response: ReportDocAddResponseSchema,
          request: ReportDocAddRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(
        tap((response: IReportDocAddResponseDto) => {
          this.logger.logUserAction('Add Report Doc Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Add Report Doc Error', error);
          } else {
            this.logger.logUserAction('Add Report Doc Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  addInvoiceDoc(
    formData: IInvoiceDocAddFormDto
  ): Observable<IInvoiceDocAddResponseDto> {
    this.logger.logUserAction('Add Invoice Doc Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOC.ADD,
        {
          response: InvoiceDocAddResponseSchema,
          request: InvoiceDocAddRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(
        tap((response: IInvoiceDocAddResponseDto) => {
          this.logger.logUserAction('Add Invoice Doc Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Add Invoice Doc Error', error);
          } else {
            this.logger.logUserAction('Add Invoice Doc Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  addPaymentDoc(
    formData: IPaymentDocAddFormDto
  ): Observable<IPaymentDocAddResponseDto> {
    this.logger.logUserAction('Add Payment Doc Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOC.ADD,
        {
          response: PaymentDocAddResponseSchema,
          request: PaymentDocAddRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(
        tap((response: IPaymentDocAddResponseDto) => {
          this.logger.logUserAction('Add Payment Doc Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Add Payment Doc Error', error);
          } else {
            this.logger.logUserAction('Add Payment Doc Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  addPaymentAdviceDoc(
    formData: IPaymentAdviceDocAddFormDto
  ): Observable<IPaymentAdviceDocAddResponseDto> {
    this.logger.logUserAction('Add Payment Advice Doc Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DOC.ADD,
        {
          response: PaymentAdviceDocAddResponseSchema,
          request: PaymentAdviceDocAddRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(
        tap((response: IPaymentAdviceDocAddResponseDto) => {
          this.logger.logUserAction(
            'Add Payment Advice Doc Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Add Payment Advice Doc Error',
              error
            );
          } else {
            this.logger.logUserAction('Add Payment Advice Doc Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  deleteDoc(docId: string): Observable<IDocDeleteResponseDto> {
    this.logger.logUserAction('Delete Doc Request');

    return this.apiService
      .deleteValidated(API_ROUTES.SITE.DOC.DELETE(docId), {
        response: DocDeleteResponseSchema,
      })
      .pipe(
        tap((response: IDocDeleteResponseDto) => {
          this.logger.logUserAction('Delete Doc Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Delete Doc Error', error);
          } else {
            this.logger.logUserAction('Delete Doc Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getDocList(params?: IDocGetFormDto): Observable<IDocGetResponseDto> {
    this.logger.logUserAction('Get Doc List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.DOC.LIST,
        {
          response: DocGetResponseSchema,
          request: DocGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IDocGetResponseDto) => {
          this.logger.logUserAction('Get Doc List Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Get Doc List Error', error);
          } else {
            this.logger.logUserAction('Get Doc List Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
