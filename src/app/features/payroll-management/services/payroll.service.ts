import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services';
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
import { catchError, Observable, throwError } from 'rxjs';
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
  private readonly apiService = inject(ApiService);

  addSalaryIncrement(
    formData: ISalaryIncrementAddFormDto
  ): Observable<ISalaryIncrementAddResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.PAYROLL.ADD_SALARY_INCREMENT,
        {
          response: SalaryIncrementAddResponseSchema,
          request: SalaryIncrementAddRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  editSalary(
    formData: ISalaryEditFormDto,
    salaryStructureId: string
  ): Observable<ISalaryEditResponseDto> {
    return this.apiService
      .patchValidated(
        API_ROUTES.PAYROLL.EDIT(salaryStructureId),
        {
          response: SalaryEditResponseSchema,
          request: SalaryEditRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  actionPayroll(
    formData: IActionPayrollFormDto
  ): Observable<IActionPayrollResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.PAYROLL.ACTION,
        {
          response: ActionPayrollResponseSchema,
          request: ActionPayrollRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  cancelPayroll(
    formData: IActionPayrollFormDto
  ): Observable<IActionPayrollResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.PAYROLL.CANCEL,
        {
          response: ActionPayrollResponseSchema,
          request: ActionPayrollRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  generatePayroll(
    formData: IGeneratePayrollFormDto
  ): Observable<IGeneratePayrollResponseDto> {
    return this.apiService
      .postValidated(
        API_ROUTES.PAYROLL.GENERATE,
        {
          response: GeneratePayrollResponseSchema,
          request: GeneratePayrollRequestSchema,
        },
        formData
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getSalaryStructureList(
    params?: ISalaryStructureGetFormDto
  ): Observable<ISalaryStructureGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.PAYROLL.STRUCTURE,
        {
          response: SalaryStructureGetResponseSchema,
          request: SalaryStructureGetRequestSchema,
        },
        params
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getSalaryStructureHistory(
    salaryStructureId: string
  ): Observable<ISalaryStructureHistoryGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.PAYROLL.GET_STRUCTURE_HISTORY(salaryStructureId),
        {
          response: SalaryStructureHistoryGetResponseSchema,
        }
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getPayslipList(
    params?: IPayslipGetFormDto
  ): Observable<IPayslipGetResponseDto> {
    return this.apiService
      .getValidated(
        API_ROUTES.PAYROLL.GET_PAYSLIP_LIST,
        {
          response: PayslipGetResponseSchema,
          request: PayslipGetRequestSchema,
        },
        params
      )
      .pipe(catchError(error => throwError(() => error)));
  }

  getPayslipDetailById(
    payslipId: string
  ): Observable<IPayslipDetailGetResponseDto> {
    return this.apiService
      .getValidated(API_ROUTES.PAYROLL.GET_PAYSLIP_BY_ID(payslipId), {
        response: PayslipDetailGetResponseSchema,
      })
      .pipe(catchError(error => throwError(() => error)));
  }

  getPayslipBlob(payslipId: string): Observable<Blob> {
    return this.apiService
      .getBlob(API_ROUTES.PAYROLL.GET_PAYSLIP_BLOB(payslipId))
      .pipe(catchError(error => throwError(() => error)));
  }
}
