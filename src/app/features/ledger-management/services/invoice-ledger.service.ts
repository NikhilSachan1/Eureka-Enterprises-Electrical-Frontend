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
}
