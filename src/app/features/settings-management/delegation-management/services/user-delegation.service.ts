import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import {
  catchError,
  forkJoin,
  MonoTypeOperatorFunction,
  Observable,
  ReplaySubject,
  share,
  tap,
  throwError,
} from 'rxjs';
import {
  UserDelegationAddRequestSchema,
  UserDelegationAddResponseSchema,
  UserDelegationGetRequestSchema,
  UserDelegationGetResponseSchema,
  UserDelegationManagedUsersRequestSchema,
  UserDelegationManagedUsersResponseSchema,
  UserDelegationWithdrawResponseSchema,
} from '../schemas';
import {
  IUserDelegationAddFormDto,
  IUserDelegationAddResponseDto,
  IUserDelegationGetFormDto,
  IUserDelegationGetResponseDto,
  IUserDelegationManagedUserDto,
  IUserDelegationManagedUsersFormDto,
  IUserDelegationManagedUsersResponseDto,
  IUserDelegationWithdrawResponseDto,
} from '../types/user-delegation.dto';

@Injectable({
  providedIn: 'root',
})
export class UserDelegationService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);
  private readonly managedUsersCache = new Map<
    string,
    Observable<IUserDelegationManagedUsersResponseDto>
  >();
  private readonly savedManagedUsers = new Map<
    string,
    IUserDelegationManagedUsersResponseDto
  >();
  private readonly shareManagedUsers = <T>(): MonoTypeOperatorFunction<T> =>
    share<T>({
      connector: () => new ReplaySubject<T>(1),
      resetOnError: true,
      resetOnComplete: false,
      resetOnRefCountZero: false,
    });

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

  /** Expense and fuel scopes, loaded once at startup and reused by add and list. */
  loadManagedUsers(): Observable<
    Record<'expense' | 'fuel', IUserDelegationManagedUsersResponseDto>
  > {
    return forkJoin({
      expense: this.getManagedUsers({ module: 'expense' }),
      fuel: this.getManagedUsers({ module: 'fuel' }),
    });
  }

  clearManagedUsersCache(): void {
    this.managedUsersCache.clear();
    this.savedManagedUsers.clear();
  }

  managedUsersFor(moduleName: string): IUserDelegationManagedUserDto[] {
    return this.savedManagedUsers.get(moduleName.trim())?.users ?? [];
  }

  getManagedUsers(
    params: IUserDelegationManagedUsersFormDto
  ): Observable<IUserDelegationManagedUsersResponseDto> {
    const moduleName = params.module.trim();
    const cached = this.managedUsersCache.get(moduleName);
    if (cached) {
      return cached;
    }

    const request$ = this.fetchManagedUsers(moduleName).pipe(
      this.shareManagedUsers()
    );
    this.managedUsersCache.set(moduleName, request$);
    return request$;
  }

  private fetchManagedUsers(
    moduleName: string
  ): Observable<IUserDelegationManagedUsersResponseDto> {
    this.logger.logUserAction('Get managed users', { module: moduleName });

    return this.apiService
      .getValidated(
        API_ROUTES.USER_DELEGATION.MANAGED_USERS,
        {
          response: UserDelegationManagedUsersResponseSchema,
          request: UserDelegationManagedUsersRequestSchema,
        },
        { module: moduleName }
      )
      .pipe(
        tap(response => {
          this.savedManagedUsers.set(moduleName, response);
          this.logger.logUserAction('Get managed users response', response);
        }),
        catchError(error => {
          this.managedUsersCache.delete(moduleName);
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Get managed users error', error);
          } else {
            this.logger.logUserAction('Get managed users error', error);
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
