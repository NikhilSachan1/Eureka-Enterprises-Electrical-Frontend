import { inject, Injectable } from '@angular/core';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
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
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addCompany(formData: ICompanyAddFormDto): Observable<ICompanyAddResponseDto> {
    this.logger.logUserAction('Add Company Request');

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
      .pipe(
        tap((response: ICompanyAddResponseDto) => {
          this.logger.logUserAction('Add Company Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Add Company Error', error);
          } else {
            this.logger.logUserAction('Add Company Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  editCompany(
    formData: ICompanyEditFormDto,
    companyId: string
  ): Observable<ICompanyEditResponseDto> {
    this.logger.logUserAction('Edit Company Request');

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
      .pipe(
        tap((response: ICompanyEditResponseDto) => {
          this.logger.logUserAction('Edit Company Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Edit Company Error', error);
          } else {
            this.logger.logUserAction('Edit Company Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  changeCompanyStatus(
    formData: ICompanyChangeStatusFormDto,
    companyId: string
  ): Observable<ICompanyChangeStatusResponseDto> {
    this.logger.logUserAction('Change Company Status Request');

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
      .pipe(
        tap((response: ICompanyChangeStatusResponseDto) => {
          this.logger.logUserAction('Change Company Status Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Change Company Status Error',
              error
            );
          } else {
            this.logger.logUserAction('Change Company Status Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  deleteCompany(
    formData: ICompanyDeleteFormDto
  ): Observable<ICompanyDeleteResponseDto> {
    this.logger.logUserAction('Delete Company Request');

    return this.apiService
      .deleteValidated(
        API_ROUTES.SITE.COMPANY.DELETE,
        {
          response: CompanyDeleteResponseSchema,
          request: CompanyDeleteRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: ICompanyDeleteResponseDto) => {
          this.logger.logUserAction('Delete Company Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Delete Company Error', error);
          } else {
            this.logger.logUserAction('Delete Company Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getCompanyList(
    params?: ICompanyGetFormDto
  ): Observable<ICompanyGetResponseDto> {
    this.logger.logUserAction('Get Company List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.COMPANY.LIST,
        {
          response: CompanyGetResponseSchema,
          request: CompanyGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: ICompanyGetResponseDto) => {
          this.logger.logUserAction('Get Company List Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Get Company List Error', error);
          } else {
            this.logger.logUserAction('Get Company List Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getCompanyDetailById(
    params: ICompanyDetailGetFormDto
  ): Observable<ICompanyDetailGetResponseDto> {
    this.logger.logUserAction('Get Company Detail By Id Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.COMPANY.GET_COMPANY_BY_ID(params.companyId),
        {
          response: CompanyDetailGetResponseSchema,
        },
        params
      )
      .pipe(
        tap((response: ICompanyDetailGetResponseDto) => {
          this.logger.logUserAction(
            'Get Company Detail By Id Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Company Detail By Id Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Company Detail By Id Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
