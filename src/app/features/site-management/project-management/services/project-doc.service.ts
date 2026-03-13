import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services';
import { API_ROUTES } from '@core/constants';
import { catchError, Observable, throwError } from 'rxjs';
import {
  SiteDocumentAddRequestSchema,
  SiteDocumentAddResponseSchema,
  SiteDocumentDeleteResponseSchema,
  SiteDocumentDetailGetResponseSchema,
  SiteDocumentEditRequestSchema,
  SiteDocumentEditResponseSchema,
  SiteDocumentGetResponseSchema,
} from '../schemas';
import type {
  ISiteDocumentAddFormDto,
  ISiteDocumentAddResponseDto,
  ISiteDocumentDeleteResponseDto,
  ISiteDocumentDetailGetResponseDto,
  ISiteDocumentEditFormDto,
  ISiteDocumentEditResponseDto,
  ISiteDocumentGetResponseDto,
} from '../types/project.dto';

@Injectable({
  providedIn: 'root',
})
export class ProjectDocService {
  private readonly apiService = inject(ApiService);

  addDocument(
    formData: ISiteDocumentAddFormDto
  ): Observable<ISiteDocumentAddResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.SITE.SITE_DOCUMENT.ADD,
        {
          response: SiteDocumentAddResponseSchema,
          request: SiteDocumentAddRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getList(siteId?: string): Observable<ISiteDocumentGetResponseDto> {
    const endpoint = siteId
      ? API_ROUTES.SITE.SITE_DOCUMENT.GET_BY_SITE(siteId)
      : API_ROUTES.SITE.SITE_DOCUMENT.LIST;
    return this.apiService
      .getValidated(endpoint, {
        response: SiteDocumentGetResponseSchema,
      })
      .pipe(catchError(error => throwError(() => error)));
  }

  getById(id: string): Observable<ISiteDocumentDetailGetResponseDto> {
    return this.apiService
      .getValidated(API_ROUTES.SITE.SITE_DOCUMENT.GET_BY_ID(id), {
        response: SiteDocumentDetailGetResponseSchema,
      })
      .pipe(catchError(error => throwError(() => error)));
  }

  edit(
    id: string,
    formData: ISiteDocumentEditFormDto
  ): Observable<ISiteDocumentEditResponseDto> {
    return this.apiService
      .patchValidated(
        API_ROUTES.SITE.SITE_DOCUMENT.EDIT(id),
        {
          response: SiteDocumentEditResponseSchema,
          request: SiteDocumentEditRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  delete(id: string): Observable<ISiteDocumentDeleteResponseDto> {
    return this.apiService
      .deleteValidated(API_ROUTES.SITE.SITE_DOCUMENT.DELETE(id), {
        response: SiteDocumentDeleteResponseSchema,
      })
      .pipe(catchError(error => throwError(() => error)));
  }
}
