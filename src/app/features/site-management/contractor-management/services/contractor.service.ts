import { inject, Injectable } from '@angular/core';
import { ApiService, LoggerService } from '@core/services';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { API_ROUTES } from '@core/constants';
import {
  ContractorAddRequestSchema,
  ContractorAddResponseSchema,
  ContractorChangeStatusRequestSchema,
  ContractorChangeStatusResponseSchema,
  ContractorDeleteRequestSchema,
  ContractorDeleteResponseSchema,
  ContractorDetailGetResponseSchema,
  ContractorEditRequestSchema,
  ContractorEditResponseSchema,
  ContractorGetRequestSchema,
  ContractorGetResponseSchema,
} from '../schemas';
import {
  IContractorAddFormDto,
  IContractorAddResponseDto,
  IContractorChangeStatusFormDto,
  IContractorChangeStatusResponseDto,
  IContractorDeleteFormDto,
  IContractorDeleteResponseDto,
  IContractorDetailGetFormDto,
  IContractorDetailGetResponseDto,
  IContractorEditFormDto,
  IContractorEditResponseDto,
  IContractorGetFormDto,
  IContractorGetResponseDto,
} from '../types/contractor.dto';

@Injectable({
  providedIn: 'root',
})
export class ContractorService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addContractor(
    formData: IContractorAddFormDto
  ): Observable<IContractorAddResponseDto> {
    this.logger.logUserAction('Add Contractor Request');

    return this.apiService
      .postValidated(
        API_ROUTES.SITE.CONTRACTOR.ADD,
        {
          response: ContractorAddResponseSchema,
          request: ContractorAddRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IContractorAddResponseDto) => {
          this.logger.logUserAction('Add Contractor Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Add Contractor Error', error);
          } else {
            this.logger.logUserAction('Add Contractor Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  editContractor(
    formData: IContractorEditFormDto,
    contractorId: string
  ): Observable<IContractorEditResponseDto> {
    this.logger.logUserAction('Edit Contractor Request');

    return this.apiService
      .patchValidated(
        API_ROUTES.SITE.CONTRACTOR.EDIT(contractorId),
        {
          response: ContractorEditResponseSchema,
          request: ContractorEditRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(
        tap((response: IContractorEditResponseDto) => {
          this.logger.logUserAction('Edit Contractor Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Edit Contractor Error', error);
          } else {
            this.logger.logUserAction('Edit Contractor Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  changeContractorStatus(
    formData: IContractorChangeStatusFormDto,
    contractorId: string
  ): Observable<IContractorChangeStatusResponseDto> {
    this.logger.logUserAction('Change Contractor Status Request');

    return this.apiService
      .patchValidated(
        API_ROUTES.SITE.CONTRACTOR.EDIT(contractorId),
        {
          response: ContractorChangeStatusResponseSchema,
          request: ContractorChangeStatusRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(
        tap((response: IContractorChangeStatusResponseDto) => {
          this.logger.logUserAction(
            'Change Contractor Status Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Change Contractor Status Error',
              error
            );
          } else {
            this.logger.logUserAction('Change Contractor Status Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  deleteContractor(
    formData: IContractorDeleteFormDto
  ): Observable<IContractorDeleteResponseDto> {
    this.logger.logUserAction('Delete Contractor Request');

    return this.apiService
      .deleteValidated(
        API_ROUTES.SITE.CONTRACTOR.DELETE,
        {
          response: ContractorDeleteResponseSchema,
          request: ContractorDeleteRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IContractorDeleteResponseDto) => {
          this.logger.logUserAction('Delete Contractor Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Delete Contractor Error',
              error
            );
          } else {
            this.logger.logUserAction('Delete Contractor Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getContractorList(
    params?: IContractorGetFormDto
  ): Observable<IContractorGetResponseDto> {
    this.logger.logUserAction('Get Contractor List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.CONTRACTOR.LIST,
        {
          response: ContractorGetResponseSchema,
          request: ContractorGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IContractorGetResponseDto) => {
          this.logger.logUserAction('Get Contractor List Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Contractor List Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Contractor List Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getContractorDetailById(
    params: IContractorDetailGetFormDto
  ): Observable<IContractorDetailGetResponseDto> {
    this.logger.logUserAction('Get Contractor Detail By Id Request');

    return this.apiService
      .getValidated(
        API_ROUTES.SITE.CONTRACTOR.GET_CONTRACTOR_BY_ID(params.contractorId),
        {
          response: ContractorDetailGetResponseSchema,
        },
        params
      )
      .pipe(
        tap((response: IContractorDetailGetResponseDto) => {
          this.logger.logUserAction(
            'Get Contractor Detail By Id Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Contractor Detail By Id Error',
              error
            );
          } else {
            this.logger.logUserAction(
              'Get Contractor Detail By Id Error',
              error
            );
          }
          return throwError(() => error);
        })
      );
  }
}
