import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  VendorOutstandingGetRequestSchema,
  VendorOutstandingGetResponseSchema,
} from '../schemas';
import {
  IVendorOutstandingGetFormDto,
  IVendorOutstandingGetResponseDto,
} from '../types/vendor-outstanding.dto';

@Injectable({
  providedIn: 'root',
})
export class VendorOutstandingService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  getVendorOutstandingList(
    params?: IVendorOutstandingGetFormDto
  ): Observable<IVendorOutstandingGetResponseDto> {
    this.logger.logUserAction('Get Vendor Outstanding List Request', params);

    return this.apiService
      .getValidated(
        API_ROUTES.CENTRALIZED_PAYMENT.VENDOR_PENDING_SETTLEMENT,
        {
          response: VendorOutstandingGetResponseSchema,
          request: VendorOutstandingGetRequestSchema,
        },
        params
      )
      .pipe(
        tap(response => {
          this.logger.logUserAction(
            'Get Vendor Outstanding List Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Vendor Outstanding List Error',
              error
            );
          } else {
            this.logger.logUserAction(
              'Get Vendor Outstanding List Error',
              error
            );
          }
          return throwError(() => error);
        })
      );
  }
}
