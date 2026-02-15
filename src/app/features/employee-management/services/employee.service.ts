import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { LoggerService } from '@core/services/logger.service';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  IEmployeeAddFormDto,
  IEmployeeAddResponseDto,
  IEmployeeChangeRoleFormDto,
  IEmployeeChangeRoleResponseDto,
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
  EmployeeChangeRoleRequestSchema,
  EmployeeChangeRoleResponseSchema,
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
    formData: IEmployeeAddFormDto
  ): Observable<IEmployeeAddResponseDto> {
    this.logger.logUserAction('Add Employee Request');

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
    formData: IEmployeeEditFormDto,
    employeeId: string
  ): Observable<IEmployeeEditResponseDto> {
    this.logger.logUserAction('Edit Employee Request');

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
    formData: IEmployeeChangeStatusFormDto,
    employeeId: string
  ): Observable<IEmployeeChangeStatusResponseDto> {
    this.logger.logUserAction('Change Employee Status Request');

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

  changeEmployeeRole(
    formData: IEmployeeChangeRoleFormDto,
    employeeId: string
  ): Observable<IEmployeeChangeRoleResponseDto> {
    this.logger.logUserAction('Change Employee Role Request');

    return this.apiService
      .patchValidated(
        API_ROUTES.EMPLOYEE.EDIT(employeeId),
        {
          response: EmployeeChangeRoleResponseSchema,
          request: EmployeeChangeRoleRequestSchema,
        },
        formData,
        { multipart: true }
      )
      .pipe(
        tap((response: IEmployeeChangeRoleResponseDto) => {
          this.logger.logUserAction('Change Employee Role Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Change Employee Role Error',
              error
            );
          } else {
            this.logger.logUserAction('Change Employee Role Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  deleteEmployee(
    formData: IEmployeeDeleteFormDto
  ): Observable<IEmployeeDeleteResponseDto> {
    this.logger.logUserAction('Delete Employee Request');

    return this.apiService
      .deleteValidated(
        API_ROUTES.EMPLOYEE.DELETE,
        {
          response: EmployeeDeleteResponseSchema,
          request: EmployeeDeleteRequestSchema,
        },
        formData
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
        {
          response: EmployeeGetResponseSchema,
          request: EmployeeGetRequestSchema,
        },
        params
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
      .getValidated(API_ROUTES.EMPLOYEE.GET_EMPLOYEE_BY_ID(params.id), {
        response: EmployeeDetailGetResponseSchema,
      })
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
      .getValidated(API_ROUTES.EMPLOYEE.GET_EMPLOYEE_PROFILE, {
        response: EmployeeDetailGetResponseSchema,
      })
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
      .getValidated(API_ROUTES.EMPLOYEE.GET_NEXT_EMPLOYEE_ID, {
        response: EmployeeGetNextEmployeeIdResponseSchema,
      })
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
    formData: IEmployeeSendPasswordLinkFormDto
  ): Observable<IEmployeeSendPasswordLinkResponseDto> {
    this.logger.logUserAction('Send Password Link Request');

    return this.apiService
      .postValidated(
        API_ROUTES.EMPLOYEE.SEND_PASSWORD_LINK,
        {
          response: EmployeeSendPasswordLinkResponseSchema,
          request: EmployeeSendPasswordLinkRequestSchema,
        },
        formData
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
