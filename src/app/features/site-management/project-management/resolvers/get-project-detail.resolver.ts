import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { catchError, finalize, Observable, of, switchMap } from 'rxjs';
import { inject, Injectable } from '@angular/core';
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
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<IProjectDetailGetResponseDto | null> {
    const projectId = route.paramMap.get('projectId');

    if (!projectId) {
      this.navigateToProjectList();
      return of(null);
    }

    this.loadingService.show({
      title: 'Loading Project Detail',
      message: 'Please wait while we load the project detail...',
    });

    const paramData = this.prepareParamData(projectId);

    return this.projectService.getProjectDetailById(paramData).pipe(
      switchMap((response: IProjectDetailGetResponseDto) =>
        of({ ...response })
      ),
      finalize(() => {
        this.loadingService.hide();
      }),
      catchError(() => {
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
