import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { LoggerService } from '@core/services/logger.service';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  IEmployeeAddRequestDto,
  IEmployeeAddResponseDto,
  IEmployeeGetRequestDto,
  IEmployeeGetResponseDto,
} from '../types/employee.dto';
import { API_ROUTES } from '@core/constants/api.constants';
import {
  EmployeeAddRequestSchema,
  EmployeeAddResponseSchema,
  EmployeeGetRequestSchema,
  EmployeeGetResponseSchema,
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
}
