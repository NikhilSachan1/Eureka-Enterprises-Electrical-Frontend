import {
  ChangeDetectionStrategy,
  Component,
  computed,
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
  getAssignedDriverDisplayName,
  getAssignedDriverId,
  getAssignedDrivers,
  toAssignedDriverIds,
  getAssignmentSource,
  getDropdownRecord,
  NULL_ASSIGNMENT_FORM_VALUES,
  toDisplayName,
  toPersonName,
} from '@features/attendance-management/utility/attendance-assignment.util';
import {
  IAttendanceAssignmentFormValues,
  IAttendanceAssignmentSubmitPayload,
} from '@features/attendance-management/types/attendance.interface';
import { IEmployeeGetBaseResponseDto } from '@features/employee-management/types/employee.dto';
import { VehicleBaseSchema } from '@features/transport-management/vehicle-management/schemas/base-vehicle.schema';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ICONS } from '@shared/constants/icon.constants';
import { TextCasePipe } from '@shared/pipes/text-case.pipe';
import {
  AppConfigurationService,
  FormService,
} from '@shared/services';
import { IInputFieldsConfig, ITrackedFields } from '@shared/types';
import type { z } from 'zod';

type VehicleValue = z.infer<typeof VehicleBaseSchema>;

@Component({
  selector: 'app-attendance-assignment-fields',
  imports: [InputFieldComponent, ReactiveFormsModule, TextCasePipe],
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
  readonly viewOnly = input(false);
  readonly assignmentPayload = input<unknown>(null);
  readonly submitPayload = model<IAttendanceAssignmentSubmitPayload>(
    NULL_ASSIGNMENT_FORM_VALUES
  );

  private readonly trackedAssignmentFields = signal<ITrackedFields<
    IAttendanceAssignmentFormValues
  > | null>(null);

  protected readonly ALL_ICONS = ICONS;
  protected readonly displayLabels = computed(() => {
    this.readTrackedAssignmentFields();
    this.assignmentPayload();
    this.appConfigurationService.vehicleList();
    this.appConfigurationService.employeeList();
    return this.buildLabels();
  });

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

  private buildLabels(): {
    driver: string;
    driverLabel: string;
    vehicle: string;
  } {
    const payload = this.assignmentPayload();
    const site = getAssignmentSource(payload);

    const vehicleId = this.getControlId('vehicle') ?? site?.vehicle?.id ?? null;
    const driverIds = this.getAssignedDriverControlIds();
    const driverId = driverIds[0] ?? getAssignedDriverId(payload);

    const payloadDrivers = getAssignedDrivers(payload);
    const payloadDriverNames = getAssignedDriverDisplayName(
      payload,
      this.appConfigurationService.employeeList()
    );
    const driverFromList = getDropdownRecord<IEmployeeGetBaseResponseDto>(
      this.appConfigurationService.employeeList(),
      driverId
    );
    const vehicleFromList = getDropdownRecord<VehicleValue>(
      this.appConfigurationService.vehicleList(),
      vehicleId
    );

    const listDriverName = toPersonName(driverFromList);

    return {
      driver:
        payloadDriverNames !== null && payloadDriverNames !== ''
          ? payloadDriverNames
          : toDisplayName(
              null,
              null,
              driverId,
              listDriverName !== '' ? listDriverName : null
            ),
      driverLabel:
        payloadDrivers.length > 1 || driverIds.length > 1
          ? 'Assigned Drivers'
          : 'Assigned Driver',
      vehicle: toDisplayName(
        site?.vehicle?.registrationNo,
        site?.vehicle?.id,
        vehicleId,
        vehicleFromList?.registrationNo
      ),
    };
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
