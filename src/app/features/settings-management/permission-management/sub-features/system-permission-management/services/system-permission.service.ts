import { inject, Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError, map } from 'rxjs';
import { ApiService, LoggerService } from '@core/services';
import {
  ISystemPermissionAddRequestDto,
  ISystemPermissionAddResponseDto,
  ISystemPermissionDeleteRequestDto,
  ISystemPermissionDeleteResponseDto,
  ISystemPermissionEditRequestDto,
  ISystemPermissionEditResponseDto,
  ISystemPermissionGetBaseResponseDto,
  ISystemPermissionGetResponseDto,
} from '../types/system-permission.dto';
import { API_ROUTES } from '@core/constants';
import {
  SystemPermissionGetResponseSchema,
  SystemPermissionAddRequestSchema,
  SystemPermissionAddResponseSchema,
  SystemPermissionDeleteRequestSchema,
  SystemPermissionDeleteResponseSchema,
  SystemPermissionEditRequestSchema,
  SystemPermissionEditResponseSchema,
} from '../schemas';
import { MODULES_NAME_DATA } from '@shared/config';
import { IModulePermission } from '../types/system-permission.interface';
import { replaceTextWithSeparator } from '@shared/utility';

@Injectable({
  providedIn: 'root',
})
export class SystemPermissionService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addSystemPermission(
    formData: ISystemPermissionAddRequestDto
  ): Observable<ISystemPermissionAddResponseDto> {
    this.logger.logUserAction('Add System Permission Request', formData);

    return this.apiService
      .postValidated(
        API_ROUTES.SETTINGS.PERMISSION.SYSTEM.ADD,
        formData,
        SystemPermissionAddRequestSchema,
        SystemPermissionAddResponseSchema
      )
      .pipe(
        tap((response: ISystemPermissionAddResponseDto) => {
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
    formData: ISystemPermissionEditRequestDto,
    permissionId: string
  ): Observable<ISystemPermissionEditResponseDto> {
    this.logger.logUserAction('Update System Permission Request', {
      permissionId,
      formData,
    });

    return this.apiService
      .patchValidated(
        `${API_ROUTES.SETTINGS.PERMISSION.SYSTEM.UPDATE}/${permissionId}`,
        formData,
        SystemPermissionEditRequestSchema,
        SystemPermissionEditResponseSchema
      )
      .pipe(
        tap((response: ISystemPermissionEditResponseDto) => {
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

  getSystemPermissionList(): Observable<ISystemPermissionGetResponseDto> {
    this.logger.logUserAction('Get System Permission List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SETTINGS.PERMISSION.SYSTEM.LIST,
        SystemPermissionGetResponseSchema
      )
      .pipe(
        tap((response: ISystemPermissionGetResponseDto) => {
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
    formData: ISystemPermissionDeleteRequestDto
  ): Observable<ISystemPermissionDeleteResponseDto> {
    this.logger.logUserAction('Delete System Permission Request', formData);

    return this.apiService
      .deleteValidated(
        `${API_ROUTES.SETTINGS.PERMISSION.SYSTEM.DELETE}`,
        formData,
        SystemPermissionDeleteRequestSchema,
        SystemPermissionDeleteResponseSchema
      )
      .pipe(
        tap((response: ISystemPermissionDeleteResponseDto) => {
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
      map((response: ISystemPermissionGetResponseDto) => {
        const moduleMap = MODULES_NAME_DATA.reduce((acc, staticModule) => {
          const moduleKey = staticModule.value.toLowerCase();
          acc.set(moduleKey, {
            id: `module-${moduleKey}`,
            moduleName: staticModule.label,
            permissions: [],
          });
          return acc;
        }, new Map<string, IModulePermission>());

        response.records.forEach(
          (permission: ISystemPermissionGetBaseResponseDto) => {
            const moduleKey = replaceTextWithSeparator(
              permission.module.toLowerCase(),
              ' ',
              '_'
            );

            if (moduleMap.has(moduleKey)) {
              moduleMap.get(moduleKey)?.permissions.push({
                id: permission.id,
                label: permission.label,
                description: permission.description,
              });
            }
          }
        );

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
