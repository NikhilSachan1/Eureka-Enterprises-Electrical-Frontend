import { inject, Injectable } from '@angular/core';
import { ApiService, LoggerService } from '@core/services';
import {
  IActionAssetRequestDto,
  IActionAssetResponseDto,
  IAssetAddRequestDto,
  IAssetAddResponseDto,
  IAssetDeleteRequestDto,
  IAssetDeleteResponseDto,
  IAssetDetailGetRequestDto,
  IAssetDetailGetResponseDto,
  IAssetEditRequestDto,
  IAssetEditResponseDto,
  IAssetGetRequestDto,
  IAssetGetResponseDto,
} from '../types/asset.dto';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { API_ROUTES } from '@core/constants';
import {
  ActionAssetRequestSchema,
  ActionAssetResponseSchema,
  AssetAddRequestSchema,
  AssetAddResponseSchema,
  AssetDeleteResponseSchema,
  AssetDetailGetResponseSchema,
  AssetEditRequestSchema,
  AssetEditResponseSchema,
  AssetGetRequestSchema,
  AssetGetResponseSchema,
} from '../schemas';

@Injectable({
  providedIn: 'root',
})
export class AssetService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addAsset(formData: IAssetAddRequestDto): Observable<IAssetAddResponseDto> {
    this.logger.logUserAction('Add Asset Request');

    return this.apiService
      .postValidated(
        API_ROUTES.ASSET.ADD,
        formData,
        AssetAddRequestSchema,
        AssetAddResponseSchema,
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
    formData: IAssetEditRequestDto,
    assetId: string
  ): Observable<IAssetEditResponseDto> {
    this.logger.logUserAction('Edit Asset Request');

    return this.apiService
      .patchValidated(
        API_ROUTES.ASSET.EDIT(assetId),
        formData,
        AssetEditRequestSchema,
        AssetEditResponseSchema,
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
    formData: IAssetDeleteRequestDto
  ): Observable<IAssetDeleteResponseDto> {
    this.logger.logUserAction('Delete Asset Request');

    return this.apiService
      .deleteValidated(
        API_ROUTES.ASSET.DELETE_ASSET_BY_ID(formData.id),
        AssetDeleteResponseSchema
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
    formData: IActionAssetRequestDto
  ): Observable<IActionAssetResponseDto> {
    this.logger.logUserAction('Action Asset Request');

    return this.apiService
      .postValidated(
        API_ROUTES.ASSET.ACTION,
        formData,
        ActionAssetRequestSchema,
        ActionAssetResponseSchema,
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

  getAssetList(params?: IAssetGetRequestDto): Observable<IAssetGetResponseDto> {
    this.logger.logUserAction('Get Asset List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.ASSET.LIST,
        AssetGetResponseSchema,
        params,
        AssetGetRequestSchema
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
    params: IAssetDetailGetRequestDto
  ): Observable<IAssetDetailGetResponseDto> {
    this.logger.logUserAction('Get Asset Detail By Id Request');

    return this.apiService
      .getValidated(
        API_ROUTES.ASSET.GET_ASSET_BY_ID(params.id),
        AssetDetailGetResponseSchema
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
}
