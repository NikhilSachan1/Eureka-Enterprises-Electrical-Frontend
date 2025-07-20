import { inject, Injectable } from '@angular/core';
import { ApiService, LoggerService } from '@core/services';
import {
  IAddRoleManagementRequestDto,
  IAddRoleManagementResponseDto,
  IDeleteRoleManagementRequestDto,
  IDeleteRoleManagementResponseDto,
  IEditRoleManagementRequestDto,
  IEditRoleManagementResponseDto,
  IGetRoleListResponseDto,
} from '@features/settings-management/permission-management/role-management/models/role-management.api.model';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { GetRoleListResponseSchema } from '@features/settings-management/permission-management/role-management/dto/role-list-management.dto';
import { API_ROUTES } from '@core/constants';
import {
  AddRoleManagementRequestSchema,
  AddRoleManagementResponseSchema,
} from '@features/settings-management/permission-management/role-management/dto/add-role-management.dto';
import {
  EditRoleManagementRequestSchema,
  EditRoleManagementResponseSchema,
} from '@features/settings-management/permission-management/role-management/dto/edit-role-management.dto';
import {
  IGetRolePermissionRequestDto,
  IGetRolePermissionsResponseDto,
  ISetRolePermissionRequestDto,
  ISetRolePermissionResponseDto,
} from '@features/settings-management/permission-management/role-management/models/role-permission.api.model';
import { GetRolePermissionsResponseSchema } from '@features/settings-management/permission-management/role-management/dto/get-role-permissions.dto';
import {
  DeleteRoleRequestSchema,
  DeleteRoleResponseSchema,
} from '@features/settings-management/permission-management/role-management/dto/delete-role-management.dto';
import {
  SetRolePermissionRequestSchema,
  SetRolePermissionResponseSchema,
} from '@features/settings-management/permission-management/role-management/dto/set-role-permission.dto';

@Injectable({
  providedIn: 'root',
})
export class RoleManagementService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addRole(
    formData: IAddRoleManagementRequestDto
  ): Observable<IAddRoleManagementResponseDto> {
    this.logger.logUserAction('Add Role Request', formData);

    return this.apiService
      .postValidated(
        API_ROUTES.SETTINGS.PERMISSION.ROLE.ADD,
        formData,
        AddRoleManagementRequestSchema,
        AddRoleManagementResponseSchema
      )
      .pipe(
        tap((response: IAddRoleManagementResponseDto) => {
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
    formData: IEditRoleManagementRequestDto,
    roleId: string
  ): Observable<IEditRoleManagementResponseDto> {
    this.logger.logUserAction('Update Role Request', {
      roleId,
      formData,
    });

    return this.apiService
      .patchValidated(
        `${API_ROUTES.SETTINGS.PERMISSION.ROLE.UPDATE}/${roleId}`,
        formData,
        EditRoleManagementRequestSchema,
        EditRoleManagementResponseSchema
      )
      .pipe(
        tap((response: IEditRoleManagementResponseDto) => {
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

  getRoleList(): Observable<IGetRoleListResponseDto> {
    this.logger.logUserAction('Get Role List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SETTINGS.PERMISSION.ROLE.LIST,
        GetRoleListResponseSchema
      )
      .pipe(
        tap((response: IGetRoleListResponseDto) => {
          this.logger.info('Get Role List Response', response);
          this.logger.logUserAction('Get Role List Success');
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

  getRolePermission(
    params: IGetRolePermissionRequestDto
  ): Observable<IGetRolePermissionsResponseDto> {
    this.logger.logUserAction('Get Role Permission Request', params);

    return this.apiService
      .getValidated(
        `${API_ROUTES.SETTINGS.PERMISSION.ROLE.PERMISSION_LIST}`,
        GetRolePermissionsResponseSchema,
        params
      )
      .pipe(
        tap((response: IGetRolePermissionsResponseDto) => {
          this.logger.info('Get Role Permission Response', response);
          this.logger.logUserAction('Get Role Permission Success');
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

  deleteRole(
    formData: IDeleteRoleManagementRequestDto
  ): Observable<IDeleteRoleManagementResponseDto> {
    this.logger.logUserAction('Delete Role Request', formData);

    return this.apiService
      .deleteValidated(
        `${API_ROUTES.SETTINGS.PERMISSION.ROLE.DELETE}`,
        formData,
        DeleteRoleRequestSchema,
        DeleteRoleResponseSchema
      )
      .pipe(
        tap((response: IDeleteRoleManagementResponseDto) => {
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

  setRolePermission(
    formData: ISetRolePermissionRequestDto
  ): Observable<ISetRolePermissionResponseDto> {
    this.logger.logUserAction('Set Role Permission Request', formData);

    return this.apiService
      .postValidated(
        `${API_ROUTES.SETTINGS.PERMISSION.ROLE.SET_PERMISSION}`,
        formData,
        SetRolePermissionRequestSchema,
        SetRolePermissionResponseSchema
      )
      .pipe(
        tap((response: ISetRolePermissionResponseDto) => {
          this.logger.logUserAction('Set Role Permission Success', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Set Role Permission Error',
              error
            );
          } else {
            this.logger.logUserAction('Set Role Permission Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
