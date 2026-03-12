import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services';
import { catchError, Observable, throwError } from 'rxjs';
import { API_ROUTES } from '@core/constants';
import {
  CompanyAddRequestSchema,
  CompanyAddResponseSchema,
  CompanyChangeStatusRequestSchema,
  CompanyChangeStatusResponseSchema,
  CompanyDeleteRequestSchema,
  CompanyDeleteResponseSchema,
  CompanyDetailGetResponseSchema,
  CompanyEditRequestSchema,
  CompanyEditResponseSchema,
  CompanyGetRequestSchema,
  CompanyGetResponseSchema,
} from '../schemas';
import {
  ICompanyAddFormDto,
  ICompanyAddResponseDto,
  ICompanyChangeStatusFormDto,
  ICompanyChangeStatusResponseDto,
  ICompanyDeleteFormDto,
  ICompanyDeleteResponseDto,
  ICompanyDetailGetFormDto,
  ICompanyDetailGetResponseDto,
  ICompanyEditFormDto,
  ICompanyEditResponseDto,
  ICompanyGetFormDto,
  ICompanyGetResponseDto,
} from '../types/company.dto';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private readonly apiService = inject(ApiService);

  addCompany(formData: ICompanyAddFormDto): Observable<ICompanyAddResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.SITE.COMPANY.ADD,
        {
          response: CompanyAddResponseSchema,
          request: CompanyAddRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  editCompany(
    formData: ICompanyEditFormDto,
    companyId: string
  ): Observable<ICompanyEditResponseDto> {
    return this.apiService
      .patchValidated(
        API_ROUTES.SITE.COMPANY.EDIT(companyId),
        {
          response: CompanyEditResponseSchema,
          request: CompanyEditRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  changeCompanyStatus(
    formData: ICompanyChangeStatusFormDto,
    companyId: string
  ): Observable<ICompanyChangeStatusResponseDto> {
    return this.apiService
      .patchValidated(
        API_ROUTES.SITE.COMPANY.EDIT(companyId),
        {
          response: CompanyChangeStatusResponseSchema,
          request: CompanyChangeStatusRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  deleteCompany(
    formData: ICompanyDeleteFormDto
  ): Observable<ICompanyDeleteResponseDto> {
    return this.apiService
      .deleteValidated(
        API_ROUTES.SITE.COMPANY.DELETE,
        {
          response: CompanyDeleteResponseSchema,
          request: CompanyDeleteRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getCompanyList(
    params?: ICompanyGetFormDto
  ): Observable<ICompanyGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.SITE.COMPANY.LIST,
        {
          response: CompanyGetResponseSchema,
          request: CompanyGetRequestSchema,
        },
        params
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getCompanyDetailById(
    params: ICompanyDetailGetFormDto
  ): Observable<ICompanyDetailGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.SITE.COMPANY.GET_COMPANY_BY_ID(params.companyId),
        {
          response: CompanyDetailGetResponseSchema,
        },
        params
      )
      .pipe(catchError(error => throwError(() => error)));
  }
}
