import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services';
import { catchError, Observable, throwError } from 'rxjs';
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
  private readonly apiService = inject(ApiService);

  addRole(formData: IRoleAddFormDto): Observable<IRoleAddResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.SETTINGS.PERMISSION.ROLE.ADD,
        {
          response: RoleAddResponseSchema,
          request: RoleAddRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  updateRole(
    formData: IRoleEditFormDto,
    roleId: string
  ): Observable<IRoleEditResponseDto> {
    return this.apiService
      .patchValidated(
        API_ROUTES.SETTINGS.PERMISSION.ROLE.UPDATE(roleId),
        {
          response: RoleEditResponseSchema,
          request: RoleEditRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  deleteRole(formData: IRoleDeleteFormDto): Observable<IRoleDeleteResponseDto> {
    return this.apiService
      .deleteValidated(
        API_ROUTES.SETTINGS.PERMISSION.ROLE.DELETE,
        {
          response: RoleDeleteResponseSchema,
          request: RoleDeleteRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getRoleList(paramData?: IRoleGetFormDto): Observable<IRoleGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.SETTINGS.PERMISSION.ROLE.LIST,
        {
          response: RoleGetResponseSchema,
          request: RoleGetRequestSchema,
        },
        paramData
      )
      .pipe(catchError(error => throwError(() => error)));
  }
}
