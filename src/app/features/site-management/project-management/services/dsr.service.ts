import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services';
import { catchError, Observable, throwError } from 'rxjs';
import { API_ROUTES } from '@core/constants';
import {
  DsrAddRequestSchema,
  DsrAddResponseSchema,
  DsrDeleteResponseSchema,
  DsrDetailGetResponseSchema,
  DsrEditRequestSchema,
  DsrEditResponseSchema,
  DsrGetRequestSchema,
  DsrGetResponseSchema,
} from '../schemas';
import {
  IDsrAddFormDto,
  IDsrAddResponseDto,
  IDsrDeleteResponseDto,
  IDsrDetailGetFormDto,
  IDsrDetailGetResponseDto,
  IDsrEditFormDto,
  IDsrEditResponseDto,
  IDsrGetFormDto,
  IDsrGetResponseDto,
} from '../types/project.dto';

@Injectable({
  providedIn: 'root',
})
export class DsrService {
  private readonly apiService = inject(ApiService);

  addDsr(formData: IDsrAddFormDto): Observable<IDsrAddResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.SITE.DSR.ADD,
        {
          response: DsrAddResponseSchema,
          request: DsrAddRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  editDsr(
    formData: IDsrEditFormDto,
    dsrId: string
  ): Observable<IDsrEditResponseDto> {
    return this.apiService
      .patchValidated(
        API_ROUTES.SITE.DSR.EDIT(dsrId),
        {
          response: DsrEditResponseSchema,
          request: DsrEditRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  deleteDsr(dsrId: string): Observable<IDsrDeleteResponseDto> {
    return this.apiService
      .deleteValidated(API_ROUTES.SITE.DSR.DELETE(dsrId), {
        response: DsrDeleteResponseSchema,
      })
      .pipe(catchError(error => throwError(() => error)));
  }

  getDSRList(params?: IDsrGetFormDto): Observable<IDsrGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.SITE.DSR.LIST,
        {
          response: DsrGetResponseSchema,
          request: DsrGetRequestSchema,
        },
        params
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getDsrDetailById(
    params: IDsrDetailGetFormDto
  ): Observable<IDsrDetailGetResponseDto> {
    return this.apiService
      .getValidated(API_ROUTES.SITE.DSR.GET_DSR_BY_ID(params.dsrId), {
        response: DsrDetailGetResponseSchema,
      })
      .pipe(catchError(error => throwError(() => error)));
  }
}
