import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { LoggerService } from '@core/services/logger.service';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  IConfigurationAddFormDto,
  IConfigurationAddResponseDto,
  IConfigurationEditFormDto,
  IConfigurationEditResponseDto,
  IConfigurationGetRequestDto,
  IConfigurationGetResponseDto,
} from '../types/configuration.dto';
import { API_ROUTES } from '@core/constants/api.constants';
import {
  ConfigurationAddRequestSchema,
  ConfigurationAddResponseSchema,
  ConfigurationGetRequestSchema,
  ConfigurationGetResponseSchema,
} from '../schemas';
import {
  ConfigurationEditRequestSchema,
  ConfigurationEditResponseSchema,
} from '../schemas/edit-configuration.schema';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addConfiguration(
    formData: IConfigurationAddFormDto
  ): Observable<IConfigurationAddResponseDto> {
    this.logger.logUserAction('Add Configuration Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SETTINGS.CONFIGURATION.ADD,
        {
          response: ConfigurationAddResponseSchema,
          request: ConfigurationAddRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IConfigurationAddResponseDto) => {
          this.logger.logUserAction('Add Configuration Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Add Configuration Error',
              error
            );
          } else {
            this.logger.logUserAction('Add Configuration Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  editConfiguration(
    formData: IConfigurationEditFormDto,
    configurationId: string
  ): Observable<IConfigurationEditResponseDto> {
    this.logger.logUserAction('Edit Configuration Request');

    return this.apiService
      .patchValidated(
        API_ROUTES.SETTINGS.CONFIGURATION.EDIT(configurationId),
        {
          response: ConfigurationEditResponseSchema,
          request: ConfigurationEditRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(
        tap((response: IConfigurationEditResponseDto) => {
          this.logger.logUserAction('Edit Configuration Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Edit Configuration Error',
              error
            );
          } else {
            this.logger.logUserAction('Edit Configuration Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getConfigurationList(
    params?: IConfigurationGetRequestDto
  ): Observable<IConfigurationGetResponseDto> {
    this.logger.logUserAction('Get Configuration List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SETTINGS.CONFIGURATION.LIST,
        {
          response: ConfigurationGetResponseSchema,
          request: ConfigurationGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IConfigurationGetResponseDto) => {
          this.logger.logUserAction(
            'Get Configuration List Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Configuration List Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Configuration List Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
