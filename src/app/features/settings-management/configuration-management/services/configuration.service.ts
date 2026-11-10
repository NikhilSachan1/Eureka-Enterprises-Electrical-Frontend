import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { LoggerService } from '@core/services/logger.service';
import {
  catchError,
  MonoTypeOperatorFunction,
  Observable,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import {
  IConfigSettingAddFormDto,
  IConfigSettingEditFormDto,
  IConfigSettingUpsertResponseDto,
  IConfigurationAddFormDto,
  IConfigurationAddResponseDto,
  IConfigurationDeleteResponseDto,
  IConfigurationDetailGetFormDto,
  IConfigurationDetailGetResponseDto,
  IConfigurationEditFormDto,
  IConfigurationEditResponseDto,
  IConfigurationGetFormDto,
  IConfigurationGetResponseDto,
} from '../types/configuration.dto';
import { API_ROUTES } from '@core/constants/api.constants';
import {
  ConfigSettingAddRequestSchema,
  ConfigSettingEditRequestSchema,
  ConfigSettingUpsertResponseSchema,
  ConfigurationAddRequestSchema,
  ConfigurationAddResponseSchema,
  ConfigurationDeleteResponseSchema,
  ConfigurationDetailGetResponseSchema,
  ConfigurationEditRequestSchema,
  ConfigurationEditResponseSchema,
  ConfigurationGetRequestSchema,
  ConfigurationGetResponseSchema,
} from '../schemas';

export interface IConfigurationUpdatePayload {
  configurationId: string;
  /** Setting being edited; `null` creates the first setting for the configuration. */
  configSettingId: string | null;
  metadata: IConfigurationEditFormDto;
  setting: IConfigSettingEditFormDto;
}

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
        formData,
        // Keep empty arrays/objects/strings inside the config value intact.
        { skipClean: true }
      )
      .pipe(this.logResult('Add Configuration'));
  }

  /**
   * Updates configuration metadata, then the setting that holds its value.
   * Metadata goes first so a changed valueType is in place before the backend
   * validates the new value against it.
   */
  updateConfiguration({
    configurationId,
    configSettingId,
    metadata,
    setting,
  }: IConfigurationUpdatePayload): Observable<IConfigSettingUpsertResponseDto> {
    return this.editConfiguration(metadata, configurationId).pipe(
      switchMap(() =>
        configSettingId
          ? this.editConfigSetting(setting, configSettingId)
          : this.addConfigSetting({ ...setting, configurationId })
      )
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
        formData
      )
      .pipe(this.logResult('Edit Configuration'));
  }

  editConfigSetting(
    formData: IConfigSettingEditFormDto,
    configSettingId: string
  ): Observable<IConfigSettingUpsertResponseDto> {
    this.logger.logUserAction('Edit Config Setting Request');

    return this.apiService
      .patchValidated(
        API_ROUTES.SETTINGS.CONFIGURATION.SETTING.EDIT(configSettingId),
        {
          response: ConfigSettingUpsertResponseSchema,
          request: ConfigSettingEditRequestSchema,
        },
        formData,
        { skipClean: true }
      )
      .pipe(this.logResult('Edit Config Setting'));
  }

  addConfigSetting(
    formData: IConfigSettingAddFormDto
  ): Observable<IConfigSettingUpsertResponseDto> {
    this.logger.logUserAction('Add Config Setting Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SETTINGS.CONFIGURATION.SETTING.ADD,
        {
          response: ConfigSettingUpsertResponseSchema,
          request: ConfigSettingAddRequestSchema,
        },
        formData,
        { skipClean: true }
      )
      .pipe(this.logResult('Add Config Setting'));
  }

  deleteConfiguration(
    configurationId: string
  ): Observable<IConfigurationDeleteResponseDto> {
    this.logger.logUserAction('Delete Configuration Request', {
      configurationId,
    });

    return this.apiService
      .deleteValidated(
        API_ROUTES.SETTINGS.CONFIGURATION.DELETE(configurationId),
        {
          response: ConfigurationDeleteResponseSchema,
        }
      )
      .pipe(this.logResult('Delete Configuration'));
  }

  getConfigurationList(
    params?: IConfigurationGetFormDto
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
      .pipe(this.logResult('Get Configuration List'));
  }

  getConfigurationDetailById(
    params: IConfigurationDetailGetFormDto
  ): Observable<IConfigurationDetailGetResponseDto> {
    this.logger.logUserAction('Get Configuration Detail By Id Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SETTINGS.CONFIGURATION.GET_CONFIGURATION_BY_ID(
          params.configurationId
        ),
        {
          response: ConfigurationDetailGetResponseSchema,
        }
      )
      .pipe(this.logResult('Get Configuration Detail By Id'));
  }

  private logResult<T>(action: string): MonoTypeOperatorFunction<T> {
    return source =>
      source.pipe(
        tap(response => {
          this.logger.logUserAction(`${action} Response`, response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(`${action} Error`, error);
          } else {
            this.logger.logUserAction(`${action} Error`, error);
          }
          return throwError(() => error);
        })
      );
  }
}
