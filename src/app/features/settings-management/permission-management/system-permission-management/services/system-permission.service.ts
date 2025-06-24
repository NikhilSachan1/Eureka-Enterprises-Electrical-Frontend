import { inject, Injectable } from '@angular/core';
import { catchError, finalize, Observable, tap, throwError } from 'rxjs';
import { ApiService } from '../../../../../core/services/api.service';
import { IAddSystemPermissionRequestDto, IAddSystemPermissionResponseDto } from '../models/system-permission.api.model';
import { LoggerService } from '../../../../../core/services/logger.service';
import { LoadingService } from '../../../../../shared/services/loading.service';
import { API_ROUTES } from '../../../../../core/constants/api.constants';
import { ROUTE_BASE_PATHS } from '../../../../../shared/constants/route.constants';
import { AddSystemPermissionRequestSchema, AddSystemPermissionResponseSchema } from '../dto/system-permission-management.dto';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SystemPermissionService {

  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);
  private readonly loadingService = inject(LoadingService);
  private readonly router = inject(Router);

  addSystemPermission(formData: IAddSystemPermissionRequestDto): Observable<IAddSystemPermissionResponseDto> {

    this.loadingService.show({
      title: 'Adding System Permission',
      message: 'Please wait while we add the system permission...'
    });

    this.logger.logUserAction('Add System Permission Attempt', formData);
    
    return this.apiService.postValidated(
      API_ROUTES.SETTINGS.PERMISSION.SYSTEM.ADD, 
      formData, 
      AddSystemPermissionRequestSchema, 
      AddSystemPermissionResponseSchema
    ).pipe(
      tap((response: IAddSystemPermissionResponseDto) => {
        this.logger.logUserAction('Add System Permission Success', response);
        this.router.navigate([`${ROUTE_BASE_PATHS.SETTINGS.BASE}/${ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE}/${ROUTE_BASE_PATHS.SETTINGS.PERMISSION.SYSTEM}`]);
      }),
      catchError((error) => {
        this.logger.logUserAction('Add System Permission Error', error);
        return throwError(() => error);
      }),
      finalize(() => {
        this.loadingService.hide();
      })
    );
  }
}