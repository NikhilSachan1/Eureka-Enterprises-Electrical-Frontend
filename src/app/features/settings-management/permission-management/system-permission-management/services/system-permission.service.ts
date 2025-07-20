import { inject, Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError, map } from 'rxjs';
import { ApiService, LoggerService } from '@core/services';
import {
  IAddSystemPermissionRequestDto,
  IAddSystemPermissionResponseDto,
  IDeleteSystemPermissionRequestDto,
  IDeleteSystemPermissionResponseDto,
  IEditSystemPermissionRequestDto,
  IEditSystemPermissionResponseDto,
  IGetSystemPermissionListResponseDto,
} from '@features/settings-management/permission-management/system-permission-management/models/system-permission.api.model';
import { API_ROUTES } from '@core/constants';
import {
  AddSystemPermissionRequestSchema,
  AddSystemPermissionResponseSchema,
} from '@features/settings-management/permission-management/system-permission-management/dto/add-system-permission-management.dto';
import { GetSystemPermissionListResponseSchema } from '@features/settings-management/permission-management/system-permission-management/dto/system-permission-management-list.dto';
import {
  EditSystemPermissionRequestSchema,
  EditSystemPermissionResponseSchema,
} from '@features/settings-management/permission-management/system-permission-management/dto/edit-system-permission-management.dto';
import { IModulePermission } from '@features/settings-management/permission-management/system-permission-management/models/system-permission.model';
import { MODULES_NAME_DATA } from '@shared/config';
import {
  DeleteSystemPermissionRequestSchema,
  DeleteSystemPermissionResponseSchema,
} from '@features/settings-management/permission-management/system-permission-management/dto/delete-system-permission-management.dto';

@Injectable({
  providedIn: 'root',
})
export class SystemPermissionService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addSystemPermission(
    formData: IAddSystemPermissionRequestDto
  ): Observable<IAddSystemPermissionResponseDto> {
    this.logger.logUserAction('Add System Permission Request', formData);

    return this.apiService
      .postValidated(
        API_ROUTES.SETTINGS.PERMISSION.SYSTEM.ADD,
        formData,
        AddSystemPermissionRequestSchema,
        AddSystemPermissionResponseSchema
      )
      .pipe(
        tap((response: IAddSystemPermissionResponseDto) => {
          this.logger.logUserAction('Add System Permission Success', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Add System Permission Error',
              error
            );
          } else {
            this.logger.logUserAction('Add System Permission Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  updateSystemPermission(
    formData: IEditSystemPermissionRequestDto,
    permissionId: string
  ): Observable<IEditSystemPermissionResponseDto> {
    this.logger.logUserAction('Update System Permission Request', {
      permissionId,
      formData,
    });

    return this.apiService
      .patchValidated(
        `${API_ROUTES.SETTINGS.PERMISSION.SYSTEM.UPDATE}/${permissionId}`,
        formData,
        EditSystemPermissionRequestSchema,
        EditSystemPermissionResponseSchema
      )
      .pipe(
        tap((response: IEditSystemPermissionResponseDto) => {
          this.logger.logUserAction('Update System Permission Success', {
            id: permissionId,
            response,
          });
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Update System Permission Error',
              error
            );
          } else {
            this.logger.logUserAction('Update System Permission Error', {
              id: permissionId,
              error,
            });
          }
          return throwError(() => error);
        })
      );
  }

  getSystemPermissionList(): Observable<IGetSystemPermissionListResponseDto> {
    this.logger.logUserAction('Get System Permission List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SETTINGS.PERMISSION.SYSTEM.LIST,
        GetSystemPermissionListResponseSchema
      )
      .pipe(
        tap((response: IGetSystemPermissionListResponseDto) => {
          this.logger.logUserAction(
            'Get System Permission List Success',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get System Permission List Error',
              error
            );
          } else {
            this.logger.logUserAction(
              'Get System Permission List Error',
              error
            );
          }
          return throwError(() => error);
        })
      );
  }

  deleteSystemPermission(
    formData: IDeleteSystemPermissionRequestDto
  ): Observable<IDeleteSystemPermissionResponseDto> {
    this.logger.logUserAction('Delete System Permission Request', formData);

    return this.apiService
      .deleteValidated(
        `${API_ROUTES.SETTINGS.PERMISSION.SYSTEM.DELETE}`,
        formData,
        DeleteSystemPermissionRequestSchema,
        DeleteSystemPermissionResponseSchema
      )
      .pipe(
        tap((response: IDeleteSystemPermissionResponseDto) => {
          this.logger.logUserAction(
            'Delete System Permission Success',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Delete System Permission Error',
              error
            );
          } else {
            this.logger.logUserAction('Delete System Permission Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getSystemPermissionModuleWise(): Observable<IModulePermission[]> {
    this.logger.logUserAction('Get System Permission Module Wise Request');

    return this.getSystemPermissionList().pipe(
      map((response: IGetSystemPermissionListResponseDto) => {
        const moduleMap = MODULES_NAME_DATA.reduce((acc, staticModule) => {
          const moduleKey = staticModule.value.toLowerCase();
          acc.set(moduleKey, {
            id: `module-${moduleKey}`,
            moduleName: staticModule.label,
            permissions: [],
          });
          return acc;
        }, new Map<string, IModulePermission>());

        response.records.forEach(permission => {
          const moduleKey = permission.module.toLowerCase();

          if (moduleMap.has(moduleKey)) {
            moduleMap.get(moduleKey)?.permissions.push({
              id: permission.id,
              label: permission.label,
              description: permission.description,
            });
          }
        });

        return Array.from(moduleMap.values());
      }),
      tap(() => {
        this.logger.logUserAction('Get System Permission Module Wise Success');
      }),
      catchError(error => {
        this.logger.logUserAction(
          'Get System Permission Module Wise Error',
          error
        );
        return throwError(() => error);
      })
    );
  }
}
