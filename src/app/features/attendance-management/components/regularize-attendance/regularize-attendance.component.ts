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
import { FormBase } from '@shared/base/form.base';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { AttendanceAssignmentFieldsComponent } from '@features/attendance-management/components/attendance-assignment-fields/attendance-assignment-fields.component';
import { EUserRole, FORM_VALIDATION_MESSAGES } from '@shared/constants';
import {
  AppConfigurationService,
  ConfirmationDialogService,
} from '@shared/services';
import { IDialogActionHandler, ITrackedFields } from '@shared/types';
import { getSelectedEmployeeRole } from '@shared/utility';
import { REGULARIZE_ATTENDANCE_FORM_CONFIG } from '@features/attendance-management/config/form/regularize-attendance.config';
import { AttendanceService } from '@features/attendance-management/services/attendance.service';
import {
  IAttendanceGetBaseResponseDto,
  IAttendanceRegularizedFormDto,
  IAttendanceRegularizedResponseDto,
  IAttendanceRegularizedUIFormDto,
} from '@features/attendance-management/types/attendance.dto';
import { EAttendanceStatus } from '@features/attendance-management/types/attendance.enum';
import { IAttendanceAssignmentSubmitPayload } from '@features/attendance-management/types/attendance.interface';
import {
  getAssignmentFormValues,
  isAttendanceAssignmentApplicable,
  NULL_ASSIGNMENT_FORM_VALUES,
} from '@features/attendance-management/utility/attendance-assignment.util';

@Component({
  selector: 'app-regularize-attendance',
  imports: [
    InputFieldComponent,
    ReactiveFormsModule,
    AttendanceAssignmentFieldsComponent,
  ],
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
  protected readonly assignmentSubmitPayload =
    signal<IAttendanceAssignmentSubmitPayload>(NULL_ASSIGNMENT_FORM_VALUES);

  constructor() {
    super();
    effect(() => {
      if (!this.showRoleAssignmentFields()) {
        this.assignmentSubmitPayload.set(NULL_ASSIGNMENT_FORM_VALUES);
      }
    });
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
        this.form.patch(
          getAssignmentFormValues(this.selectedRecord()[0]?.assignmentSnapshot)
        );
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

    this.formContext.isEmployee = this.employeeRoles().includes(
      EUserRole.EMPLOYEE
    );
    this.formContext.isDriver = this.employeeRoles().includes(EUserRole.DRIVER);
    this.formContext.isAssignmentApplicable = isAttendanceAssignmentApplicable(
      record.status
    );

    this.form = this.formService.createForm<IAttendanceRegularizedUIFormDto>(
      REGULARIZE_ATTENDANCE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: this.preparePrefilledFormData(record),
        context: this.formContext,
      }
    );

    this.trackedRegularizeAttendanceFields =
      this.formService.trackMultipleFieldChanges<IAttendanceRegularizedUIFormDto>(
        this.form.formGroup,
        ['attendanceStatus'],
        this.destroyRef
      );

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
      ...getAssignmentFormValues(snapshot),
    };
  }

  private prepareFormData(userId: string): IAttendanceRegularizedFormDto {
    const formData = this.form.getData();
    const isDriver = this.employeeRoles().includes(EUserRole.DRIVER);
    const assignment = isAttendanceAssignmentApplicable(
      formData.attendanceStatus
    )
      ? this.assignmentSubmitPayload()
      : NULL_ASSIGNMENT_FORM_VALUES;

    return {
      attendanceStatus: formData.attendanceStatus,
      employeeName: userId,
      ...assignment,
      assignedEngineer: isDriver ? assignment.assignedEngineer : null,
    } satisfies IAttendanceRegularizedFormDto;
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
