import { inject, Injectable, signal } from '@angular/core';
import { API_ROUTES } from '@core/constants';
import { ApiService, LoggerService } from '@core/services';
import { AppConfiguationResponseSchema } from '@shared/schemas';
import { IAppConfiguationResponseDto, IOptionDropdown } from '@shared/types';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppConfiguarionService {
  private readonly logger = inject(LoggerService);
  private readonly apiService = inject(ApiService);

  private readonly _employeeStatus = signal<IOptionDropdown[]>([]);
  private readonly _employeeGender = signal<IOptionDropdown[]>([]);
  private readonly _employeeBloodGroup = signal<IOptionDropdown[]>([]);

  readonly employeeStatus = this._employeeStatus.asReadonly();
  readonly employeeGender = this._employeeGender.asReadonly();
  readonly employeeBloodGroup = this._employeeBloodGroup.asReadonly();

  getAppConfiguation(): Observable<IAppConfiguationResponseDto> {
    this.logger.logUserAction('Get App Configuation Request');

    return this.apiService
      .getValidated(
        API_ROUTES.APP_CONFIGUATION.GET,
        AppConfiguationResponseSchema
      )
      .pipe(
        tap((response: IAppConfiguationResponseDto) => {
          this.logger.logUserAction('Get App Configuation Response', response);

          // Use API response data (when schema is ready) or fallback to hardcoded
          const { employeeStatus, employeeGender, employeeBloodGroup } =
            this.transformConfiguationResponse(response);

          this._employeeStatus.set(employeeStatus);
          this._employeeGender.set(employeeGender);
          this._employeeBloodGroup.set(employeeBloodGroup);
        }),
        catchError(error => {
          if (error?.name === 'ZodError') {
            this.logger.logDtoValidationErrors(
              'Get App Configuation Error',
              error
            );
          } else {
            this.logger.logUserAction('Get App Configuation Error', error);
          }
          const { employeeStatus, employeeGender, employeeBloodGroup } =
            this.transformConfiguationResponse();

          this._employeeStatus.set(employeeStatus);
          this._employeeGender.set(employeeGender);
          this._employeeBloodGroup.set(employeeBloodGroup);
          return throwError(() => error);
        })
      );
  }

  private transformConfiguationResponse(
    _response?: IAppConfiguationResponseDto
  ): {
    employeeStatus: IOptionDropdown[];
    employeeGender: IOptionDropdown[];
    employeeBloodGroup: IOptionDropdown[];
  } {
    // TODO: When API schema is ready, use response data:
    // return {
    //   employeeStatus: response?.employeeStatus || [],
    //   employeeGender: response?.employeeGender || [],
    //   employeeBloodGroup: response?.employeeBloodGroup || [],
    // };

    // Fallback to hardcoded data until API schema is ready
    const EMPLOYEE_STATUS_DATA: IOptionDropdown[] = [
      { label: 'Active', value: 'ACTIVE' },
      { label: 'Archived', value: 'ARCHIVED' },
    ];

    const EMPLOYEE_GENDER_DATA: IOptionDropdown[] = [
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' },
      { label: 'Other', value: 'other' },
    ];

    const EMPLOYEE_BLOOD_GROUP_DATA: IOptionDropdown[] = [
      { label: 'A+', value: 'a_posi' },
      { label: 'A-', value: 'a_neg' },
      { label: 'B+', value: 'b_posi' },
      { label: 'B-', value: 'b_neg' },
      { label: 'AB+', value: 'ab_posi' },
      { label: 'AB-', value: 'ab_neg' },
      { label: 'O+', value: 'o_posi' },
      { label: 'O-', value: 'o_neg' },
    ];

    return {
      employeeStatus: EMPLOYEE_STATUS_DATA,
      employeeGender: EMPLOYEE_GENDER_DATA,
      employeeBloodGroup: EMPLOYEE_BLOOD_GROUP_DATA,
    };
  }
}
