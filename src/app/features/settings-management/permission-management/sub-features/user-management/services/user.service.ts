import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services';
import { catchError, Observable, throwError } from 'rxjs';
import {
  IUserChangeRoleFormDto,
  IUserChangeRoleResponseDto,
  IUserGetFormDto,
  IUserGetResponseDto,
  IUserPermissionDeleteFormDto,
  IUserPermissionDeleteResponseDto,
} from '../types/user.dto';
import { API_ROUTES } from '@core/constants';
import {
  UserChangeRoleRequestSchema,
  UserChangeRoleResponseSchema,
  UserGetRequestSchema,
  UserGetResponseSchema,
  UserPermissionDeleteRequestSchema,
  UserPermissionDeleteResponseSchema,
} from '../schemas';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiService = inject(ApiService);

  deleteUserPermission(
    formData: IUserPermissionDeleteFormDto
  ): Observable<IUserPermissionDeleteResponseDto> {
    return this.apiService
      .deleteValidated(
        API_ROUTES.SETTINGS.PERMISSION.USER_PERMISSION.DELETE,
        {
          response: UserPermissionDeleteResponseSchema,
          request: UserPermissionDeleteRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  changeUserRole(
    formData: IUserChangeRoleFormDto,
    employeeId: string
  ): Observable<IUserChangeRoleResponseDto> {
    return this.apiService
      .patchValidated(
        API_ROUTES.SETTINGS.PERMISSION.USER_PERMISSION.CHANGE_ROLE(employeeId),
        {
          response: UserChangeRoleResponseSchema,
          request: UserChangeRoleRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getUserList(paramData: IUserGetFormDto): Observable<IUserGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.SETTINGS.PERMISSION.USER.LIST,
        {
          response: UserGetResponseSchema,
          request: UserGetRequestSchema,
        },
        paramData
      )
      .pipe(catchError(error => throwError(() => error)));
  }
}
