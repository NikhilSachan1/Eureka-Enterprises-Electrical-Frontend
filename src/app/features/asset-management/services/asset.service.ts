import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services';
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
import { catchError, Observable, throwError } from 'rxjs';
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
  private readonly apiService = inject(ApiService);

  addAsset(formData: IAssetAddFormDto): Observable<IAssetAddResponseDto> {
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
      .pipe(catchError(error => throwError(() => error)));
  }

  editAsset(
    formData: IAssetEditFormDto,
    assetId: string
  ): Observable<IAssetEditResponseDto> {
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
      .pipe(catchError(error => throwError(() => error)));
  }

  deleteAsset(
    formData: IAssetDeleteFormDto
  ): Observable<IAssetDeleteResponseDto> {
    return this.apiService
      .deleteValidated(
        API_ROUTES.ASSET.DELETE,
        {
          response: AssetDeleteResponseSchema,
          request: AssetDeleteRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  actionAsset(
    formData: IActionAssetFormDto
  ): Observable<IActionAssetResponseDto> {
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
      .pipe(catchError(error => throwError(() => error)));
  }

  getAssetList(params?: IAssetGetFormDto): Observable<IAssetGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.ASSET.LIST,
        {
          response: AssetGetResponseSchema,
          request: AssetGetRequestSchema,
        },
        params
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getAssetDetailById(
    params: IAssetDetailGetFormDto
  ): Observable<IAssetDetailGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.ASSET.GET_ASSET_BY_ID(params.assetId),
        {
          response: AssetDetailGetResponseSchema,
        },
        params
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getAssetEventHistory(
    params: IAssetEventHistoryGetFormDto,
    assetId: string
  ): Observable<IAssetEventHistoryGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.ASSET.GET_ASSET_EVENT_HISTORY(assetId),
        {
          response: AssetEventHistoryGetResponseSchema,
          request: AssetEventHistoryGetRequestSchema,
        },
        params
      )
      .pipe(catchError(error => throwError(() => error)));
  }
}
