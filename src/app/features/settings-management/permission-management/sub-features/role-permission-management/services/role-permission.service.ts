import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services';
import { Observable, catchError, throwError } from 'rxjs';
import {
  IRolePermissionsGetFormDto,
  IRolePermissionsGetResponseDto,
  IRolePermissionsSetFormDto,
  IRolePermissionsSetResponseDto,
} from '../types/role-permission.dto';
import {
  RolePermissionsGetRequestSchema,
  RolePermissionsGetResponseSchema,
  RolePermissionsSetRequestSchema,
  RolePermissionsSetResponseSchema,
} from '../schemas';
import { API_ROUTES } from '@core/constants';

@Injectable({
  providedIn: 'root',
})
export class RolePermissionService {
  private readonly apiService = inject(ApiService);

  setRolePermission(
    formData: IRolePermissionsSetFormDto
  ): Observable<IRolePermissionsSetResponseDto> {
    return this.apiService
      .postValidated(
        `${API_ROUTES.SETTINGS.PERMISSION.ROLE_PERMISSION.SET}`,
        {
          response: RolePermissionsSetResponseSchema,
          request: RolePermissionsSetRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getRolePermission(
    params: IRolePermissionsGetFormDto
  ): Observable<IRolePermissionsGetResponseDto> {
    return this.apiService
      .getValidated(
        `${API_ROUTES.SETTINGS.PERMISSION.ROLE_PERMISSION.LIST}`,
        {
          response: RolePermissionsGetResponseSchema,
          request: RolePermissionsGetRequestSchema,
        },
        params
      )
      .pipe(catchError(error => throwError(() => error)));
  }
}
