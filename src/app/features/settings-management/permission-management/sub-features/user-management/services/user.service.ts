import { inject, Injectable } from '@angular/core';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  IUserGetResponseDto,
  IUserPermissionDeleteFormDto,
  IUserPermissionDeleteResponseDto,
} from '../types/user.dto';
import { API_ROUTES } from '@core/constants';
import {
  UserGetResponseSchema,
  UserPermissionDeleteRequestSchema,
  UserPermissionDeleteResponseSchema,
} from '../schemas';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  deleteUserPermission(
    formData: IUserPermissionDeleteFormDto
  ): Observable<IUserPermissionDeleteResponseDto> {
    this.logger.logUserAction('Delete User Permission Request', formData);

    return this.apiService
      .deleteValidated(
        API_ROUTES.SETTINGS.PERMISSION.ROLE.DELETE,
        {
          response: UserPermissionDeleteResponseSchema,
          request: UserPermissionDeleteRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IUserPermissionDeleteResponseDto) => {
          this.logger.logUserAction('Delete User Permission Success', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Delete User Permission Error',
              error
            );
          } else {
            this.logger.logUserAction('Delete User Permission Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getUserList(): Observable<IUserGetResponseDto> {
    return this.apiService
      .getValidated(API_ROUTES.SETTINGS.PERMISSION.USER.LIST, {
        response: UserGetResponseSchema,
      })
      .pipe(
        tap((response: IUserGetResponseDto) => {
          this.logger.logUserAction('Get User List Success', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Role Permission Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Role Permission Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
