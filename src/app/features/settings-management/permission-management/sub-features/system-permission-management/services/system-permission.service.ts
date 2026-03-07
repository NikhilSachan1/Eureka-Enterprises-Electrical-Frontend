import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { ApiService, LoggerService } from '@core/services';
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
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  addSystemPermission(
    formData: ISystemPermissionAddFormDto
  ): Observable<ISystemPermissionAddResponseDto> {
    this.logger.logUserAction('Add System Permission Request', formData);

    return this.apiService
      .postValidated(
        API_ROUTES.SETTINGS.PERMISSION.SYSTEM.ADD,
        {
          response: SystemPermissionAddResponseSchema,
          request: SystemPermissionAddRequestSchema,
        },
        formData
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
    formData: ISystemPermissionEditFormDto,
    permissionId: string
  ): Observable<ISystemPermissionEditResponseDto> {
    this.logger.logUserAction('Update System Permission Request', {
      permissionId,
      formData,
    });

    return this.apiService
      .patchValidated(
        API_ROUTES.SETTINGS.PERMISSION.SYSTEM.UPDATE(permissionId),
        {
          response: SystemPermissionEditResponseSchema,
          request: SystemPermissionEditRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: ISystemPermissionEditResponseDto) => {
          this.logger.logUserAction(
            'Update System Permission Success',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Update System Permission Error',
              error
            );
          } else {
            this.logger.logUserAction('Update System Permission Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  deleteSystemPermission(
    formData: ISystemPermissionDeleteFormDto
  ): Observable<ISystemPermissionDeleteResponseDto> {
    this.logger.logUserAction('Delete System Permission Request', formData);

    return this.apiService
      .deleteValidated(
        `${API_ROUTES.SETTINGS.PERMISSION.SYSTEM.DELETE}`,
        {
          response: SystemPermissionDeleteResponseSchema,
          request: SystemPermissionDeleteRequestSchema,
        },
        formData
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

  getSystemPermissionList(
    paramData?: ISystemPermissionGetFormDto
  ): Observable<ISystemPermissionGetResponseDto> {
    this.logger.logUserAction('Get System Permission List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SETTINGS.PERMISSION.SYSTEM.LIST,
        {
          response: SystemPermissionGetResponseSchema,
          request: SystemPermissionGetRequestSchema,
        },
        paramData
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

  getSystemPermissionModuleWise(): Observable<IModulePermission[]> {
    this.logger.logUserAction('Get System Permission Module Wise Request');

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
