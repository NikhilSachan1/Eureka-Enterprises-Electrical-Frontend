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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { merge, of, finalize } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { LoggerService } from '@core/services';
import { AttendanceService } from '@features/attendance-management/services/attendance.service';
import { IAttendanceCurrentStatusGetResponseDto } from '@features/attendance-management/types/attendance.dto';
import { IAttendanceAssignmentSubmitPayload } from '@features/attendance-management/types/attendance.interface';
import {
  buildAssignmentSubmitPayload,
  getAssignmentSiteFormValues,
  getAssignmentSource,
  getDropdownRecord,
  isBlankAssignmentId,
  NULL_ASSIGNMENT_FORM_VALUES,
  toDisplayName,
  toPersonName,
} from '@features/attendance-management/utility/attendance-assignment.util';
import { ICompanyGetBaseResponseDto } from '@features/site-management/company-management/types/company.dto';
import { IContractorGetBaseResponseDto } from '@features/site-management/contractor-management/types/contractor.dto';
import { IEmployeeGetBaseResponseDto } from '@features/employee-management/types/employee.dto';
import { VehicleBaseSchema } from '@features/transport-management/vehicle-management/schemas/base-vehicle.schema';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ICONS } from '@shared/constants/icon.constants';
import { TextCasePipe } from '@shared/pipes/text-case.pipe';
import {
  AppConfigurationService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import { IInputFieldsConfig } from '@shared/types';
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
  private readonly attendanceService = inject(AttendanceService);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  readonly formGroup = input.required<FormGroup>();
  readonly fieldConfigs = input.required<{
    company: IInputFieldsConfig;
    contractor: IInputFieldsConfig;
    vehicle: IInputFieldsConfig;
    assignedEngineer: IInputFieldsConfig;
  }>();
  readonly isDriver = input(false);
  readonly viewOnly = input(false);
  readonly previewSiteFields = input(true);
  readonly assignmentPayload = input<unknown>(null);
  readonly submitPayload = model<IAttendanceAssignmentSubmitPayload>(
    NULL_ASSIGNMENT_FORM_VALUES
  );

  private lastLoadedEngineerId: string | null = null;
  private inFlightEngineerId: string | null = null;
  private readonly loadedAssignment =
    signal<IAttendanceCurrentStatusGetResponseDto | null>(null);
  private readonly formTick = signal(0);

  protected readonly ALL_ICONS = ICONS;
  protected readonly displayLabels = computed(() => {
    this.formTick();
    return this.buildLabels();
  });

  constructor() {
    effect(() => {
      this.isDriver();
      this.formGroup();
      untracked(() => this.syncDriverAssignment());
    });

    effect(() => {
      this.formTick();
      this.isDriver();
      this.formGroup();
      this.assignmentPayload();
      this.loadedAssignment();
      this.appConfigurationService.companyList();
      this.appConfigurationService.contractorList();
      this.appConfigurationService.vehicleList();
      this.appConfigurationService.employeeList();
      untracked(() => this.submitPayload.set(this.buildSubmitPayload()));
    });
  }

  ngOnInit(): void {
    this.preloadDropdowns();

    merge(
      this.formGroup().get('assignedEngineer')?.valueChanges ?? of(null),
      this.formGroup().get('company')?.valueChanges ?? of(null),
      this.formGroup().get('contractor')?.valueChanges ?? of(null),
      this.formGroup().get('vehicle')?.valueChanges ?? of(null)
    )
      .pipe(debounceTime(0), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.formTick.update(tick => tick + 1);
        this.syncDriverAssignment();
      });
  }

  private syncDriverAssignment(): void {
    if (!this.isDriver()) {
      return;
    }

    const engineerId = this.getControlId('assignedEngineer');
    if (isBlankAssignmentId(engineerId)) {
      this.lastLoadedEngineerId = null;
      this.inFlightEngineerId = null;
      this.loadedAssignment.set(null);
      return;
    }

    if (
      this.inFlightEngineerId === engineerId ||
      (engineerId === this.lastLoadedEngineerId &&
        !isBlankAssignmentId(this.getControlId('company')))
    ) {
      return;
    }

    this.loadEngineerAssignment(engineerId);
  }

  private loadEngineerAssignment(assignedEngineerId: string): void {
    this.inFlightEngineerId = assignedEngineerId;
    this.loadingService.show({
      title: 'Loading assigned engineer assignment',
      message:
        "We're loading the assigned engineer's assignment. This will just take a moment.",
    });

    this.attendanceService
      .getAttendanceCurrentStatus({ employeeName: assignedEngineerId })
      .pipe(
        finalize(() => this.loadingService.hide()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: response => {
          if (this.getControlId('assignedEngineer') !== assignedEngineerId) {
            return;
          }

          this.lastLoadedEngineerId = assignedEngineerId;
          this.inFlightEngineerId = null;
          this.formGroup().patchValue(getAssignmentSiteFormValues(response), {
            emitEvent: false,
          });
          this.loadedAssignment.set(response);
          this.formTick.update(tick => tick + 1);
        },
        error: error => {
          if (this.inFlightEngineerId === assignedEngineerId) {
            this.inFlightEngineerId = null;
          }
          this.lastLoadedEngineerId = null;
          this.logger.error(
            'Error loading assigned engineer current status',
            error
          );
          this.notificationService.error(
            'Failed to load assigned engineer assignment'
          );
        },
      });
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
    engineer: string;
    vehicle: string;
  } {
    const isDriver = this.isDriver();
    const loaded = this.loadedAssignment();
    const payload = this.assignmentPayload();
    const site = getAssignmentSource(isDriver ? loaded : (loaded ?? payload));
    const initialEngineer = getAssignmentSource(payload)?.assignedEngineer;
    const loadedEngineer = loaded?.user;

    const companyId =
      this.getControlId('company') ?? site?.company?.id ?? null;
    const contractorId =
      this.getControlId('contractor') ?? site?.contractors?.[0]?.id ?? null;
    const vehicleId =
      this.getControlId('vehicle') ?? site?.vehicle?.id ?? null;
    const engineerId =
      this.getControlId('assignedEngineer') ??
      initialEngineer?.id ??
      loadedEngineer?.id ??
      null;

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
    let companyCity =
      toDisplayName(
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

    const contractorFromList =
      getDropdownRecord<IContractorGetBaseResponseDto>(
        this.appConfigurationService.contractorList(),
        contractorId
      );
    const engineerFromList = getDropdownRecord<IEmployeeGetBaseResponseDto>(
      this.appConfigurationService.employeeList(),
      engineerId
    );
    const engineerPerson =
      loadedEngineer?.id === engineerId
        ? loadedEngineer
        : initialEngineer?.id === engineerId
          ? initialEngineer
          : engineerFromList;
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
      engineer: toDisplayName(
        toPersonName(engineerPerson) || null,
        engineerPerson?.id,
        engineerId,
        toPersonName(engineerFromList) || null
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
    fieldName: 'company' | 'contractor' | 'vehicle' | 'assignedEngineer'
  ): string | null {
    const value = this.formGroup().get(fieldName)?.value;
    return typeof value === 'string' && value.trim() ? value : null;
  }

  private buildSubmitPayload(): IAttendanceAssignmentSubmitPayload {
    const isDriver = this.isDriver();
    const loadedSource = getAssignmentSource(this.loadedAssignment());
    const payloadSource = getAssignmentSource(this.assignmentPayload());
    const source = isDriver
      ? {
          company: loadedSource?.company ?? null,
          contractors: loadedSource?.contractors ?? null,
          vehicle: loadedSource?.vehicle ?? null,
          assignedEngineer:
            payloadSource?.assignedEngineer ?? loadedSource?.user ?? null,
          user: loadedSource?.user ?? null,
        }
      : (loadedSource ?? payloadSource);

    return buildAssignmentSubmitPayload({
      companyId: this.getControlId('company'),
      contractorId: this.getControlId('contractor'),
      vehicleId: this.getControlId('vehicle'),
      assignedEngineerId: this.getControlId('assignedEngineer'),
      companyList: this.appConfigurationService.companyList(),
      contractorList: this.appConfigurationService.contractorList(),
      vehicleList: this.appConfigurationService.vehicleList(),
      employeeList: this.appConfigurationService.employeeList(),
      source,
    });
  }
}
