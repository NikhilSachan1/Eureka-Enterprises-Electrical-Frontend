import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { LoggerService } from '@core/services/logger.service';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  IEmployeeAddRequestDto,
  IEmployeeAddResponseDto,
  IEmployeeChangeStatusRequestDto,
  IEmployeeChangeStatusResponseDto,
  IEmployeeDeleteRequestDto,
  IEmployeeDeleteResponseDto,
  IEmployeeDetailGetRequestDto,
  IEmployeeDetailGetResponseDto,
  IEmployeeEditRequestDto,
  IEmployeeEditResponseDto,
  IEmployeeGetNextEmployeeIdResponseDto,
  IEmployeeGetRequestDto,
  IEmployeeGetResponseDto,
  IEmployeeSendPasswordLinkRequestDto,
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
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addEmployee(
    formData: IEmployeeAddRequestDto
  ): Observable<IEmployeeAddResponseDto> {
    this.logger.logUserAction('Add Employee Request');

    return this.apiService
      .postValidated(
        API_ROUTES.EMPLOYEE.ADD,
        formData,
        EmployeeAddRequestSchema,
        EmployeeAddResponseSchema,
        { multipart: true }
      )
      .pipe(
        tap((response: IEmployeeAddResponseDto) => {
          this.logger.logUserAction('Add Employee Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Add Employee Error', error);
          } else {
            this.logger.logUserAction('Add Employee Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  editEmployee(
    formData: IEmployeeEditRequestDto,
    employeeId: string
  ): Observable<IEmployeeEditResponseDto> {
    this.logger.logUserAction('Edit Employee Request');

    return this.apiService
      .patchValidated(
        API_ROUTES.EMPLOYEE.EDIT(employeeId),
        formData,
        EmployeeEditRequestSchema,
        EmployeeEditResponseSchema,
        { multipart: true }
      )
      .pipe(
        tap((response: IEmployeeEditResponseDto) => {
          this.logger.logUserAction('Edit Employee Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Edit Employee Error', error);
          } else {
            this.logger.logUserAction('Edit Employee Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  changeEmployeeStatus(
    formData: IEmployeeChangeStatusRequestDto,
    employeeId: string
  ): Observable<IEmployeeChangeStatusResponseDto> {
    this.logger.logUserAction('Change Employee Status Request');

    return this.apiService
      .patchValidated(
        API_ROUTES.EMPLOYEE.EDIT(employeeId),
        formData,
        EmployeeChangeStatusRequestSchema,
        EmployeeChangeStatusResponseSchema,
        { multipart: true }
      )
      .pipe(
        tap((response: IEmployeeChangeStatusResponseDto) => {
          this.logger.logUserAction(
            'Change Employee Status Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Change Employee Status Error',
              error
            );
          } else {
            this.logger.logUserAction('Change Employee Status Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  deleteEmployee(
    formData: IEmployeeDeleteRequestDto
  ): Observable<IEmployeeDeleteResponseDto> {
    this.logger.logUserAction('Delete Employee Request');

    return this.apiService
      .deleteValidated(
        API_ROUTES.EMPLOYEE.DELETE,
        EmployeeDeleteResponseSchema,
        formData,
        EmployeeDeleteRequestSchema
      )
      .pipe(
        tap((response: IEmployeeDeleteResponseDto) => {
          this.logger.logUserAction('Delete Employee Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Delete Employee Error', error);
          } else {
            this.logger.logUserAction('Delete Employee Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getEmployeeList(
    params?: IEmployeeGetRequestDto
  ): Observable<IEmployeeGetResponseDto> {
    this.logger.logUserAction('Get Employee List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.EMPLOYEE.LIST,
        EmployeeGetResponseSchema,
        params,
        EmployeeGetRequestSchema
      )
      .pipe(
        tap((response: IEmployeeGetResponseDto) => {
          this.logger.logUserAction('Get Employee List Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Employee List Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Employee List Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getEmployeeDetailById(
    params: IEmployeeDetailGetRequestDto
  ): Observable<IEmployeeDetailGetResponseDto> {
    this.logger.logUserAction('Get Employee Detail By Id Request');

    return this.apiService
      .getValidated(
        API_ROUTES.EMPLOYEE.GET_EMPLOYEE_BY_ID(params.id),
        EmployeeDetailGetResponseSchema
      )
      .pipe(
        tap((response: IEmployeeDetailGetResponseDto) => {
          this.logger.logUserAction(
            'Get Employee Detail By Id Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Employee Detail By Id Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Employee Detail By Id Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getEmployeeProfile(): Observable<IEmployeeDetailGetResponseDto> {
    this.logger.logUserAction('Get Employee Profile Request');

    return this.apiService
      .getValidated(
        API_ROUTES.EMPLOYEE.GET_EMPLOYEE_PROFILE,
        EmployeeDetailGetResponseSchema
      )
      .pipe(
        tap((response: IEmployeeDetailGetResponseDto) => {
          this.logger.logUserAction('Get Employee Profile Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Employee Profile Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Employee Profile Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getNextEmployeeId(): Observable<IEmployeeGetNextEmployeeIdResponseDto> {
    this.logger.logUserAction('Get Next Employee Id Request');

    return this.apiService
      .getValidated(
        API_ROUTES.EMPLOYEE.GET_NEXT_EMPLOYEE_ID,
        EmployeeGetNextEmployeeIdResponseSchema
      )
      .pipe(
        tap((response: IEmployeeGetNextEmployeeIdResponseDto) => {
          this.logger.logUserAction('Get Next Employee Id Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Next Employee Id Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Next Employee Id Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  sendPasswordLink(
    formData: IEmployeeSendPasswordLinkRequestDto
  ): Observable<IEmployeeSendPasswordLinkResponseDto> {
    this.logger.logUserAction('Send Password Link Request');

    return this.apiService
      .postValidated(
        API_ROUTES.EMPLOYEE.SEND_PASSWORD_LINK,
        formData,
        EmployeeSendPasswordLinkRequestSchema,
        EmployeeSendPasswordLinkResponseSchema
      )
      .pipe(
        tap((response: IEmployeeSendPasswordLinkResponseDto) => {
          this.logger.logUserAction('Send Password Link Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Send Password Link Error',
              error
            );
          } else {
            this.logger.logUserAction('Send Password Link Error', error);
          }
          return throwError(() => error);
        })
      );
  }
}
