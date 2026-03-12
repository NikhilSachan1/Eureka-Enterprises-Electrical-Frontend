import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { catchError, finalize, Observable, of, switchMap } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { LoggerService } from '@core/services';
import {
  AttachmentsService,
  LoadingService,
  RouterNavigationService,
} from '@shared/services';
import { ROUTE_BASE_PATHS } from '@shared/constants';
import { IDsrDetailResolverResponse } from '../types/project.interface';
import { DsrService } from '../services/dsr.service';
import {
  IDsrDetailGetFormDto,
  IDsrDetailGetResponseDto,
} from '../types/project.dto';

@Injectable({
  providedIn: 'root',
})
export class GetDsrDetailResolver
  implements Resolve<IDsrDetailResolverResponse | null>
{
  private readonly dsrService = inject(DsrService);
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);
  private readonly attachmentsService = inject(AttachmentsService);

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<IDsrDetailResolverResponse | null> {
    const dsrId = route.paramMap.get('dsrId');

    this.logger.logUserAction('Get Dsr Detail Resolver: Starting resolution', {
      dsrId,
    });

    if (!dsrId) {
      this.logger.logUserAction(
        'Get Dsr Detail Resolver: No dsrId found in route'
      );
      this.navigateToDsrList();
      return of(null);
    }

    this.loadingService.show({
      title: 'Loading Dsr Detail',
      message: 'Please wait while we load the dsr detail...',
    });

    const paramData = this.prepareParamData(dsrId);

    return this.dsrService.getDsrDetailById(paramData).pipe(
      switchMap((response: IDsrDetailGetResponseDto) => {
        this.logger.logUserAction(
          'Get Dsr Detail Resolver: Data resolved successfully',
          response
        );

        const fileKeys = response.files ?? [];

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
      catchError((error: unknown) => {
        this.logger.logUserAction(
          'Get Expense Detail Resolver: Error resolving data',
          error
        );
        this.navigateToDsrList();
        return of(null);
      })
    );
  }

  private navigateToDsrList(): void {
    const routeSegments = [
      ROUTE_BASE_PATHS.SITE.BASE,
      ROUTE_BASE_PATHS.SITE.PROJECT,
    ];
    void this.routerNavigationService.navigateToRoute(routeSegments);
  }

  private prepareParamData(dsrId: string): IDsrDetailGetFormDto {
    return {
      dsrId,
    };
  }
}
