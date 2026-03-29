import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, catchError, finalize, of, tap } from 'rxjs';
import { LoggerService } from '@core/services/logger.service';
import { LoadingService, RouterNavigationService } from '@shared/services';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants/route.constants';
import {
  IConfigurationDetailGetFormDto,
  IConfigurationDetailGetResponseDto,
} from '../types/configuration.dto';
import { ConfigurationService } from '../services/configuration.service';

@Injectable({
  providedIn: 'root',
})
export class GetConfigurationDetailResolver
  implements Resolve<IConfigurationDetailGetResponseDto | null>
{
  private readonly configurationService = inject(ConfigurationService);
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<IConfigurationDetailGetResponseDto | null> {
    const configurationId = route.paramMap.get('configurationId');

    this.logger.logUserAction(
      'Get Configuration Detail Resolver: Starting resolution'
    );

    if (!configurationId) {
      this.logger.logUserAction(
        'Get Configuration Detail Resolver: No configurationId found in route'
      );
      this.navigateToList();
      return of(null);
    }

    this.loadingService.show({
      title: 'Loading Configuration Detail',
      message: 'Please wait while we load the configuration detail...',
    });

    const paramData = this.prepareParamData(configurationId);

    return this.configurationService.getConfigurationDetailById(paramData).pipe(
      tap((response: IConfigurationDetailGetResponseDto) => {
        this.logger.logUserAction(
          'Get Configuration Detail Resolver: Data resolved successfully',
          response
        );
      }),
      finalize(() => {
        this.loadingService.hide();
      }),
      catchError((error: unknown) => {
        this.logger.logUserAction(
          'Get Configuration Detail Resolver: Error resolving data',
          error
        );
        this.navigateToList();
        return of(null);
      })
    );
  }

  private prepareParamData(
    configurationId: string
  ): IConfigurationDetailGetFormDto {
    return {
      configurationId,
    };
  }

  private navigateToList(): void {
    const routeSegments = [
      ROUTE_BASE_PATHS.SETTINGS.BASE,
      ROUTE_BASE_PATHS.SETTINGS.CONFIGURATION.BASE,
      ROUTES.SETTINGS.CONFIGURATION.LIST,
    ];
    void this.routerNavigationService.navigateToRoute(routeSegments);
  }
}
