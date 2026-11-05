import { inject, Injectable } from '@angular/core';
import { API_ROUTES } from '@core/constants/api.constants';
import { ApiService } from '@core/services/api.service';
import { Observable } from 'rxjs';
import {
  EmployeeChangeStatusRequestSchema,
  EmployeeGetRequestSchema,
} from '@features/employee-management/schemas';
import {
  INonEmployeeAddFormDto,
  INonEmployeeAddResponseDto,
  INonEmployeeDeleteResponseDto,
  INonEmployeeEditFormDto,
  INonEmployeeGetBaseResponseDto,
  INonEmployeeGetResponseDto,
  NonEmployeeAddRequestSchema,
  NonEmployeeAddResponseSchema,
  NonEmployeeBaseResponseSchema,
  NonEmployeeDeleteResponseSchema,
  NonEmployeeEditRequestSchema,
  NonEmployeeGetResponseSchema,
} from '../schemas/non-employee.schema';
import {
  IEmployeeChangeStatusFormDto,
  IEmployeeGetFormDto,
} from '@features/employee-management/types/employee.dto';

/** Talks to the /system-users API. The UI calls these users "Non Employee". */
@Injectable({
  providedIn: 'root',
})
export class NonEmployeeService {
  private readonly apiService = inject(ApiService);

  getNonEmployeeList(
    params?: IEmployeeGetFormDto
  ): Observable<INonEmployeeGetResponseDto> {
    return this.apiService.getValidated(
      API_ROUTES.SYSTEM_USER.LIST,
      {
        response: NonEmployeeGetResponseSchema,
        request: EmployeeGetRequestSchema,
      },
      params
    );
  }

  getNonEmployeeById(id: string): Observable<INonEmployeeGetBaseResponseDto> {
    return this.apiService.getValidated(API_ROUTES.SYSTEM_USER.BY_ID(id), {
      response: NonEmployeeBaseResponseSchema,
    });
  }

  addNonEmployee(
    formData: INonEmployeeAddFormDto
  ): Observable<INonEmployeeAddResponseDto> {
    return this.apiService.postValidated(
      API_ROUTES.SYSTEM_USER.LIST,
      {
        response: NonEmployeeAddResponseSchema,
        request: NonEmployeeAddRequestSchema,
      },
      formData,
      { multipart: true }
    );
  }

  editNonEmployee(
    formData: INonEmployeeEditFormDto,
    id: string
  ): Observable<INonEmployeeGetBaseResponseDto> {
    return this.apiService.patchValidated(
      API_ROUTES.SYSTEM_USER.BY_ID(id),
      {
        response: NonEmployeeBaseResponseSchema,
        request: NonEmployeeEditRequestSchema,
      },
      formData,
      { multipart: true }
    );
  }

  changeNonEmployeeStatus(
    formData: IEmployeeChangeStatusFormDto,
    id: string
  ): Observable<INonEmployeeGetBaseResponseDto> {
    return this.apiService.patchValidated(
      API_ROUTES.SYSTEM_USER.BY_ID(id),
      {
        response: NonEmployeeBaseResponseSchema,
        request: EmployeeChangeStatusRequestSchema,
      },
      formData,
      { multipart: true }
    );
  }

  deleteNonEmployee(id: string): Observable<INonEmployeeDeleteResponseDto> {
    return this.apiService.deleteValidated(API_ROUTES.SYSTEM_USER.BY_ID(id), {
      response: NonEmployeeDeleteResponseSchema,
    });
  }
}
