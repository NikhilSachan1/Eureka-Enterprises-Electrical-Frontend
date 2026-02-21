import { inject, Injectable } from '@angular/core';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { API_ROUTES } from '@core/constants';
import {
  IRoleAddFormDto,
  IRoleAddResponseDto,
  IRoleDeleteFormDto,
  IRoleDeleteResponseDto,
  IRoleEditFormDto,
  IRoleEditResponseDto,
  IRoleGetFormDto,
  IRoleGetResponseDto,
} from '../types/role.dto';
import {
  RoleAddRequestSchema,
  RoleAddResponseSchema,
  RoleDeleteRequestSchema,
  RoleDeleteResponseSchema,
  RoleEditRequestSchema,
  RoleEditResponseSchema,
  RoleGetRequestSchema,
  RoleGetResponseSchema,
} from '../schemas';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addRole(formData: IRoleAddFormDto): Observable<IRoleAddResponseDto> {
    this.logger.logUserAction('Add Role Request', formData);

    return this.apiService
      .postValidated(
        API_ROUTES.SETTINGS.PERMISSION.ROLE.ADD,
        {
          response: RoleAddResponseSchema,
          request: RoleAddRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IRoleAddResponseDto) => {
          this.logger.logUserAction('Add Role Success', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Add Role Error', error);
          } else {
            this.logger.logUserAction('Add Role Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  updateRole(
    formData: IRoleEditFormDto,
    roleId: string
  ): Observable<IRoleEditResponseDto> {
    this.logger.logUserAction('Update Role Request', {
      roleId,
      formData,
    });

    return this.apiService
      .patchValidated(
        API_ROUTES.SETTINGS.PERMISSION.ROLE.UPDATE(roleId),
        {
          response: RoleEditResponseSchema,
          request: RoleEditRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IRoleEditResponseDto) => {
          this.logger.logUserAction('Update Role Success', {
            id: roleId,
            response,
          });
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Update Role Error', error);
          } else {
            this.logger.logUserAction('Update Role Error', {
              id: roleId,
              error,
            });
          }
          return throwError(() => error);
        })
      );
  }

  deleteRole(formData: IRoleDeleteFormDto): Observable<IRoleDeleteResponseDto> {
    this.logger.logUserAction('Delete Role Request', formData);

    return this.apiService
      .deleteValidated(
        API_ROUTES.SETTINGS.PERMISSION.ROLE.DELETE,
        {
          response: RoleDeleteResponseSchema,
          request: RoleDeleteRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IRoleDeleteResponseDto) => {
          this.logger.logUserAction('Delete Role Success', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Delete Role Error', error);
          } else {
            this.logger.logUserAction('Delete Role Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getRoleList(paramData?: IRoleGetFormDto): Observable<IRoleGetResponseDto> {
    this.logger.logUserAction('Get Role List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SETTINGS.PERMISSION.ROLE.LIST,
        {
          response: RoleGetResponseSchema,
          request: RoleGetRequestSchema,
        },
        paramData
      )
      .pipe(
        tap((response: IRoleGetResponseDto) => {
          this.logger.logUserAction('Get Role List Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Get Role List Error', error);
          } else {
            this.logger.logUserAction('Get Role List Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
