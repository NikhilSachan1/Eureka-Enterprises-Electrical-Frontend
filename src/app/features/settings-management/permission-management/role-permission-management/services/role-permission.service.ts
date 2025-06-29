import { inject, Injectable } from '@angular/core';
import { LoadingService, RouterService } from '../../../../../shared/services';
import { ApiService } from '../../../../../core/services/api.service';
import { LoggerService } from '../../../../../core/services/logger.service';
import { IAddRoleManagementRequestDto, IAddRoleManagementResponseDto, IEditRoleManagementRequestDto, IEditRoleManagementResponseDto, IGetRoleListResponseDto } from '../models/role-permission.api.model';
import { catchError, finalize, Observable, tap, throwError } from 'rxjs';
import { GetRoleListResponseSchema } from '../dto/role-permission-management-list.dto';
import { API_ROUTES } from '../../../../../core/constants';
import { AddRoleManagementDto, AddRoleManagementResponseSchema } from '../dto/add-role-permission-management.dto';
import { ROUTE_BASE_PATHS } from '../../../../../shared/constants';
import { EditRoleManagementRequestSchema, EditRoleManagementResponseSchema } from '../dto/edit-role-permission-management.dto';

@Injectable({
  providedIn: 'root'
})
export class RolePermissionService {

  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);
  private readonly loadingService = inject(LoadingService);
  private readonly routerService = inject(RouterService);

  addRole(formData: IAddRoleManagementRequestDto): Observable<IAddRoleManagementResponseDto> {

    this.loadingService.show({
      title: 'Adding Role',
      message: 'Please wait while we add the role...'
    });

    this.logger.logUserAction('Add Role Attempt', formData);

    return this.apiService.postValidated(
      API_ROUTES.SETTINGS.PERMISSION.ROLE.ADD,
      formData,
      AddRoleManagementDto,
      AddRoleManagementResponseSchema
    ).pipe(
      tap((response: IAddRoleManagementResponseDto) => {
        this.logger.logUserAction('Add Role Success', response);
        this.routerService.navigate([`${ROUTE_BASE_PATHS.SETTINGS.BASE}/${ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE}/${ROUTE_BASE_PATHS.SETTINGS.PERMISSION.ROLE}`]);
      }),
      catchError((error) => {
        this.logger.logUserAction('Add Role Error', error);
        return throwError(() => error);
      }),
      finalize(() => {
        this.loadingService.hide();
      })
    );
  }

  updateRole(formData: IEditRoleManagementRequestDto, roleId: string): Observable<IEditRoleManagementResponseDto> {

    this.loadingService.show({
      title: 'Updating Role',
      message: 'Please wait while we update the role...'
    });

    this.logger.logUserAction('Update Role Attempt', formData);

    return this.apiService.patchValidated(
      `${API_ROUTES.SETTINGS.PERMISSION.ROLE.UPDATE}/${roleId}`,
      formData,
      EditRoleManagementRequestSchema,
      EditRoleManagementResponseSchema
    ).pipe(
      tap((response: IEditRoleManagementResponseDto) => {
        this.logger.logUserAction('Update Role Success', response);
      }),
      catchError((error) => {
        this.logger.logUserAction('Update System Permission Error', error);
        return throwError(() => error);
      }),
      finalize(() => {
        this.loadingService.hide();
      })
    );;
  }

  getRoleList(): Observable<IGetRoleListResponseDto> {
    this.loadingService.show({
      title: 'Getting Role Permission List',
      message: 'Please wait while we get the role permission list...'
    });

    this.logger.logUserAction('Get Role Permission List Attempt');
    
    return this.apiService.getValidated(
      API_ROUTES.SETTINGS.PERMISSION.ROLE.LIST,
      GetRoleListResponseSchema
    ).pipe(
      tap((response: IGetRoleListResponseDto) => {
        this.logger.info('Get Role Permission List Success', response);
      }),
      catchError((error) => {
        this.logger.error('Get Role Permission List Error', error);
        return throwError(() => error);
      }),
      finalize(() => {
        this.loadingService.hide();
      })
    );
  }

}
