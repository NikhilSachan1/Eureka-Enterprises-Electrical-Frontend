import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  WalletBalanceResponseSchema,
  WalletRechargeAddRequestSchema,
  WalletRechargeAddResponseSchema,
  WalletRechargeDeleteResponseSchema,
  WalletRechargeEditRequestSchema,
  WalletRechargeEditResponseSchema,
  WalletRechargeGetRequestSchema,
  WalletRechargeGetResponseSchema,
} from '../schemas';
import {
  IWalletBalanceResponseDto,
  IWalletRechargeAddFormDto,
  IWalletRechargeAddResponseDto,
  IWalletRechargeDeleteResponseDto,
  IWalletRechargeEditFormDto,
  IWalletRechargeEditResponseDto,
  IWalletRechargeGetFormDto,
  IWalletRechargeGetResponseDto,
} from '../types/petro-card-wallet.dto';

@Injectable({
  providedIn: 'root',
})
export class PetroCardWalletService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  getBalance(): Observable<IWalletBalanceResponseDto> {
    this.logger.logUserAction('Get PetroCard Wallet Balance Request');

    return this.apiService
      .getValidated(API_ROUTES.PETRO_CARD_WALLET.BALANCE, {
        response: WalletBalanceResponseSchema,
      })
      .pipe(
        tap(response => {
          this.logger.logUserAction(
            'Get PetroCard Wallet Balance Response',
            response
          );
        }),
        catchError(error => this.rethrow('Get PetroCard Wallet Balance', error))
      );
  }

  getRecharges(
    params?: IWalletRechargeGetFormDto
  ): Observable<IWalletRechargeGetResponseDto> {
    this.logger.logUserAction('Get PetroCard Wallet Recharges Request');

    return this.apiService
      .getValidated(
        API_ROUTES.PETRO_CARD_WALLET.LIST,
        {
          response: WalletRechargeGetResponseSchema,
          request: WalletRechargeGetRequestSchema,
        },
        params
      )
      .pipe(
        tap(response => {
          this.logger.logUserAction(
            'Get PetroCard Wallet Recharges Response',
            response
          );
        }),
        catchError(error =>
          this.rethrow('Get PetroCard Wallet Recharges', error)
        )
      );
  }

  addRecharge(
    formData: IWalletRechargeAddFormDto
  ): Observable<IWalletRechargeAddResponseDto> {
    this.logger.logUserAction('Add PetroCard Wallet Recharge Request');

    return this.apiService
      .postValidated(
        API_ROUTES.PETRO_CARD_WALLET.ADD,
        {
          response: WalletRechargeAddResponseSchema,
          request: WalletRechargeAddRequestSchema,
        },
        formData
      )
      .pipe(
        tap(response => {
          this.logger.logUserAction(
            'Add PetroCard Wallet Recharge Response',
            response
          );
        }),
        catchError(error =>
          this.rethrow('Add PetroCard Wallet Recharge', error)
        )
      );
  }

  editRecharge(
    formData: IWalletRechargeEditFormDto,
    rechargeId: string
  ): Observable<IWalletRechargeEditResponseDto> {
    this.logger.logUserAction('Edit PetroCard Wallet Recharge Request');

    return this.apiService
      .patchValidated(
        API_ROUTES.PETRO_CARD_WALLET.EDIT(rechargeId),
        {
          response: WalletRechargeEditResponseSchema,
          request: WalletRechargeEditRequestSchema,
        },
        formData
      )
      .pipe(
        tap(response => {
          this.logger.logUserAction(
            'Edit PetroCard Wallet Recharge Response',
            response
          );
        }),
        catchError(error =>
          this.rethrow('Edit PetroCard Wallet Recharge', error)
        )
      );
  }

  deleteRecharge(
    rechargeId: string
  ): Observable<IWalletRechargeDeleteResponseDto> {
    this.logger.logUserAction('Delete PetroCard Wallet Recharge Request');

    return this.apiService
      .deleteValidated(API_ROUTES.PETRO_CARD_WALLET.DELETE(rechargeId), {
        response: WalletRechargeDeleteResponseSchema,
      })
      .pipe(
        tap(response => {
          this.logger.logUserAction(
            'Delete PetroCard Wallet Recharge Response',
            response
          );
        }),
        catchError(error =>
          this.rethrow('Delete PetroCard Wallet Recharge', error)
        )
      );
  }

  private rethrow(action: string, error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      this.logger.logDtoValidationErrors(`${action} Error`, error);
    } else {
      this.logger.logUserAction(`${action} Error`, error);
    }
    return throwError(() => error);
  }
}
