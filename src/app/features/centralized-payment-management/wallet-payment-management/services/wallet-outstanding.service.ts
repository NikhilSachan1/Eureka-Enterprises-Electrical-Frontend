import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  WalletOutstandingGetRequestSchema,
  WalletOutstandingGetResponseSchema,
} from '../schemas';
import {
  IWalletOutstandingGetFormDto,
  IWalletOutstandingGetResponseDto,
} from '../types/wallet-outstanding.dto';

@Injectable({
  providedIn: 'root',
})
export class WalletOutstandingService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  getWalletOutstandingList(
    params?: IWalletOutstandingGetFormDto
  ): Observable<IWalletOutstandingGetResponseDto> {
    this.logger.logUserAction('Get Wallet Outstanding List Request', params);

    return this.apiService
      .getValidated(
        API_ROUTES.CENTRALIZED_PAYMENT.WALLET_OUTSTANDING,
        {
          response: WalletOutstandingGetResponseSchema,
          request: WalletOutstandingGetRequestSchema,
        },
        params
      )
      .pipe(
        tap(response => {
          this.logger.logUserAction(
            'Get Wallet Outstanding List Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Wallet Outstanding List Error',
              error
            );
          } else {
            this.logger.logUserAction(
              'Get Wallet Outstanding List Error',
              error
            );
          }
          return throwError(() => error);
        })
      );
  }
}
