import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  IProjectTimelineGetFormDto,
  IProjectTimelineGetResponseDto,
} from '../types/project-timeline.dto';
import { ProjectTimelineGetResponseSchema } from '../schemas/get-project-timeline.schema';

@Injectable({
  providedIn: 'root',
})
export class ProjectTimelineService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  getProjectTimeline(
    params: IProjectTimelineGetFormDto
  ): Observable<IProjectTimelineGetResponseDto> {
    this.logger.logUserAction('Get Project Timeline Request');

    return this.apiService
      .getValidated(API_ROUTES.SITE.TIMELINE.GET(params.projectName), {
        response: ProjectTimelineGetResponseSchema,
      })
      .pipe(
        tap((response: IProjectTimelineGetResponseDto) => {
          this.logger.logUserAction('Get Project Timeline Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Project Timeline Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Project Timeline Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
