import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  model,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  buildAssignmentSubmitPayload,
  toAssignedDriverIds,
  getAssignmentSource,
  NULL_ASSIGNMENT_FORM_VALUES,
} from '@features/attendance-management/utility/attendance-assignment.util';
import {
  IAttendanceAssignmentFormValues,
  IAttendanceAssignmentSubmitPayload,
} from '@features/attendance-management/types/attendance.interface';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import {
  AppConfigurationService,
  FormService,
} from '@shared/services';
import { IInputFieldsConfig, ITrackedFields } from '@shared/types';

@Component({
  selector: 'app-attendance-assignment-fields',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './attendance-assignment-fields.component.html',
  styleUrl: './attendance-assignment-fields.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendanceAssignmentFieldsComponent implements OnInit {
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly formService = inject(FormService);
  private readonly destroyRef = inject(DestroyRef);

  readonly formGroup = input.required<FormGroup>();
  readonly fieldConfigs = input.required<{
    vehicle: IInputFieldsConfig;
    assignedDriver: IInputFieldsConfig;
  }>();
  readonly assignmentPayload = input<unknown>(null);
  readonly submitPayload = model<IAttendanceAssignmentSubmitPayload>(
    NULL_ASSIGNMENT_FORM_VALUES
  );

  private readonly trackedAssignmentFields = signal<ITrackedFields<
    IAttendanceAssignmentFormValues
  > | null>(null);

  constructor() {
    effect(() => {
      this.readTrackedAssignmentFields();
      this.formGroup();
      this.assignmentPayload();
      this.appConfigurationService.vehicleList();
      this.appConfigurationService.employeeList();
      untracked(() => this.submitPayload.set(this.buildSubmitPayload()));
    });
  }

  ngOnInit(): void {
    this.preloadDropdowns();
    this.trackedAssignmentFields.set(
      this.formService.trackMultipleFieldChanges<IAttendanceAssignmentFormValues>(
        this.formGroup(),
        ['vehicle', 'assignedDriver'],
        this.destroyRef
      )
    );
  }

  private readTrackedAssignmentFields(): void {
    const tracked = this.trackedAssignmentFields();
    tracked?.vehicle?.();
    tracked?.assignedDriver?.();
  }

  private preloadDropdowns(): void {
    Object.values(this.fieldConfigs()).forEach(config => {
      const dropdown =
        config.selectConfig?.dynamicDropdown ??
        config.multiSelectConfig?.dynamicDropdown;
      if (dropdown?.moduleName && dropdown.dropdownName) {
        this.appConfigurationService.getDropdown(
          dropdown.moduleName,
          dropdown.dropdownName
        );
      }
    });
  }

  private getControlId(fieldName: 'vehicle'): string | null {
    const value = this.formGroup().get(fieldName)?.value;
    return typeof value === 'string' && value.trim() ? value : null;
  }

  private getAssignedDriverControlIds(): string[] {
    return toAssignedDriverIds(
      this.formGroup().get('assignedDriver')?.value ?? null
    );
  }

  private buildSubmitPayload(): IAttendanceAssignmentSubmitPayload {
    const assignedDriverIds = this.getAssignedDriverControlIds();
    return buildAssignmentSubmitPayload({
      vehicleId: this.getControlId('vehicle'),
      assignedDriverId:
        assignedDriverIds.length > 1
          ? assignedDriverIds
          : (assignedDriverIds[0] ?? null),
      vehicleList: this.appConfigurationService.vehicleList(),
      source: getAssignmentSource(this.assignmentPayload()),
    });
  }
}
