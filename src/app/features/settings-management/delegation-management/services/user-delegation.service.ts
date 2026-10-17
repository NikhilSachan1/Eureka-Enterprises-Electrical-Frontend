import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  UserDelegationAddRequestSchema,
  UserDelegationAddResponseSchema,
  UserDelegationGetRequestSchema,
  UserDelegationGetResponseSchema,
  UserDelegationWithdrawResponseSchema,
} from '../schemas';
import {
  IUserDelegationAddFormDto,
  IUserDelegationAddResponseDto,
  IUserDelegationGetFormDto,
  IUserDelegationGetResponseDto,
  IUserDelegationWithdrawResponseDto,
} from '../types/user-delegation.dto';

@Injectable({
  providedIn: 'root',
})
export class UserDelegationService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  getDelegationList(
    params: IUserDelegationGetFormDto
  ): Observable<IUserDelegationGetResponseDto> {
    this.logger.logUserAction('Get user delegations');

    return this.apiService
      .getValidated(
        API_ROUTES.USER_DELEGATION.LIST,
        {
          response: UserDelegationGetResponseSchema,
          request: UserDelegationGetRequestSchema,
        },
        params
      )
      .pipe(
        tap(response => {
          this.logger.logUserAction('Get user delegations response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get user delegations error',
              error
            );
          } else {
            this.logger.logUserAction('Get user delegations error', error);
          }
          return throwError(() => error);
        })
      );
  }

  addDelegation(
    formData: IUserDelegationAddFormDto
  ): Observable<IUserDelegationAddResponseDto> {
    this.logger.logUserAction('Grant user delegation');

    return this.apiService
      .postValidated(
        API_ROUTES.USER_DELEGATION.ADD,
        {
          response: UserDelegationAddResponseSchema,
          request: UserDelegationAddRequestSchema,
        },
        formData
      )
      .pipe(
        tap(response => {
          this.logger.logUserAction('Grant user delegation response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Grant user delegation error',
              error
            );
          } else {
            this.logger.logUserAction('Grant user delegation error', error);
          }
          return throwError(() => error);
        })
      );
  }

  withdrawDelegation(
    delegationId: string
  ): Observable<IUserDelegationWithdrawResponseDto> {
    this.logger.logUserAction('Withdraw user delegation', { delegationId });

    return this.apiService
      .deleteValidated(API_ROUTES.USER_DELEGATION.WITHDRAW(delegationId), {
        response: UserDelegationWithdrawResponseSchema,
      })
      .pipe(
        tap(response => {
          this.logger.logUserAction(
            'Withdraw user delegation response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Withdraw user delegation error',
              error
            );
          } else {
            this.logger.logUserAction('Withdraw user delegation error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
