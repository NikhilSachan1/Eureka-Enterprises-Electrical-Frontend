import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import type { z } from 'zod';
import { FormBase } from '@shared/base/form.base';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { EUserRole, FORM_VALIDATION_MESSAGES } from '@shared/constants';
import {
  AppConfigurationService,
  ConfirmationDialogService,
} from '@shared/services';
import { IDialogActionHandler, ITrackedFields } from '@shared/types';
import {
  getMappedValueFromArrayOfObjects,
  getSelectedEmployeeRole,
} from '@shared/utility';
import { ICompanyGetBaseResponseDto } from '@features/site-management/company-management/types/company.dto';
import { IContractorGetBaseResponseDto } from '@features/site-management/contractor-management/types/contractor.dto';
import { VehicleBaseSchema } from '@features/transport-management/vehicle-management/schemas/base-vehicle.schema';
import { EmployeeBaseSchema } from '@features/employee-management/schemas/base-employee.schema';
import { REGULARIZE_ATTENDANCE_FORM_CONFIG } from '@features/attendance-management/config/form/regularize-attendance.config';
import { AttendanceService } from '@features/attendance-management/services/attendance.service';
import {
  IAttendanceGetBaseResponseDto,
  IAttendanceRegularizedFormDto,
  IAttendanceRegularizedResponseDto,
  IAttendanceRegularizedUIFormDto,
} from '@features/attendance-management/types/attendance.dto';
import { EAttendanceStatus } from '@features/attendance-management/types/attendance.enum';
import {
  isAttendanceAssignmentApplicable,
  NULL_ASSIGNMENT_FORM_VALUES,
} from '@features/attendance-management/utility/attendance-assignment.util';

type VehicleApplyValue = z.infer<typeof VehicleBaseSchema>;
type EmployeeApplyValue = z.infer<typeof EmployeeBaseSchema>;

@Component({
  selector: 'app-regularize-attendance',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './regularize-attendance.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegularizeAttendanceComponent
  extends FormBase<IAttendanceRegularizedUIFormDto>
  implements OnInit, IDialogActionHandler {
  private readonly attendanceService = inject(AttendanceService);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  private trackedRegularizeAttendanceFields!: ITrackedFields<IAttendanceRegularizedUIFormDto>;
  private readonly employeeRoles = signal<string[]>([]);

  private readonly formContext = {
    isEmployee: false,
    isDriver: false,
    isAssignmentApplicable: false,
  };

  protected readonly selectedRecord =
    input.required<IAttendanceGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  protected readonly showAssignmentFields = computed(() =>
    isAttendanceAssignmentApplicable(this.getSelectedAttendanceStatus())
  );
  protected readonly showRoleAssignmentFields = computed(
    () => this.showAssignmentFields()
  );
  protected readonly showDriverAssignmentFields = computed(
    () =>
      this.showAssignmentFields() &&
      this.employeeRoles().includes(EUserRole.DRIVER)
  );

  constructor() {
    super();
    effect(() => {
      if (!this.trackedRegularizeAttendanceFields) {
        return;
      }

      this.trackedRegularizeAttendanceFields.attendanceStatus?.();

      this.formContext.isEmployee = this.employeeRoles().includes(
        EUserRole.EMPLOYEE
      );
      this.formContext.isDriver = this.employeeRoles().includes(
        EUserRole.DRIVER
      );
      this.formContext.isAssignmentApplicable = this.showAssignmentFields();

      if (!this.form) {
        return;
      }

      this.formService.refreshConditionalValidators(
        this.form.formGroup,
        this.form.fieldConfigs,
        this.formContext
      );

      if (this.showAssignmentFields()) {
        const snapshot = this.selectedRecord()[0]?.assignmentSnapshot;
        this.form.patch({
          company: snapshot?.company?.id ?? null,
          contractor: snapshot?.contractors?.[0]?.id ?? null,
          vehicle: snapshot?.vehicle?.id ?? null,
          assignedEngineer: snapshot?.assignedEngineer?.id ?? null,
        });
      } else {
        this.form.patch({ ...NULL_ASSIGNMENT_FORM_VALUES });
      }
    });
  }

  ngOnInit(): void {
    const record = this.selectedRecord()[0];
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to regularize attendance but was not provided'
      );
      return;
    }

    this.employeeRoles.set(
      getSelectedEmployeeRole(
        record.user.id,
        this.appConfigurationService.employeeList()
      )
    );

    this.form = this.formService.createForm<IAttendanceRegularizedUIFormDto>(
      REGULARIZE_ATTENDANCE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: this.preparePrefilledFormData(record),
      }
    );

    this.trackedRegularizeAttendanceFields =
      this.formService.trackMultipleFieldChanges<IAttendanceRegularizedUIFormDto>(
        this.form.formGroup,
        ['attendanceStatus'],
        this.destroyRef
      );

    this.formContext.isEmployee = this.employeeRoles().includes(
      EUserRole.EMPLOYEE
    );
    this.formContext.isDriver = this.employeeRoles().includes(EUserRole.DRIVER);
    this.formContext.isAssignmentApplicable = this.showAssignmentFields();

    this.formService.refreshConditionalValidators(
      this.form.formGroup,
      this.form.fieldConfigs,
      this.formContext
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const record = this.selectedRecord()[0];
    if (!record?.id) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      return;
    }

    this.executeRegularizeAttendance(
      this.prepareFormData(record.user.id),
      record.id
    );
  }

  private preparePrefilledFormData(
    record: IAttendanceGetBaseResponseDto
  ): Partial<IAttendanceRegularizedUIFormDto> {
    const allowedStatuses = [
      EAttendanceStatus.PRESENT,
      EAttendanceStatus.ABSENT,
      EAttendanceStatus.LEAVE,
      EAttendanceStatus.HOLIDAY,
    ];
    const snapshot = record.assignmentSnapshot;

    return {
      ...(allowedStatuses.includes(record.status as EAttendanceStatus)
        ? { attendanceStatus: record.status }
        : {}),
      company: snapshot?.company?.id ?? null,
      contractor: snapshot?.contractors?.[0]?.id ?? null,
      vehicle: snapshot?.vehicle?.id ?? null,
      assignedEngineer: snapshot?.assignedEngineer?.id ?? null,
    };
  }

  private prepareFormData(userId: string): IAttendanceRegularizedFormDto {
    const formData = this.form.getData();
    const isDriver = this.employeeRoles().includes(EUserRole.DRIVER);

    if (!isAttendanceAssignmentApplicable(formData.attendanceStatus)) {
      return {
        attendanceStatus: formData.attendanceStatus,
        employeeName: userId,
        ...NULL_ASSIGNMENT_FORM_VALUES,
      } satisfies IAttendanceRegularizedFormDto;
    }

    const companyId = formData.company;
    const contractorId = formData.contractor;
    const vehicleId = formData.vehicle;
    const engineerId = isDriver ? formData.assignedEngineer : null;

    return {
      attendanceStatus: formData.attendanceStatus,
      employeeName: userId,
      company: this.isBlankId(companyId)
        ? null
        : ((getMappedValueFromArrayOfObjects(
          this.appConfigurationService.companyList(),
          companyId,
          'value',
          'data'
        ) as ICompanyGetBaseResponseDto) ?? null),
      contractor: this.isBlankId(contractorId)
        ? null
        : ((getMappedValueFromArrayOfObjects(
          this.appConfigurationService.contractorList(),
          contractorId,
          'value',
          'data'
        ) as IContractorGetBaseResponseDto) ?? null),
      vehicle: this.isBlankId(vehicleId)
        ? null
        : ((getMappedValueFromArrayOfObjects(
          this.appConfigurationService.vehicleList(),
          vehicleId,
          'value',
          'data'
        ) as VehicleApplyValue) ?? null),
      assignedEngineer: this.isBlankId(engineerId)
        ? null
        : ((getMappedValueFromArrayOfObjects(
          this.appConfigurationService.employeeList(),
          engineerId,
          'value',
          'data'
        ) as EmployeeApplyValue) ?? null),
    } satisfies IAttendanceRegularizedFormDto;
  }

  private isBlankId(
    value: string | null | undefined
  ): value is null | undefined | '' {
    return value === null || value === undefined || value === '';
  }

  private executeRegularizeAttendance(
    formData: IAttendanceRegularizedFormDto,
    attendanceId: string
  ): void {
    this.loadingService.show({
      title: 'Updating attendance',
      message:
        "We're updating attendance changes. This will just take a moment.",
    });
    this.form.disable();

    this.attendanceService
      .regularizedAttendance(formData, attendanceId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAttendanceRegularizedResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to regularize attendance', error);
          this.notificationService.error('Failed to regularize attendance');
        },
      });
  }

  private getSelectedAttendanceStatus(): EAttendanceStatus | null {
    const status =
      this.trackedRegularizeAttendanceFields?.attendanceStatus?.();
    return typeof status === 'string' ? (status as EAttendanceStatus) : null;
  }
}
