import { inject, Injectable } from '@angular/core';
import { ApiService, LoggerService } from '@core/services';
import {
  IActionAssetFormDto,
  IActionAssetResponseDto,
  IAssetAddFormDto,
  IAssetAddResponseDto,
  IAssetDeleteFormDto,
  IAssetDeleteResponseDto,
  IAssetDetailGetFormDto,
  IAssetDetailGetResponseDto,
  IAssetEditFormDto,
  IAssetEditResponseDto,
  IAssetEventHistoryGetFormDto,
  IAssetEventHistoryGetResponseDto,
  IAssetGetFormDto,
  IAssetGetResponseDto,
} from '../types/asset.dto';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { API_ROUTES } from '@core/constants';
import {
  ActionAssetRequestSchema,
  ActionAssetResponseSchema,
  AssetAddRequestSchema,
  AssetAddResponseSchema,
  AssetDeleteRequestSchema,
  AssetDeleteResponseSchema,
  AssetDetailGetResponseSchema,
  AssetEditRequestSchema,
  AssetEditResponseSchema,
  AssetEventHistoryGetRequestSchema,
  AssetEventHistoryGetResponseSchema,
  AssetGetRequestSchema,
  AssetGetResponseSchema,
} from '../schemas';

@Injectable({
  providedIn: 'root',
})
export class AssetService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addAsset(formData: IAssetAddFormDto): Observable<IAssetAddResponseDto> {
    this.logger.logUserAction('Add Asset Request');

    return this.apiService
      .postValidated(
        API_ROUTES.ASSET.ADD,
        {
          response: AssetAddResponseSchema,
          request: AssetAddRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(
        tap((response: IAssetAddResponseDto) => {
          this.logger.logUserAction('Add Asset Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Add Asset Error', error);
          } else {
            this.logger.logUserAction('Add Asset Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  editAsset(
    formData: IAssetEditFormDto,
    assetId: string
  ): Observable<IAssetEditResponseDto> {
    this.logger.logUserAction('Edit Asset Request');

    return this.apiService
      .patchValidated(
        API_ROUTES.ASSET.EDIT(assetId),
        {
          response: AssetEditResponseSchema,
          request: AssetEditRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(
        tap((response: IAssetEditResponseDto) => {
          this.logger.logUserAction('Edit Asset Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Edit Asset Error', error);
          } else {
            this.logger.logUserAction('Edit Asset Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  deleteAsset(
    formData: IAssetDeleteFormDto
  ): Observable<IAssetDeleteResponseDto> {
    this.logger.logUserAction('Delete Asset Request');

    return this.apiService
      .deleteValidated(
        API_ROUTES.ASSET.DELETE,
        {
          response: AssetDeleteResponseSchema,
          request: AssetDeleteRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IAssetDeleteResponseDto) => {
          this.logger.logUserAction('Delete Asset Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Delete Asset Error', error);
          } else {
            this.logger.logUserAction('Delete Asset Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  actionAsset(
    formData: IActionAssetFormDto
  ): Observable<IActionAssetResponseDto> {
    this.logger.logUserAction('Action Asset Request');

    return this.apiService
      .postValidated(
        API_ROUTES.ASSET.ACTION,
        {
          response: ActionAssetResponseSchema,
          request: ActionAssetRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(
        tap((response: IActionAssetResponseDto) => {
          this.logger.logUserAction('Action Asset Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Action Asset Error', error);
          } else {
            this.logger.logUserAction('Action Asset Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getAssetList(params?: IAssetGetFormDto): Observable<IAssetGetResponseDto> {
    this.logger.logUserAction('Get Asset List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.ASSET.LIST,
        {
          response: AssetGetResponseSchema,
          request: AssetGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IAssetGetResponseDto) => {
          this.logger.logUserAction('Get Asset List Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Get Asset List Error', error);
          } else {
            this.logger.logUserAction('Get Asset List Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getAssetDetailById(
    params: IAssetDetailGetFormDto
  ): Observable<IAssetDetailGetResponseDto> {
    this.logger.logUserAction('Get Asset Detail By Id Request');

    return this.apiService
      .getValidated(
        API_ROUTES.ASSET.GET_ASSET_BY_ID(params.assetId),
        {
          response: AssetDetailGetResponseSchema,
        },
        params
      )
      .pipe(
        tap((response: IAssetDetailGetResponseDto) => {
          this.logger.logUserAction(
            'Get Asset Detail By Id Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Asset Detail By Id Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Asset Detail By Id Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getAssetEventHistory(
    params: IAssetEventHistoryGetFormDto,
    assetId: string
  ): Observable<IAssetEventHistoryGetResponseDto> {
    this.logger.logUserAction('Get Asset Event History Request');

    return this.apiService
      .getValidated(
        API_ROUTES.ASSET.GET_ASSET_EVENT_HISTORY(assetId),
        {
          response: AssetEventHistoryGetResponseSchema,
          request: AssetEventHistoryGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IAssetEventHistoryGetResponseDto) => {
          this.logger.logUserAction(
            'Get Asset Event History Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Asset Event History Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Asset Event History Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
