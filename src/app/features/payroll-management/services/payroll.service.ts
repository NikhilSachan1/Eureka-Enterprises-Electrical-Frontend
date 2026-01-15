import { inject, Injectable } from '@angular/core';
import { ApiService, LoggerService } from '@core/services';
import {
  ISalaryIncrementAddResponseDto,
  ISalaryStructureGetFormDto,
  ISalaryStructureGetResponseDto,
  ISalaryStructureHistoryGetResponseDto,
  ISalaryIncrementAddFormDto,
  ISalaryEditFormDto,
  ISalaryEditResponseDto,
  IPayslipGetFormDto,
  IPayslipGetResponseDto,
  IActionPayrollFormDto,
  IActionPayrollResponseDto,
  IGeneratePayrollFormDto,
  IGeneratePayrollResponseDto,
  IPayslipDetailGetResponseDto,
} from '../types/payroll.dto';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { API_ROUTES } from '@core/constants';
import {
  ActionPayrollRequestSchema,
  ActionPayrollResponseSchema,
  GeneratePayrollRequestSchema,
  GeneratePayrollResponseSchema,
  PayslipDetailGetResponseSchema,
  PayslipGetRequestSchema,
  PayslipGetResponseSchema,
  SalaryEditRequestSchema,
  SalaryEditResponseSchema,
  SalaryIncrementAddRequestSchema,
  SalaryIncrementAddResponseSchema,
  SalaryStructureGetRequestSchema,
  SalaryStructureGetResponseSchema,
} from '../schemas';
import { SalaryStructureHistoryGetResponseSchema } from '../schemas/get-salary-change-history.schema';

@Injectable({
  providedIn: 'root',
})
export class PayrollService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  addSalaryIncrement(
    formData: ISalaryIncrementAddFormDto
  ): Observable<ISalaryIncrementAddResponseDto> {
    this.logger.logUserAction('Add Salary Increment Request');

    return this.apiService
      .postValidated(
        API_ROUTES.PAYROLL.ADD_SALARY_INCREMENT,
        {
          response: SalaryIncrementAddResponseSchema,
          request: SalaryIncrementAddRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: ISalaryIncrementAddResponseDto) => {
          this.logger.logUserAction('Add Salary Increment Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Add Salary Increment Error',
              error
            );
          } else {
            this.logger.logUserAction('Add Salary Increment Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  editSalary(
    formData: ISalaryEditFormDto,
    salaryStructureId: string
  ): Observable<ISalaryEditResponseDto> {
    this.logger.logUserAction('Edit Salary Request');

    return this.apiService
      .patchValidated(
        API_ROUTES.PAYROLL.EDIT(salaryStructureId),
        {
          response: SalaryEditResponseSchema,
          request: SalaryEditRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: ISalaryEditResponseDto) => {
          this.logger.logUserAction('Edit Salary Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Edit Salary Error', error);
          } else {
            this.logger.logUserAction('Edit Salary Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  actionPayroll(
    formData: IActionPayrollFormDto
  ): Observable<IActionPayrollResponseDto> {
    this.logger.logUserAction('Action Payroll Request');

    return this.apiService
      .postValidated(
        API_ROUTES.PAYROLL.ACTION,
        {
          response: ActionPayrollResponseSchema,
          request: ActionPayrollRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IActionPayrollResponseDto) => {
          this.logger.logUserAction('Action Payroll Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Action Payroll Error', error);
          } else {
            this.logger.logUserAction('Action Payroll Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  cancelPayroll(
    formData: IActionPayrollFormDto
  ): Observable<IActionPayrollResponseDto> {
    this.logger.logUserAction('Cancel Payroll Request');

    return this.apiService
      .postValidated(
        API_ROUTES.PAYROLL.CANCEL,
        {
          response: ActionPayrollResponseSchema,
          request: ActionPayrollRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IActionPayrollResponseDto) => {
          this.logger.logUserAction('Cancel Payroll Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Cancel Payroll Error', error);
          } else {
            this.logger.logUserAction('Cancel Payroll Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  generatePayroll(
    formData: IGeneratePayrollFormDto
  ): Observable<IGeneratePayrollResponseDto> {
    this.logger.logUserAction('Generate Payroll Request');

    return this.apiService
      .postValidated(
        API_ROUTES.PAYROLL.GENERATE,
        {
          response: GeneratePayrollResponseSchema,
          request: GeneratePayrollRequestSchema,
        },
        formData
      )
      .pipe(
        tap((response: IGeneratePayrollResponseDto) => {
          this.logger.logUserAction('Generate Payroll Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Generate Payroll Error', error);
          } else {
            this.logger.logUserAction('Generate Payroll Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getSalaryStructureList(
    params?: ISalaryStructureGetFormDto
  ): Observable<ISalaryStructureGetResponseDto> {
    this.logger.logUserAction('Get Salary Structure List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.PAYROLL.STRUCTURE,
        {
          response: SalaryStructureGetResponseSchema,
          request: SalaryStructureGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: ISalaryStructureGetResponseDto) => {
          this.logger.logUserAction(
            'Get Salary Structure List Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Salary Structure List Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Salary Structure List Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getSalaryStructureHistory(
    salaryStructureId: string
  ): Observable<ISalaryStructureHistoryGetResponseDto> {
    this.logger.logUserAction('Get Salary Structure History Request');

    return this.apiService
      .getValidated(
        API_ROUTES.PAYROLL.GET_STRUCTURE_HISTORY(salaryStructureId),
        {
          response: SalaryStructureHistoryGetResponseSchema,
        }
      )
      .pipe(
        tap((response: ISalaryStructureHistoryGetResponseDto) => {
          this.logger.logUserAction(
            'Get Salary Structure History Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Salary Structure History Error',
              error
            );
          } else {
            this.logger.logUserAction(
              'Get Salary Structure History Error',
              error
            );
          }
          return throwError(() => error);
        })
      );
  }

  getPayslipList(
    params?: IPayslipGetFormDto
  ): Observable<IPayslipGetResponseDto> {
    this.logger.logUserAction('Get Payslip List Request');

    return this.apiService
      .getValidated(
        API_ROUTES.PAYROLL.GET_PAYSLIP_LIST,
        {
          response: PayslipGetResponseSchema,
          request: PayslipGetRequestSchema,
        },
        params
      )
      .pipe(
        tap((response: IPayslipGetResponseDto) => {
          this.logger.logUserAction('Get Payslip List Response', response);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors('Get Payslip List Error', error);
          } else {
            this.logger.logUserAction('Get Payslip List Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getPayslipDetailById(
    payslipId: string
  ): Observable<IPayslipDetailGetResponseDto> {
    this.logger.logUserAction('Get Payslip Detail By Id Request');

    return this.apiService
      .getValidated(API_ROUTES.PAYROLL.GET_PAYSLIP_BY_ID(payslipId), {
        response: PayslipDetailGetResponseSchema,
      })
      .pipe(
        tap((response: IPayslipDetailGetResponseDto) => {
          this.logger.logUserAction(
            'Get Payslip Detail By Id Response',
            response
          );
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get Payslip Detail By Id Error',
              error
            );
          } else {
            this.logger.logUserAction('Get Payslip Detail By Id Error', error);
          }
          return throwError(() => error);
        })
      );
  }

  getPayslipBlob(payslipId: string): Observable<Blob> {
    this.logger.logUserAction('Get Payslip Blob Request', { payslipId });

    return this.apiService
      .getBlob(API_ROUTES.PAYROLL.GET_PAYSLIP_BLOB(payslipId))
      .pipe(
        tap(() => {
          this.logger.logUserAction('Get Payslip Blob Response', { payslipId });
        }),
        catchError(error => {
          this.logger.logUserAction('Get Payslip Blob Error', error);
          return throwError(() => error);
        })
      );
  }
}
