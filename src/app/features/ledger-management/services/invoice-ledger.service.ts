import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, defer, Observable, tap, throwError } from 'rxjs';
import {
  InvoiceLedgerGetRequestSchema,
  InvoiceLedgerGetResponseSchema,
} from '../schemas/get-invoice-ledger.schema';
import {
  IInvoiceLedgerGetFormDto,
  IInvoiceLedgerGetResponseDto,
} from '../types/invoice-ledger.dto';
import {
  EInvoiceLedgerExportFormat,
  EInvoiceLedgerSide,
} from '../types/invoice-ledger.enum';

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

  /**
   * The ledger for the same filters as the page, exported as a PDF or as an interactive file;
   * the file itself comes back (nothing is stored on the server).
   */
  exportInvoiceLedger(
    params: IInvoiceLedgerGetFormDto,
    format: EInvoiceLedgerExportFormat
  ): Observable<Blob> {
    this.logger.logUserAction('Export Invoice Ledger Request', { format });

    const { LEDGER } = API_ROUTES.SITE.DOCUMENT.INVOICE;
    const isContractor = params.partyType === EInvoiceLedgerSide.CONTRACTOR;
    const endpoint =
      format === EInvoiceLedgerExportFormat.INTERACTIVE
        ? isContractor
          ? LEDGER.CONTRACTOR_INTERACTIVE
          : LEDGER.VENDOR_INTERACTIVE
        : isContractor
          ? LEDGER.CONTRACTOR_PDF
          : LEDGER.VENDOR_PDF;

    // The file comes back as the response body, so the query is built with the same request
    // schema the list uses, and the response is read as a blob.
    return defer(() =>
      this.apiService.getBlob(
        endpoint,
        InvoiceLedgerGetRequestSchema.parse(params)
      )
    ).pipe(
      tap(() => {
        this.logger.logUserAction('Export Invoice Ledger Response', {
          format,
        });
      }),
      catchError(error => {
        if (error?.name === 'ZodError') {
          this.logger.logDtoValidationErrors(
            'Export Invoice Ledger Error',
            error
          );
        } else {
          this.logger.logUserAction('Export Invoice Ledger Error', error);
        }
        return throwError(() => error);
      })
    );
  }
}
