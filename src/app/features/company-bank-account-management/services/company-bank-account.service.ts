import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  CompanyBankAccountAddRequestSchema,
  CompanyBankAccountAddResponseSchema,
  CompanyBankAccountChangeStatusRequestSchema,
  CompanyBankAccountChangeStatusResponseSchema,
  CompanyBankAccountDeleteResponseSchema,
  CompanyBankAccountEditRequestSchema,
  CompanyBankAccountEditResponseSchema,
  CompanyBankAccountGetRequestSchema,
  CompanyBankAccountGetResponseSchema,
} from '../schemas';
import {
  ICompanyBankAccountAddFormDto,
  ICompanyBankAccountAddResponseDto,
  ICompanyBankAccountChangeStatusFormDto,
  ICompanyBankAccountChangeStatusResponseDto,
  ICompanyBankAccountDeleteResponseDto,
  ICompanyBankAccountEditFormDto,
  ICompanyBankAccountEditResponseDto,
  ICompanyBankAccountGetFormDto,
  ICompanyBankAccountGetResponseDto,
} from '../types/company-bank-account.dto';

@Injectable({
  providedIn: 'root',
})
export class CompanyBankAccountService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addCompanyBankAccount(
    formData: ICompanyBankAccountAddFormDto
  ): Observable<ICompanyBankAccountAddResponseDto> {
    this.logger.logUserAction('Add Company Bank Account Request');

    return this.apiService
      .postValidated(
        API_ROUTES.COMPANY_BANK_ACCOUNT.ADD,
        {
          response: CompanyBankAccountAddResponseSchema,
          request: CompanyBankAccountAddRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: ICompanyBankAccountAddResponseDto) => {
          this.logger.logUserAction(
            'Add Company Bank Account Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Add Company Bank Account Error',
              error
            );
          } else {
            this.logger.logUserAction('Add Company Bank Account Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  editCompanyBankAccount(
    formData: ICompanyBankAccountEditFormDto,
    companyBankAccountId: string
  ): Observable<ICompanyBankAccountEditResponseDto> {
    this.logger.logUserAction('Edit Company Bank Account Request');

    return this.apiService
      .patchValidated(
        API_ROUTES.COMPANY_BANK_ACCOUNT.EDIT(companyBankAccountId),
        {
          response: CompanyBankAccountEditResponseSchema,
          request: CompanyBankAccountEditRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: ICompanyBankAccountEditResponseDto) => {
          this.logger.logUserAction(
            'Edit Company Bank Account Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Edit Company Bank Account Error',
              error
            );
          } else {
            this.logger.logUserAction('Edit Company Bank Account Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  changeCompanyBankAccountStatus(
    formData: ICompanyBankAccountChangeStatusFormDto,
    companyBankAccountId: string
  ): Observable<ICompanyBankAccountChangeStatusResponseDto> {
    this.logger.logUserAction('Change Company Bank Account Status Request');

    return this.apiService
      .patchValidated(
        API_ROUTES.COMPANY_BANK_ACCOUNT.EDIT(companyBankAccountId),
        {
          response: CompanyBankAccountChangeStatusResponseSchema,
          request: CompanyBankAccountChangeStatusRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: ICompanyBankAccountChangeStatusResponseDto) => {
          this.logger.logUserAction(
            'Change Company Bank Account Status Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Change Company Bank Account Status Error',
              error
            );
          } else {
            this.logger.logUserAction(
              'Change Company Bank Account Status Error',
              error
            );
          }
          return throwError(() => error);
        })
      );
  }

  deleteCompanyBankAccount(
    companyBankAccountId: string
  ): Observable<ICompanyBankAccountDeleteResponseDto> {
    this.logger.logUserAction('Delete Company Bank Account Request', {
      companyBankAccountId,
    });

    return this.apiService
      .deleteValidated(
        API_ROUTES.COMPANY_BANK_ACCOUNT.DELETE(companyBankAccountId),
        {
          response: CompanyBankAccountDeleteResponseSchema,
        }
      )
      .pipe(
        tap((response: ICompanyBankAccountDeleteResponseDto) => {
          this.logger.logUserAction(
            'Delete Company Bank Account Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Delete Company Bank Account Error',
              error
            );
          } else {
            this.logger.logUserAction(
              'Delete Company Bank Account Error',
              error
            );
          }
          return throwError(() => error);
        })
      );
  }

  getCompanyBankAccountList(
    params?: ICompanyBankAccountGetFormDto
  ): Observable<ICompanyBankAccountGetResponseDto> {
    this.logger.logUserAction('Get Company Bank Account List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.COMPANY_BANK_ACCOUNT.LIST,
        {
          response: CompanyBankAccountGetResponseSchema,
          request: CompanyBankAccountGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: ICompanyBankAccountGetResponseDto) => {
          this.logger.logUserAction(
            'Get Company Bank Account List Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Company Bank Account List Error',
              error
            );
          } else {
            this.logger.logUserAction(
              'Get Company Bank Account List Error',
              error
            );
          }
          return throwError(() => error);
        })
      );
  }
}
