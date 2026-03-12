import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services';
import { catchError, Observable, throwError } from 'rxjs';
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
  private readonly apiService = inject(ApiService);

  addContractor(
    formData: IContractorAddFormDto
  ): Observable<IContractorAddResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.SITE.CONTRACTOR.ADD,
        {
          response: ContractorAddResponseSchema,
          request: ContractorAddRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  editContractor(
    formData: IContractorEditFormDto,
    contractorId: string
  ): Observable<IContractorEditResponseDto> {
    return this.apiService
      .patchValidated(
        API_ROUTES.SITE.CONTRACTOR.EDIT(contractorId),
        {
          response: ContractorEditResponseSchema,
          request: ContractorEditRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  changeContractorStatus(
    formData: IContractorChangeStatusFormDto,
    contractorId: string
  ): Observable<IContractorChangeStatusResponseDto> {
    return this.apiService
      .patchValidated(
        API_ROUTES.SITE.CONTRACTOR.EDIT(contractorId),
        {
          response: ContractorChangeStatusResponseSchema,
          request: ContractorChangeStatusRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  deleteContractor(
    formData: IContractorDeleteFormDto
  ): Observable<IContractorDeleteResponseDto> {
    return this.apiService
      .deleteValidated(
        API_ROUTES.SITE.CONTRACTOR.DELETE,
        {
          response: ContractorDeleteResponseSchema,
          request: ContractorDeleteRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getContractorList(
    params?: IContractorGetFormDto
  ): Observable<IContractorGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.SITE.CONTRACTOR.LIST,
        {
          response: ContractorGetResponseSchema,
          request: ContractorGetRequestSchema,
        },
        params
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getContractorDetailById(
    params: IContractorDetailGetFormDto
  ): Observable<IContractorDetailGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.SITE.CONTRACTOR.GET_CONTRACTOR_BY_ID(params.contractorId),
        {
          response: ContractorDetailGetResponseSchema,
        },
        params
      )
      .pipe(catchError(error => throwError(() => error)));
  }
}
