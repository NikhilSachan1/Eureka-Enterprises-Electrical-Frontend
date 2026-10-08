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
import { replaceTextWithSeparator, toTitleCase } from '@shared/utility';
import { IModulePermission } from '../types/system-permission.interface';
import { AppConfigurationService } from '@shared/services';

/** Only Financials uses `module.submodule.permission` names in the matrix UI. */
const FINANCIALS_MODULE_KEY = 'financials';

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

        const normalizeModuleKey = (value: string): string =>
          replaceTextWithSeparator(
            replaceTextWithSeparator(value.toLowerCase(), ' ', '_'),
            '-',
            '_'
          );

        const moduleMap = moduleNames.reduce((acc, module) => {
          const moduleKey = normalizeModuleKey(module.value);
          acc.set(moduleKey, {
            id: `module-${moduleKey}`,
            moduleName: module.label,
            permissions: [],
          });
          return acc;
        }, new Map<string, IModulePermission>());

        const financialSubmodules = new Map<string, IModulePermission>();

        response.records.forEach(
          (permission: ISystemPermissionGetBaseResponseDto) => {
            const moduleKey = normalizeModuleKey(permission.module);
            const permissionEntry = {
              id: permission.id,
              name: permission.name,
              label: permission.label,
              description: permission.description,
            };

            if (moduleKey === FINANCIALS_MODULE_KEY) {
              const submoduleKey = this.extractFinancialSubmoduleKey(
                permission.name,
                normalizeModuleKey
              );

              if (submoduleKey) {
                const submoduleMapKey = `${FINANCIALS_MODULE_KEY}_${normalizeModuleKey(submoduleKey)}`;

                if (!financialSubmodules.has(submoduleMapKey)) {
                  financialSubmodules.set(submoduleMapKey, {
                    id: `module-${submoduleMapKey}`,
                    moduleName: this.formatFinancialSubmoduleLabel(submoduleKey),
                    permissions: [],
                  });
                }

                financialSubmodules
                  .get(submoduleMapKey)
                  ?.permissions.push(permissionEntry);
                return;
              }
            }

            if (moduleMap.has(moduleKey)) {
              moduleMap.get(moduleKey)?.permissions.push(permissionEntry);
            }
          }
        );

        const modules: IModulePermission[] = [];

        moduleMap.forEach((module, key) => {
          if (key === FINANCIALS_MODULE_KEY) {
            const sortedSubmodules = Array.from(financialSubmodules.values()).sort(
              (a, b) => a.moduleName.localeCompare(b.moduleName)
            );
            modules.push(...sortedSubmodules);

            if (module.permissions.length > 0) {
              modules.push(module);
            }
            return;
          }

          modules.push(module);
        });

        if (
          !moduleMap.has(FINANCIALS_MODULE_KEY) &&
          financialSubmodules.size > 0
        ) {
          modules.push(
            ...Array.from(financialSubmodules.values()).sort((a, b) =>
              a.moduleName.localeCompare(b.moduleName)
            )
          );
        }

        return modules;
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

  /**
   * Parses `financials.advance-payments.settle` (or `advance-payments.settle`)
   * into the submodule key `advance-payments`.
   */
  private extractFinancialSubmoduleKey(
    permissionName: string,
    normalizeModuleKey: (value: string) => string
  ): string | null {
    const parts = permissionName
      .toLowerCase()
      .split('.')
      .map(part => part.trim())
      .filter(Boolean);

    if (
      parts.length >= 3 &&
      normalizeModuleKey(parts[0] ?? '') === FINANCIALS_MODULE_KEY
    ) {
      return parts[1] ?? null;
    }

    if (
      parts.length >= 2 &&
      normalizeModuleKey(parts[0] ?? '') !== FINANCIALS_MODULE_KEY
    ) {
      return parts[0] ?? null;
    }

    return null;
  }

  private formatFinancialSubmoduleLabel(submoduleKey: string): string {
    return toTitleCase(
      replaceTextWithSeparator(
        replaceTextWithSeparator(submoduleKey, '-', ' '),
        '_',
        ' '
      )
    );
  }
}
