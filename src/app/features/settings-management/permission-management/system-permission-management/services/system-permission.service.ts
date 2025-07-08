import { inject, Injectable } from '@angular/core';
import { catchError, Observable, tap, throwError, map } from 'rxjs';
import { ApiService } from '../../../../../core/services/api.service';
import {
  IAddSystemPermissionRequestDto,
  IAddSystemPermissionResponseDto,
  IEditSystemPermissionRequestDto,
  IEditSystemPermissionResponseDto,
  IGetSystemPermissionListResponseDto,
} from '../models/system-permission.api.model';
import { LoggerService } from '../../../../../core/services/logger.service';
import { API_ROUTES } from '../../../../../core/constants';
import {
  AddSystemPermissionRequestSchema,
  AddSystemPermissionResponseSchema,
} from '../dto/add-system-permission-management.dto';
import { GetSystemPermissionListResponseSchema } from '../dto/system-permission-management-list.dto';
import {
  EditSystemPermissionRequestSchema,
  EditSystemPermissionResponseSchema,
} from '../dto/edit-system-permission-management.dto';
import { IModulePermission } from '../models/system-permission.model';
import { MODULES_NAME_DATA } from '../../../../../shared/config/static-data.config';

@Injectable({
  providedIn: 'root',
})
export class SystemPermissionService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addSystemPermission(
    formData: IAddSystemPermissionRequestDto,
  ): Observable<IAddSystemPermissionResponseDto> {
    this.logger.logUserAction('Add System Permission Request', formData);

    return this.apiService
      .postValidated(
        API_ROUTES.SETTINGS.PERMISSION.SYSTEM.ADD,
        formData,
        AddSystemPermissionRequestSchema,
        AddSystemPermissionResponseSchema,
      )
      .pipe(
        tap((response: IAddSystemPermissionResponseDto) => {
          this.logger.logUserAction('Add System Permission Success', response);
        }),
        catchError((error) => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Add System Permission Error', error);
          } else {
            this.logger.logUserAction('Add System Permission Error', error);
          }
          return throwError(() => error);
        }),
      );
  }

  updateSystemPermission(
    formData: IEditSystemPermissionRequestDto,
    permissionId: string,
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
        EditSystemPermissionResponseSchema,
      )
      .pipe(
        tap((response: IEditSystemPermissionResponseDto) => {
          this.logger.logUserAction('Update System Permission Success', {
            id: permissionId,
            response,
          });
        }),
        catchError((error) => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Update System Permission Error', error);
          } else {
          this.logger.logUserAction('Update System Permission Error', {
              id: permissionId,
              error,
            });
          }
          return throwError(() => error);
        }),
      );
  }

  getSystemPermissionList(): Observable<IGetSystemPermissionListResponseDto> {
    this.logger.logUserAction('Get System Permission List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SETTINGS.PERMISSION.SYSTEM.LIST,
        GetSystemPermissionListResponseSchema,
      )
      .pipe(
        tap((response: IGetSystemPermissionListResponseDto) => {
          this.logger.logUserAction('Get System Permission List Success', {
            count: response.records?.length || 0,
          });
        }),
        catchError((error) => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Get System Permission List Error', error);
          } else {
            this.logger.logUserAction('Get System Permission List Error', error);
          }
          return throwError(() => error);
        }),
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
            permissions: []
          });
          return acc;
        }, new Map<string, IModulePermission>());

        response.records.forEach(permission => {
          const moduleKey = permission.module.toLowerCase();
          
          if (moduleMap.has(moduleKey)) {
            moduleMap.get(moduleKey)!.permissions.push({
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
      catchError((error) => {
        this.logger.logUserAction('Get System Permission Module Wise Error', error);
        return throwError(() => error);
      })
    );
  }
}
