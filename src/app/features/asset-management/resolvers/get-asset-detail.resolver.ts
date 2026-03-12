import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { AssetService } from '../services/asset.service';
import {
  IAssetDetailGetFormDto,
  IAssetDetailGetResponseDto,
} from '../types/asset.dto';
import {
  AttachmentsService,
  LoadingService,
  RouterNavigationService,
} from '@shared/services';
import { catchError, finalize, Observable, of, switchMap } from 'rxjs';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { IAssetDetailResolverResponse } from '../types/asset.interface';

@Injectable({
  providedIn: 'root',
})
export class GetAssetDetailResolver
  implements Resolve<IAssetDetailResolverResponse | null>
{
  private readonly assetService = inject(AssetService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);
  private readonly attachmentsService = inject(AttachmentsService);

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<IAssetDetailResolverResponse | null> {
    const assetId = route.paramMap.get('assetId');

    if (!assetId) {
      this.navigateToAssetList();
      return of(null);
    }

    this.loadingService.show({
      title: 'Loading Asset Detail',
      message: 'Please wait while we load the asset detail...',
    });

    const paramData = this.prepareParamData(assetId);

    return this.assetService.getAssetDetailById(paramData).pipe(
      switchMap((response: IAssetDetailGetResponseDto) => {
        const latestHistoryItem =
          response.versionHistory[response.versionHistory.length - 1];
        const fileKeys = latestHistoryItem?.documentKeys || [];

        return this.attachmentsService.loadFilesFromKeys(fileKeys).pipe(
          switchMap(files => {
            return of({
              ...response,
              preloadedFiles: files,
            });
          })
        );
      }),
      finalize(() => {
        this.loadingService.hide();
      }),
      catchError(() => {
        this.navigateToAssetList();
        return of(null);
      })
    );
  }

  private navigateToAssetList(): void {
    const routeSegments = [ROUTE_BASE_PATHS.ASSET, ROUTES.ASSET.LIST];
    void this.routerNavigationService.navigateToRoute(routeSegments);
  }

  private prepareParamData(assetId: string): IAssetDetailGetFormDto {
    return {
      assetId,
    };
  }
}
