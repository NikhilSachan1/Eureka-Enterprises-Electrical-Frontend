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
  getAssignedDriverId,
  getAssignedDrivers,
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
import { ICompanyGetBaseResponseDto } from '@features/site-management/company-management/types/company.dto';
import { IContractorGetBaseResponseDto } from '@features/site-management/contractor-management/types/contractor.dto';
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
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
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
    company: IInputFieldsConfig;
    contractor: IInputFieldsConfig;
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
    this.appConfigurationService.companyList();
    this.appConfigurationService.contractorList();
    this.appConfigurationService.vehicleList();
    this.appConfigurationService.employeeList();
    this.appConfigurationService.cities();
    this.appConfigurationService.states();
    return this.buildLabels();
  });

  constructor() {
    effect(() => {
      this.readTrackedAssignmentFields();
      this.formGroup();
      this.assignmentPayload();
      this.appConfigurationService.companyList();
      this.appConfigurationService.contractorList();
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
        ['company', 'contractor', 'vehicle', 'assignedDriver'],
        this.destroyRef
      )
    );
  }

  private readTrackedAssignmentFields(): void {
    const tracked = this.trackedAssignmentFields();
    tracked?.company?.();
    tracked?.contractor?.();
    tracked?.vehicle?.();
    tracked?.assignedDriver?.();
  }

  private preloadDropdowns(): void {
    Object.values(this.fieldConfigs()).forEach(config => {
      const dropdown = config.selectConfig?.dynamicDropdown;
      if (dropdown?.moduleName && dropdown.dropdownName) {
        this.appConfigurationService.getDropdown(
          dropdown.moduleName,
          dropdown.dropdownName
        );
      }
    });
  }

  private buildLabels(): {
    companyName: string;
    companyCity: string;
    companyState: string;
    contractorName: string;
    contractorCity: string;
    contractorState: string;
    driver: string;
    vehicle: string;
  } {
    const payload = this.assignmentPayload();
    const site = getAssignmentSource(payload);

    const companyId = this.getControlId('company') ?? site?.company?.id ?? null;
    const contractorId =
      this.getControlId('contractor') ?? site?.contractors?.[0]?.id ?? null;
    const vehicleId = this.getControlId('vehicle') ?? site?.vehicle?.id ?? null;
    const driverId =
      this.getControlId('assignedDriver') ?? getAssignedDriverId(payload);

    const companyFromList = getDropdownRecord<ICompanyGetBaseResponseDto>(
      this.appConfigurationService.companyList(),
      companyId
    );
    const companyName = toDisplayName(
      site?.company?.name,
      site?.company?.id,
      companyId,
      companyFromList?.name
    );
    let companyCity = toDisplayName(
      site?.company?.city,
      site?.company?.id,
      companyId,
      null
    );
    let companyState = toDisplayName(
      site?.company?.state,
      site?.company?.id,
      companyId,
      null
    );
    if (companyCity === '-' && site?.company?.fullAddress?.trim()) {
      companyCity = site.company.fullAddress.trim();
    }
    if (companyFromList) {
      if (companyCity === '-') {
        companyCity =
          getMappedValueFromArrayOfObjects(
            this.appConfigurationService.cities(),
            companyFromList.city,
            'value',
            'label'
          ) ??
          companyFromList.city?.trim() ??
          '-';
      }
      if (companyState === '-') {
        companyState =
          this.appConfigurationService
            .states()
            .find(state => state.value === companyFromList.state?.trim())
            ?.label ??
          companyFromList.state?.trim() ??
          '-';
      }
    }

    const contractorFromList = getDropdownRecord<IContractorGetBaseResponseDto>(
      this.appConfigurationService.contractorList(),
      contractorId
    );
    let contractorCity = toDisplayName(
      site?.contractors?.[0]?.city,
      site?.contractors?.[0]?.id,
      contractorId,
      null
    );
    let contractorState = toDisplayName(
      site?.contractors?.[0]?.state,
      site?.contractors?.[0]?.id,
      contractorId,
      null
    );
    if (contractorFromList) {
      if (contractorCity === '-') {
        contractorCity =
          getMappedValueFromArrayOfObjects(
            this.appConfigurationService.cities(),
            contractorFromList.city,
            'value',
            'label'
          ) ??
          contractorFromList.city?.trim() ??
          '-';
      }
      if (contractorState === '-') {
        contractorState =
          this.appConfigurationService
            .states()
            .find(state => state.value === contractorFromList.state?.trim())
            ?.label ??
          contractorFromList.state?.trim() ??
          '-';
      }
    }

    const payloadDriver = getAssignedDrivers(payload)[0];
    const driverFromList = getDropdownRecord<IEmployeeGetBaseResponseDto>(
      this.appConfigurationService.employeeList(),
      driverId
    );
    const vehicleFromList = getDropdownRecord<VehicleValue>(
      this.appConfigurationService.vehicleList(),
      vehicleId
    );

    return {
      companyName,
      companyCity,
      companyState,
      contractorName: toDisplayName(
        site?.contractors?.[0]?.name,
        site?.contractors?.[0]?.id,
        contractorId,
        contractorFromList?.name
      ),
      contractorCity,
      contractorState,
      driver: toDisplayName(
        toPersonName(payloadDriver) || null,
        payloadDriver?.id,
        driverId,
        toPersonName(driverFromList) || null
      ),
      vehicle: toDisplayName(
        site?.vehicle?.registrationNo,
        site?.vehicle?.id,
        vehicleId,
        vehicleFromList?.registrationNo
      ),
    };
  }

  private getControlId(
    fieldName: 'company' | 'contractor' | 'vehicle' | 'assignedDriver'
  ): string | null {
    const value = this.formGroup().get(fieldName)?.value;
    return typeof value === 'string' && value.trim() ? value : null;
  }

  private buildSubmitPayload(): IAttendanceAssignmentSubmitPayload {
    return buildAssignmentSubmitPayload({
      companyId: this.getControlId('company'),
      contractorId: this.getControlId('contractor'),
      vehicleId: this.getControlId('vehicle'),
      assignedDriverId: this.getControlId('assignedDriver'),
      companyList: this.appConfigurationService.companyList(),
      contractorList: this.appConfigurationService.contractorList(),
      vehicleList: this.appConfigurationService.vehicleList(),
      source: getAssignmentSource(this.assignmentPayload()),
    });
  }
}
