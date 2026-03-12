import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { catchError, Observable, throwError } from 'rxjs';
import {
  IEmployeeAddFormDto,
  IEmployeeAddResponseDto,
  IEmployeeChangeStatusFormDto,
  IEmployeeChangeStatusResponseDto,
  IEmployeeDeleteFormDto,
  IEmployeeDeleteResponseDto,
  IEmployeeDetailGetRequestDto,
  IEmployeeDetailGetResponseDto,
  IEmployeeEditFormDto,
  IEmployeeEditResponseDto,
  IEmployeeGetNextEmployeeIdResponseDto,
  IEmployeeGetRequestDto,
  IEmployeeGetResponseDto,
  IEmployeeSendPasswordLinkFormDto,
  IEmployeeSendPasswordLinkResponseDto,
} from '../types/employee.dto';
import { API_ROUTES } from '@core/constants/api.constants';
import {
  EmployeeAddRequestSchema,
  EmployeeAddResponseSchema,
  EmployeeChangeStatusRequestSchema,
  EmployeeChangeStatusResponseSchema,
  EmployeeDeleteRequestSchema,
  EmployeeDeleteResponseSchema,
  EmployeeDetailGetResponseSchema,
  EmployeeEditRequestSchema,
  EmployeeEditResponseSchema,
  EmployeeGetNextEmployeeIdResponseSchema,
  EmployeeGetRequestSchema,
  EmployeeGetResponseSchema,
  EmployeeSendPasswordLinkRequestSchema,
  EmployeeSendPasswordLinkResponseSchema,
} from '../schemas';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private readonly apiService = inject(ApiService);

  addEmployee(
    formData: IEmployeeAddFormDto
  ): Observable<IEmployeeAddResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.EMPLOYEE.ADD,
        {
          response: EmployeeAddResponseSchema,
          request: EmployeeAddRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  editEmployee(
    formData: IEmployeeEditFormDto,
    employeeId: string
  ): Observable<IEmployeeEditResponseDto> {
    return this.apiService
      .patchValidated(
        API_ROUTES.EMPLOYEE.EDIT(employeeId),
        {
          response: EmployeeEditResponseSchema,
          request: EmployeeEditRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  changeEmployeeStatus(
    formData: IEmployeeChangeStatusFormDto,
    employeeId: string
  ): Observable<IEmployeeChangeStatusResponseDto> {
    return this.apiService
      .patchValidated(
        API_ROUTES.EMPLOYEE.EDIT(employeeId),
        {
          response: EmployeeChangeStatusResponseSchema,
          request: EmployeeChangeStatusRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  deleteEmployee(
    formData: IEmployeeDeleteFormDto
  ): Observable<IEmployeeDeleteResponseDto> {
    return this.apiService
      .deleteValidated(
        API_ROUTES.EMPLOYEE.DELETE,
        {
          response: EmployeeDeleteResponseSchema,
          request: EmployeeDeleteRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getEmployeeList(
    params?: IEmployeeGetRequestDto
  ): Observable<IEmployeeGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.EMPLOYEE.LIST,
        {
          response: EmployeeGetResponseSchema,
          request: EmployeeGetRequestSchema,
        },
        params
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getEmployeeDetailById(
    params: IEmployeeDetailGetRequestDto
  ): Observable<IEmployeeDetailGetResponseDto> {
    return this.apiService
      .getValidated(API_ROUTES.EMPLOYEE.GET_EMPLOYEE_BY_ID(params.id), {
        response: EmployeeDetailGetResponseSchema,
      })
      .pipe(catchError(error => throwError(() => error)));
  }

  getEmployeeProfile(): Observable<IEmployeeDetailGetResponseDto> {
    return this.apiService
      .getValidated(API_ROUTES.EMPLOYEE.GET_EMPLOYEE_PROFILE, {
        response: EmployeeDetailGetResponseSchema,
      })
      .pipe(catchError(error => throwError(() => error)));
  }

  getNextEmployeeId(): Observable<IEmployeeGetNextEmployeeIdResponseDto> {
    return this.apiService
      .getValidated(API_ROUTES.EMPLOYEE.GET_NEXT_EMPLOYEE_ID, {
        response: EmployeeGetNextEmployeeIdResponseSchema,
      })
      .pipe(catchError(error => throwError(() => error)));
  }

  sendPasswordLink(
    formData: IEmployeeSendPasswordLinkFormDto
  ): Observable<IEmployeeSendPasswordLinkResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.EMPLOYEE.SEND_PASSWORD_LINK,
        {
          response: EmployeeSendPasswordLinkResponseSchema,
          request: EmployeeSendPasswordLinkRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }
}
