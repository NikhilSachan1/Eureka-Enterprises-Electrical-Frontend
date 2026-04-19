import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { catchError, finalize, Observable, of, switchMap } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { LoggerService } from '@core/services';
import {
  AttachmentsService,
  LoadingService,
  RouterNavigationService,
} from '@shared/services';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import {
  IDsrDetailGetFormDto,
  IDsrDetailGetResponseDto,
} from '../types/dsr.dto';
import { DsrService } from '@features/site-management/dsr-management/services/dsr.service';
import { IDsrDetailResolverResponse } from '../types/dsr.interface';

@Injectable({
  providedIn: 'root',
})
export class GetDsrDetailResolver
  implements Resolve<IDsrDetailResolverResponse | null>
{
  private readonly dsrService = inject(DsrService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<IDsrDetailResolverResponse | null> {
    const dsrId = route.paramMap.get('dsrId');

    this.logger.logUserAction('Get DSR Detail Resolver: Starting resolution', {
      dsrId,
    });

    if (!dsrId) {
      this.logger.logUserAction(
        'Get DSR Detail Resolver: No dsrId found in route'
      );
      this.navigateToProjectList();
      return of(null);
    }

    this.loadingService.show({
      title: 'Loading DSR Detail',
      message: "We're loading the DSR detail. This will just take a moment.",
    });

    const paramData = this.prepareParamData(dsrId);

    return this.dsrService.getDsrDetailById(paramData).pipe(
      switchMap((response: IDsrDetailGetResponseDto) => {
        this.logger.logUserAction(
          'Get DSR Detail Resolver: Data resolved successfully',
          response
        );

        return this.attachmentsService
          .loadFilesFromKeys(response.documentKeys)
          .pipe(
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
      catchError((error: unknown) => {
        this.logger.logUserAction(
          'Get DSR Detail Resolver: Error resolving data',
          error
        );
        this.navigateToProjectList();
        return of(null);
      })
    );
  }

  private navigateToProjectList(): void {
    const routeSegments = [
      ROUTE_BASE_PATHS.SITE.BASE,
      ROUTE_BASE_PATHS.SITE.PROJECT,
      ROUTES.SITE.PROJECT.LIST,
    ];
    void this.routerNavigationService.navigateToRoute(routeSegments);
  }

  private prepareParamData(dsrId: string): IDsrDetailGetFormDto {
    return {
      dsrId,
    };
  }
}
