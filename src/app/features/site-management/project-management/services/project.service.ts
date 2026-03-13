import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services';
import { catchError, Observable, throwError } from 'rxjs';
import { API_ROUTES } from '@core/constants';
import {
  ManageAllocationsRequestSchema,
  ManageAllocationsResponseSchema,
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
  ProjectTimelineGetResponseSchema,
  ProjectProfitabilityGetResponseSchema,
} from '../schemas';
import {
  IManageAllocationsFormDto,
  IManageAllocationsResponseDto,
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
  IProjectTimelineGetResponseDto,
  IProjectProfitabilityGetResponseDto,
} from '../types/project.dto';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly apiService = inject(ApiService);

  addProject(formData: IProjectAddFormDto): Observable<IProjectAddResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.SITE.PROJECT.ADD,
        {
          response: ProjectAddResponseSchema,
          request: ProjectAddRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  editProject(
    formData: IProjectEditFormDto,
    projectId: string
  ): Observable<IProjectEditResponseDto> {
    return this.apiService
      .patchValidated(
        API_ROUTES.SITE.PROJECT.EDIT(projectId),
        {
          response: ProjectEditResponseSchema,
          request: ProjectEditRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  changeProjectStatus(
    formData: IProjectChangeStatusFormDto,
    projectId: string
  ): Observable<IProjectChangeStatusResponseDto> {
    return this.apiService
      .patchValidated(
        API_ROUTES.SITE.PROJECT.CHANGE_STATUS(projectId),
        {
          response: ProjectChangeStatusResponseSchema,
          request: ProjectChangeStatusRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  manageAllocations(
    formData: IManageAllocationsFormDto
  ): Observable<IManageAllocationsResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.SITE.PROJECT.MANAGE_ALLOCATIONS,
        {
          response: ManageAllocationsResponseSchema,
          request: ManageAllocationsRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  deleteProject(
    formData: IProjectDeleteFormDto
  ): Observable<IProjectDeleteResponseDto> {
    return this.apiService
      .deleteValidated(
        API_ROUTES.SITE.PROJECT.DELETE,
        {
          response: ProjectDeleteResponseSchema,
          request: ProjectDeleteRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getProjectList(
    params?: IProjectGetFormDto
  ): Observable<IProjectGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.SITE.PROJECT.LIST,
        {
          response: ProjectGetResponseSchema,
          request: ProjectGetRequestSchema,
        },
        params
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getProjectDetailById(
    params: IProjectDetailGetFormDto
  ): Observable<IProjectDetailGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.SITE.PROJECT.GET_PROJECT_BY_ID(params.projectId),
        {
          response: ProjectDetailGetResponseSchema,
        },
        params
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getProjectTimeline(
    siteId: string
  ): Observable<IProjectTimelineGetResponseDto> {
    return this.apiService
      .getValidated(API_ROUTES.SITE.PROJECT.TIMELINE(siteId), {
        response: ProjectTimelineGetResponseSchema,
      })
      .pipe(catchError(error => throwError(() => error)));
  }

  getProjectProfitability(
    siteId: string
  ): Observable<IProjectProfitabilityGetResponseDto> {
    return this.apiService
      .getValidated(API_ROUTES.SITE.PROJECT.PROFITABILITY(siteId), {
        response: ProjectProfitabilityGetResponseSchema,
      })
      .pipe(catchError(error => throwError(() => error)));
  }
}
