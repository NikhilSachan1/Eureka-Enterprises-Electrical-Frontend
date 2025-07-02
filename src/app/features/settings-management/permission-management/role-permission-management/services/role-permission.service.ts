import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../../../core/services/api.service';
import { LoggerService } from '../../../../../core/services/logger.service';
import {
  IAddRoleManagementRequestDto,
  IAddRoleManagementResponseDto,
  IEditRoleManagementRequestDto,
  IEditRoleManagementResponseDto,
  IGetRoleListResponseDto,
} from '../models/role-permission.api.model';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { GetRoleListResponseSchema } from '../dto/role-permission-management-list.dto';
import { API_ROUTES } from '../../../../../core/constants';
import {
  AddRoleManagementDto,
  AddRoleManagementResponseSchema,
} from '../dto/add-role-permission-management.dto';
import {
  EditRoleManagementRequestSchema,
  EditRoleManagementResponseSchema,
} from '../dto/edit-role-permission-management.dto';

@Injectable({
  providedIn: 'root',
})
export class RolePermissionService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addRole(
    formData: IAddRoleManagementRequestDto,
  ): Observable<IAddRoleManagementResponseDto> {
    this.logger.logUserAction('Add Role Request', formData);

    return this.apiService
      .postValidated(
        API_ROUTES.SETTINGS.PERMISSION.ROLE.ADD,
        formData,
        AddRoleManagementDto,
        AddRoleManagementResponseSchema,
      )
      .pipe(
        tap((response: IAddRoleManagementResponseDto) => {
          this.logger.logUserAction('Add Role Success', response);
        }),
        catchError((error) => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Add Role Error', error);
          } else {
            this.logger.logUserAction('Add Role Error', error);
          }
          return throwError(() => error);
        }),
      );
  }

  updateRole(
    formData: IEditRoleManagementRequestDto,
    roleId: string,
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
        EditRoleManagementResponseSchema,
      )
      .pipe(
        tap((response: IEditRoleManagementResponseDto) => {
          this.logger.logUserAction('Update Role Success', {
            id: roleId,
            response,
          });
        }),
        catchError((error) => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Update Role Error', error);
          } else {
            this.logger.logUserAction('Update Role Error', {
              id: roleId,
              error,
            });
          }
          return throwError(() => error);
        }),
      );
  }

  getRoleList(): Observable<IGetRoleListResponseDto> {
    this.logger.logUserAction('Get Role List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SETTINGS.PERMISSION.ROLE.LIST,
        GetRoleListResponseSchema,
      )
      .pipe(
        tap((response: IGetRoleListResponseDto) => {
          this.logger.logUserAction('Get Role List Success', {
            count: response.records?.length || 0,
          });
        }),
        catchError((error) => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Get Role List Error', error);
          } else {
            this.logger.logUserAction('Get Role List Error', error);
          }
          return throwError(() => error);
        }),
      );
  }
}
