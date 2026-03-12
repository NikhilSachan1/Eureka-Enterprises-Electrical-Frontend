import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { ApiService } from '@core/services';
import {
  ISystemPermissionAddFormDto,
  ISystemPermissionAddResponseDto,
  ISystemPermissionDeleteFormDto,
  ISystemPermissionDeleteResponseDto,
  ISystemPermissionEditFormDto,
  ISystemPermissionEditResponseDto,
  ISystemPermissionGetResponseDto,
  ISystemPermissionGetBaseResponseDto,
  ISystemPermissionGetFormDto,
} from '../types/system-permission.dto';
import { API_ROUTES } from '@core/constants';
import {
  SystemPermissionAddRequestSchema,
  SystemPermissionAddResponseSchema,
  SystemPermissionDeleteRequestSchema,
  SystemPermissionDeleteResponseSchema,
  SystemPermissionEditRequestSchema,
  SystemPermissionEditResponseSchema,
  SystemPermissionGetRequestSchema,
  SystemPermissionGetResponseSchema,
} from '../schemas';
import { replaceTextWithSeparator } from '@shared/utility';
import { IModulePermission } from '../types/system-permission.interface';
import { AppConfigurationService } from '@shared/services';

@Injectable({
  providedIn: 'root',
})
export class SystemPermissionService {
  private readonly apiService = inject(ApiService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  addSystemPermission(
    formData: ISystemPermissionAddFormDto
  ): Observable<ISystemPermissionAddResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.SETTINGS.PERMISSION.SYSTEM.ADD,
        {
          response: SystemPermissionAddResponseSchema,
          request: SystemPermissionAddRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  updateSystemPermission(
    formData: ISystemPermissionEditFormDto,
    permissionId: string
  ): Observable<ISystemPermissionEditResponseDto> {
    return this.apiService
      .patchValidated(
        API_ROUTES.SETTINGS.PERMISSION.SYSTEM.UPDATE(permissionId),
        {
          response: SystemPermissionEditResponseSchema,
          request: SystemPermissionEditRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  deleteSystemPermission(
    formData: ISystemPermissionDeleteFormDto
  ): Observable<ISystemPermissionDeleteResponseDto> {
    return this.apiService
      .deleteValidated(
        `${API_ROUTES.SETTINGS.PERMISSION.SYSTEM.DELETE}`,
        {
          response: SystemPermissionDeleteResponseSchema,
          request: SystemPermissionDeleteRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getSystemPermissionList(
    paramData?: ISystemPermissionGetFormDto
  ): Observable<ISystemPermissionGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.SETTINGS.PERMISSION.SYSTEM.LIST,
        {
          response: SystemPermissionGetResponseSchema,
          request: SystemPermissionGetRequestSchema,
        },
        paramData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getSystemPermissionModuleWise(): Observable<IModulePermission[]> {
    return this.getSystemPermissionList().pipe(
      map((response: ISystemPermissionGetResponseDto) => {
        const moduleNames = this.appConfigurationService.moduleNames();

        const moduleMap = moduleNames.reduce((acc, module) => {
          const moduleKey = module.value.toLowerCase();
          acc.set(moduleKey, {
            id: `module-${moduleKey}`,
            moduleName: module.label,
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
      catchError(error => throwError(() => error))
    );
  }
}
