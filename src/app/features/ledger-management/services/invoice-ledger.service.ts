import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  InvoiceLedgerGetRequestSchema,
  InvoiceLedgerGetResponseSchema,
} from '../schemas/get-invoice-ledger.schema';
import {
  IInvoiceLedgerGetFormDto,
  IInvoiceLedgerGetResponseDto,
} from '../types/invoice-ledger.dto';
import { EInvoiceLedgerSide } from '../types/invoice-ledger.enum';
import { AttachmentsGetResponseSchema } from '@shared/schemas/attachments.schema';
import { IAttachmentsGetResponseDto } from '@shared/types';

@Injectable({
  providedIn: 'root',
})
export class InvoiceLedgerService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  getInvoiceLedger(
    params: IInvoiceLedgerGetFormDto
  ): Observable<IInvoiceLedgerGetResponseDto> {
    this.logger.logUserAction('Get Invoice Ledger Request');

    // Each side has its own endpoint (and permission); the side is never a query parameter.
    const { LEDGER } = API_ROUTES.SITE.DOCUMENT.INVOICE;
    const endpoint =
      params.partyType === EInvoiceLedgerSide.CONTRACTOR
        ? LEDGER.CONTRACTOR
        : LEDGER.VENDOR;

    return this.apiService
      .getValidated(
        endpoint,
        {
          response: InvoiceLedgerGetResponseSchema,
          request: InvoiceLedgerGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IInvoiceLedgerGetResponseDto) => {
          this.logger.logUserAction('Get Invoice Ledger Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Invoice Ledger Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Invoice Ledger Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  /** The ledger for the same filters as the page, as a PDF; returns its download URL. */
  getInvoiceLedgerPdf(
    params: IInvoiceLedgerGetFormDto
  ): Observable<IAttachmentsGetResponseDto> {
    this.logger.logUserAction('Get Invoice Ledger PDF Request');

    const { LEDGER } = API_ROUTES.SITE.DOCUMENT.INVOICE;
    const endpoint =
      params.partyType === EInvoiceLedgerSide.CONTRACTOR
        ? LEDGER.CONTRACTOR_PDF
        : LEDGER.VENDOR_PDF;

    return this.apiService
      .getValidated(
        endpoint,
        {
          response: AttachmentsGetResponseSchema,
          request: InvoiceLedgerGetRequestSchema,
        },
        params
      )
      .pipe(
        tap(response => {
          this.logger.logUserAction('Get Invoice Ledger PDF Response', {
            key: response.key,
          });
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Invoice Ledger PDF Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Invoice Ledger PDF Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
