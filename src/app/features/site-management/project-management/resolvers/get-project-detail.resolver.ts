import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { catchError, finalize, Observable, of, switchMap } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { LoggerService } from '@core/services';
import { LoadingService, RouterNavigationService } from '@shared/services';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { ProjectService } from '../services/project.service';
import {
  IProjectDetailGetFormDto,
  IProjectDetailGetResponseDto,
} from '../types/project.dto';

@Injectable({
  providedIn: 'root',
})
export class GetProjectDetailResolver
  implements Resolve<IProjectDetailGetResponseDto | null>
{
  private readonly projectService = inject(ProjectService);
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<IProjectDetailGetResponseDto | null> {
    const projectId = route.paramMap.get('projectId');

    this.logger.logUserAction(
      'Get Project Detail Resolver: Starting resolution',
      { projectId }
    );

    if (!projectId) {
      this.logger.logUserAction(
        'Get Project Detail Resolver: No projectId found in route'
      );
      this.navigateToProjectList();
      return of(null);
    }

    this.loadingService.show({
      title: 'Loading Project Detail',
      message:
        "We're loading the project detail. This will just take a moment.",
    });

    const paramData = this.prepareParamData(projectId);

    return this.projectService.getProjectDetailById(paramData).pipe(
      switchMap((response: IProjectDetailGetResponseDto) => {
        this.logger.logUserAction(
          'Get Project Detail Resolver: Data resolved successfully',
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
          'Get Project Detail Resolver: Error resolving data',
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

  private prepareParamData(projectId: string): IProjectDetailGetFormDto {
    return {
      projectId,
    };
  }
}
