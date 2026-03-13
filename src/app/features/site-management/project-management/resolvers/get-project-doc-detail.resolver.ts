import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { catchError, finalize, Observable, of, switchMap } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import {
  AttachmentsService,
  LoadingService,
  RouterNavigationService,
} from '@shared/services';
import { ROUTE_BASE_PATHS } from '@shared/constants';
import { ProjectDocService } from '../services/project-doc.service';
import type { ISiteDocumentDetailGetResponseDto } from '../types/project.dto';

export interface IProjectDocDetailResolverResponse
  extends ISiteDocumentDetailGetResponseDto {
  preloadedFiles?: File[];
}

@Injectable({
  providedIn: 'root',
})
export class GetProjectDocDetailResolver
  implements Resolve<IProjectDocDetailResolverResponse | null>
{
  private readonly projectDocService = inject(ProjectDocService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly loadingService = inject(LoadingService);
  private readonly attachmentsService = inject(AttachmentsService);

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<IProjectDocDetailResolverResponse | null> {
    const id = route.paramMap.get('id');

    if (!id) {
      this.navigateBack();
      return of(null);
    }

    this.loadingService.show({
      title: 'Loading Document',
      message: 'Please wait...',
    });

    return this.projectDocService.getById(id).pipe(
      switchMap((response: ISiteDocumentDetailGetResponseDto) => {
        const keys = response.documentKeys ?? [];
        if (keys.length === 0) {
          return of({ ...response, preloadedFiles: [] });
        }
        return this.attachmentsService
          .loadFilesFromKeys(keys)
          .pipe(switchMap(files => of({ ...response, preloadedFiles: files })));
      }),
      finalize(() => this.loadingService.hide()),
      catchError(() => {
        this.navigateBack();
        return of(null);
      })
    );
  }

  private navigateBack(): void {
    const routeSegments = [
      ROUTE_BASE_PATHS.SITE.BASE,
      ROUTE_BASE_PATHS.SITE.PROJECT,
    ];
    void this.routerNavigationService.navigateToRoute(routeSegments);
  }
}
