import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { catchError, finalize, Observable, of, switchMap } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { LoggerService } from '@core/services';
import { LoadingService, RouterNavigationService } from '@shared/services';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { AnnouncementService } from '../services/announcement.service';
import {
  IAnnouncementDetailGetFormDto,
  IAnnouncementDetailGetResponseDto,
} from '../types/announcement.dto';

@Injectable({
  providedIn: 'root',
})
export class GetAnnouncementDetailResolver
  implements Resolve<IAnnouncementDetailGetResponseDto | null>
{
  private readonly announcementService = inject(AnnouncementService);
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<IAnnouncementDetailGetResponseDto | null> {
    const announcementId = route.paramMap.get('announcementId');

    this.logger.logUserAction(
      'Get Announcement Detail Resolver: Starting resolution',
      { announcementId }
    );

    if (!announcementId) {
      this.logger.logUserAction(
        'Get Announcement Detail Resolver: No announcementId found in route'
      );
      this.navigateToAnnouncementList();
      return of(null);
    }

    this.loadingService.show({
      title: 'Loading Announcement Detail',
      message: 'Please wait while we load the announcement detail...',
    });

    const paramData = this.prepareParamData(announcementId);

    return this.announcementService.getAnnouncementDetailById(paramData).pipe(
      switchMap((response: IAnnouncementDetailGetResponseDto) => {
        this.logger.logUserAction(
          'Get Announcement Detail Resolver: Data resolved successfully',
          response
        );
        return of({
          ...response,
        });
      }),
      finalize(() => {
        this.loadingService.hide();
      }),
      catchError((error: unknown) => {
        this.logger.logUserAction(
          'Get Announcement Detail Resolver: Error resolving data',
          error
        );
        this.navigateToAnnouncementList();
        return of(null);
      })
    );
  }

  private navigateToAnnouncementList(): void {
    const routeSegments = [
      ROUTE_BASE_PATHS.ANNOUNCEMENT,
      ROUTES.ANNOUNCEMENT.LIST,
    ];
    void this.routerNavigationService.navigateToRoute(routeSegments);
  }

  private prepareParamData(
    announcementId: string
  ): IAnnouncementDetailGetFormDto {
    return {
      announcementId,
    };
  }
}
