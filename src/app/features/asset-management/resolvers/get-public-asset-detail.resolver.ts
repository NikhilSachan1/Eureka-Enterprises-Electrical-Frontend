import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { catchError, Observable, of } from 'rxjs';
import { LoggerService } from '@core/services';
import { AssetService } from '../services/asset.service';
import { IAssetDetailGetResponseDto } from '../types/asset.dto';

@Injectable({
  providedIn: 'root',
})
export class GetPublicAssetDetailResolver
  implements Resolve<IAssetDetailGetResponseDto | null>
{
  private readonly assetService = inject(AssetService);
  private readonly logger = inject(LoggerService);

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<IAssetDetailGetResponseDto | null> {
    const assetMasterId = route.paramMap.get('assetMasterId');

    this.logger.logUserAction(
      'Get Public Asset Detail Resolver: Starting resolution',
      { assetMasterId }
    );

    if (!assetMasterId) {
      this.logger.logUserAction(
        'Get Public Asset Detail Resolver: No assetMasterId found in route'
      );
      return of(null);
    }

    return this.assetService.getPublicAssetById(assetMasterId).pipe(
      catchError((error: unknown) => {
        this.logger.logUserAction(
          'Get Public Asset Detail Resolver: Error resolving data',
          error
        );
        return of(null);
      })
    );
  }
}
