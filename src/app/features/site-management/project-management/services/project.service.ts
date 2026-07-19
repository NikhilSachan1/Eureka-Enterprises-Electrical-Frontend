import { inject, Injectable } from '@angular/core';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { API_ROUTES } from '@core/constants';
import {
  ProjectAddRequestSchema,
  ProjectAddResponseSchema,
  ProjectChangeStatusRequestSchema,
  ProjectChangeStatusResponseSchema,
  ProjectDeleteRequestSchema,
  ProjectDeleteResponseSchema,
  ProjectDetailGetResponseSchema,
  ProjectEditRequestSchema,
  ProjectEditResponseSchema,
  ProjectGetRequestSchema,
  ProjectGetResponseSchema,
  ProjectOverviewGetResponseSchema,
  SiteAllocationGetRequestSchema,
  SiteAllocationGetResponseSchema,
  WorkforceAllocationGetRequestSchema,
  WorkforceAllocationGetResponseSchema,
  WorkforceAllocationActionRequestSchema,
  WorkforceAllocationManageResponseSchema,
} from '../schemas';
import {
  IProjectAddFormDto,
  IProjectAddResponseDto,
  IProjectChangeStatusFormDto,
  IProjectChangeStatusResponseDto,
  IProjectDeleteFormDto,
  IProjectDeleteResponseDto,
  IProjectDetailGetFormDto,
  IProjectDetailGetResponseDto,
  IProjectEditFormDto,
  IProjectEditResponseDto,
  IProjectGetFormDto,
  IProjectGetResponseDto,
  IProjectOverviewGetResponseDto,
  ISiteAllocationGetFormDto,
  ISiteAllocationGetResponseDto,
  IWorkforceAllocationGetFormDto,
  IWorkforceAllocationGetResponseDto,
  IWorkforceAllocationManageFormDto,
  IWorkforceAllocationManageResponseDto,
} from '../types/project.dto';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addProject(formData: IProjectAddFormDto): Observable<IProjectAddResponseDto> {
    this.logger.logUserAction('Add Project Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.PROJECT.ADD,
        {
          response: ProjectAddResponseSchema,
          request: ProjectAddRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IProjectAddResponseDto) => {
          this.logger.logUserAction('Add Project Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Add Project Error', error);
          } else {
            this.logger.logUserAction('Add Project Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  editProject(
    formData: IProjectEditFormDto,
    projectId: string
  ): Observable<IProjectEditResponseDto> {
    this.logger.logUserAction('Edit Project Request');

    return this.apiService
      .patchValidated(
        API_ROUTES.SITE.PROJECT.EDIT(projectId),
        {
          response: ProjectEditResponseSchema,
          request: ProjectEditRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IProjectEditResponseDto) => {
          this.logger.logUserAction('Edit Project Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Edit Project Error', error);
          } else {
            this.logger.logUserAction('Edit Project Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  manageWorkforceAllocation(
    formData: IWorkforceAllocationManageFormDto
  ): Observable<IWorkforceAllocationManageResponseDto> {
    this.logger.logUserAction('Manage workforce allocation request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.PROJECT.ALLOCATE_DEALLOCATE_EMPLOYEES,
        {
          response: WorkforceAllocationManageResponseSchema,
          request: WorkforceAllocationActionRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IWorkforceAllocationManageResponseDto) => {
          this.logger.logUserAction(
            'Manage workforce allocation response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Manage workforce allocation error',
              error
            );
          } else {
            this.logger.logUserAction(
              'Manage workforce allocation error',
              error
            );
          }
          return throwError(() => error);
        })
      );
  }

  changeProjectStatus(
    formData: IProjectChangeStatusFormDto,
    projectId: string
  ): Observable<IProjectChangeStatusResponseDto> {
    this.logger.logUserAction('Change Project Status Request');

    return this.apiService
      .patchValidated(
        API_ROUTES.SITE.PROJECT.CHANGE_STATUS(projectId),
        {
          response: ProjectChangeStatusResponseSchema,
          request: ProjectChangeStatusRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IProjectChangeStatusResponseDto) => {
          this.logger.logUserAction('Change Project Status Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Change Project Status Error',
              error
            );
          } else {
            this.logger.logUserAction('Change Project Status Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  deleteProject(
    formData: IProjectDeleteFormDto
  ): Observable<IProjectDeleteResponseDto> {
    this.logger.logUserAction('Delete Project Request');

    return this.apiService
      .deleteValidated(
        API_ROUTES.SITE.PROJECT.DELETE,
        {
          response: ProjectDeleteResponseSchema,
          request: ProjectDeleteRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IProjectDeleteResponseDto) => {
          this.logger.logUserAction('Delete Project Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Delete Project Error', error);
          } else {
            this.logger.logUserAction('Delete Project Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getProjectList(
    params?: IProjectGetFormDto
  ): Observable<IProjectGetResponseDto> {
    this.logger.logUserAction('Get Project List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.PROJECT.LIST,
        {
          response: ProjectGetResponseSchema,
          request: ProjectGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IProjectGetResponseDto) => {
          this.logger.logUserAction('Get Project List Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Get Project List Error', error);
          } else {
            this.logger.logUserAction('Get Project List Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getSiteAllocationHistory(
    params?: ISiteAllocationGetFormDto
  ): Observable<ISiteAllocationGetResponseDto> {
    this.logger.logUserAction('Get site allocation history request');

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.PROJECT.ALLOCATION_HISTORY,
        {
          response: SiteAllocationGetResponseSchema,
          request: SiteAllocationGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: ISiteAllocationGetResponseDto) => {
          this.logger.logUserAction(
            'Get site allocation history response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get site allocation history error',
              error
            );
          } else {
            this.logger.logUserAction(
              'Get site allocation history error',
              error
            );
          }
          return throwError(() => error);
        })
      );
  }

  getWorkforceAllocationEmployees(
    params?: IWorkforceAllocationGetFormDto
  ): Observable<IWorkforceAllocationGetResponseDto> {
    this.logger.logUserAction('Get workforce allocation employees request');

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.PROJECT.WORKFORCE_ALLOCATION_EMPLOYEES,
        {
          response: WorkforceAllocationGetResponseSchema,
          request: WorkforceAllocationGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IWorkforceAllocationGetResponseDto) => {
          this.logger.logUserAction(
            'Get workforce allocation employees response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get workforce allocation employees error',
              error
            );
          } else {
            this.logger.logUserAction(
              'Get workforce allocation employees error',
              error
            );
          }
          return throwError(() => error);
        })
      );
  }

  getProjectOverview(
    projectId: string
  ): Observable<IProjectOverviewGetResponseDto> {
    this.logger.logUserAction('Get Project Overview Request');

    return this.apiService
      .getValidated(API_ROUTES.SITE.PROJECT.GET_PROJECT_OVERVIEW(projectId), {
        response: ProjectOverviewGetResponseSchema,
      })
      .pipe(
        tap((response: IProjectOverviewGetResponseDto) => {
          this.logger.logUserAction('Get Project Overview Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Project Overview Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Project Overview Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getProjectDetailById(
    params: IProjectDetailGetFormDto
  ): Observable<IProjectDetailGetResponseDto> {
    this.logger.logUserAction('Get Project Detail By Id Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.PROJECT.GET_PROJECT_BY_ID(params.projectId),
        {
          response: ProjectDetailGetResponseSchema,
        },
        params
      )
      .pipe(
        tap((response: IProjectDetailGetResponseDto) => {
          this.logger.logUserAction(
            'Get Project Detail By Id Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Project Detail By Id Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Project Detail By Id Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
