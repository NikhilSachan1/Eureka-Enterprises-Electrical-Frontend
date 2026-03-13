import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { AttendanceService } from '../../services/attendance.service';
import {
  AppConfigurationService,
  RouterNavigationService,
} from '@shared/services';
import {
  type IFormConfig,
  type IOptionDropdown,
  IPageHeaderConfig,
  ITrackedFields,
} from '@shared/types';
import { FORCE_ATTENDANCE_FORM_CONFIG } from '../../config';
import {
  IAttendanceCurrentStatusGetResponseDto,
  IAttendanceForceFormDto,
} from '@features/attendance-management/types/attendance.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  CONFIGURATION_KEYS,
  MODULE_NAMES,
  ROUTE_BASE_PATHS,
  ROUTES,
} from '@shared/constants';
import { finalize } from 'rxjs';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBase } from '@shared/base/form.base';
import { AssignmentSnapshotComponent } from '../../shared/assignment-snapshot/assignment-snapshot.component';
import { toTitleCase } from '@shared/utility';

@Component({
  selector: 'app-force-attendance',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
    AssignmentSnapshotComponent,
  ],
  templateUrl: './force-attendance.component.html',
  styleUrl: './force-attendance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForceAttendanceComponent
  extends FormBase<IAttendanceForceFormDto>
  implements OnInit
{
  private readonly attendanceService = inject(AttendanceService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly assignmentSnapshotData =
    signal<IAttendanceCurrentStatusGetResponseDto | null>(null);

  private trackedFields!: ITrackedFields<IAttendanceForceFormDto>;

  protected readonly selectedEmployeeId = computed(() => {
    const empId = this.trackedFields?.employeeName?.();
    return empId && typeof empId === 'string' ? empId : null;
  });

  constructor() {
    super();
    effect(() => {
      const snapshot = this.assignmentSnapshotData();
      if (snapshot && this.form?.formGroup) {
        queueMicrotask(() => this.recreateFormWithPrefill(snapshot));
      }
    });
  }

  ngOnInit(): void {
    this.createForceAttendanceForm(FORCE_ATTENDANCE_FORM_CONFIG, {});

    const trackedFieldNames: (keyof IAttendanceForceFormDto)[] = [
      'employeeName',
    ];
    this.trackedFields =
      this.formService.trackMultipleFieldChanges<IAttendanceForceFormDto>(
        this.form.formGroup,
        trackedFieldNames,
        this.destroyRef
      );
  }

  private createForceAttendanceForm(
    config: IFormConfig<IAttendanceForceFormDto>,
    defaultValues: Partial<IAttendanceForceFormDto>
  ): void {
    this.form = this.formService.createForm<IAttendanceForceFormDto>(config, {
      destroyRef: this.destroyRef,
      defaultValues: Object.keys(defaultValues).length
        ? defaultValues
        : undefined,
    });
  }

  private recreateFormWithPrefill(
    snapshot: IAttendanceCurrentStatusGetResponseDto
  ): void {
    const currentValues = this.form?.getData?.() ?? {};
    const prefilled = this.getPrefillFromSnapshot(snapshot);
    const defaultValues: Partial<IAttendanceForceFormDto> = {
      ...currentValues,
      ...prefilled,
    };
    const config = this.getForceAttendanceFormConfig(snapshot);
    this.createForceAttendanceForm(config, defaultValues);
    this.trackedFields =
      this.formService.trackMultipleFieldChanges<IAttendanceForceFormDto>(
        this.form.formGroup,
        ['employeeName'],
        this.destroyRef
      );
  }

  private getPrefillFromSnapshot(
    snapshot: IAttendanceCurrentStatusGetResponseDto
  ): Partial<IAttendanceForceFormDto> {
    const patch: Partial<IAttendanceForceFormDto> = {};
    if (snapshot.company?.id) {
      patch.locationName = snapshot.company.id;
    }
    if (snapshot.contractors?.length && snapshot.contractors[0]?.id) {
      patch.clientName = snapshot.contractors[0].id;
    }
    if (snapshot.assignedEngineer?.id) {
      patch.associateEngineerName = snapshot.assignedEngineer.id;
    }
    if (snapshot.vehicle?.id) {
      patch.associatedVehicle = snapshot.vehicle.id;
    }
    return patch;
  }

  private getForceAttendanceFormConfig(
    snapshot: IAttendanceCurrentStatusGetResponseDto
  ): IFormConfig<IAttendanceForceFormDto> {
    const companyOptions =
      this.appConfigurationService.getDropdown(
        MODULE_NAMES.COMPANY,
        CONFIGURATION_KEYS.COMPANY.COMPANY_LIST
      )() ?? [];
    const contractorOptions =
      this.appConfigurationService.getDropdown(
        MODULE_NAMES.CONTRACTOR,
        CONFIGURATION_KEYS.CONTRACTOR.CONTRACTOR_LIST
      )() ?? [];
    const employeeOptions =
      this.appConfigurationService.getDropdown(
        MODULE_NAMES.EMPLOYEE,
        CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST
      )() ?? [];
    const vehicleOptions =
      this.appConfigurationService.getDropdown(
        MODULE_NAMES.VEHICLE,
        CONFIGURATION_KEYS.VEHICLE.VEHICLE_LIST
      )() ?? [];

    const companyOpt: IOptionDropdown | null = snapshot.company
      ? {
          label: toTitleCase(snapshot.company.name),
          value: snapshot.company.id,
        }
      : null;
    const contractorOpt = snapshot.contractors?.[0]
      ? {
          label: toTitleCase(snapshot.contractors[0].name),
          value: snapshot.contractors[0].id,
        }
      : null;
    const engineerOpt = snapshot.assignedEngineer
      ? {
          label: toTitleCase(
            `${snapshot.assignedEngineer.firstName} ${snapshot.assignedEngineer.lastName}`.trim()
          ),
          value: snapshot.assignedEngineer.id,
        }
      : null;
    const vehicleOpt = snapshot.vehicle
      ? {
          label: snapshot.vehicle.registrationNo,
          value: snapshot.vehicle.id,
        }
      : null;

    const mergeOptions = (
      prefilled: IOptionDropdown | null,
      existing: IOptionDropdown[]
    ): IOptionDropdown[] =>
      prefilled
        ? [prefilled, ...existing.filter(o => o.value !== prefilled.value)]
        : existing;

    const baseLoc =
      FORCE_ATTENDANCE_FORM_CONFIG.fields.locationName.selectConfig;
    const baseClient =
      FORCE_ATTENDANCE_FORM_CONFIG.fields.clientName.selectConfig;
    const baseEng =
      FORCE_ATTENDANCE_FORM_CONFIG.fields.associateEngineerName.selectConfig;
    const baseVeh =
      FORCE_ATTENDANCE_FORM_CONFIG.fields.associatedVehicle.selectConfig;

    const selectWithOptions = (
      base: typeof baseLoc,
      options: IOptionDropdown[]
    ): { optionsDropdown: IOptionDropdown[] } & Omit<
      NonNullable<typeof baseLoc>,
      'dynamicDropdown' | 'optionsDropdown'
    > => {
      const { dynamicDropdown, ...rest } = base ?? {};
      void dynamicDropdown;
      return { ...rest, optionsDropdown: options };
    };

    return {
      ...FORCE_ATTENDANCE_FORM_CONFIG,
      fields: {
        ...FORCE_ATTENDANCE_FORM_CONFIG.fields,
        locationName: {
          ...FORCE_ATTENDANCE_FORM_CONFIG.fields.locationName,
          selectConfig: selectWithOptions(
            baseLoc,
            mergeOptions(companyOpt, companyOptions)
          ),
        },
        clientName: {
          ...FORCE_ATTENDANCE_FORM_CONFIG.fields.clientName,
          selectConfig: selectWithOptions(
            baseClient,
            mergeOptions(contractorOpt, contractorOptions)
          ),
        },
        associateEngineerName: {
          ...FORCE_ATTENDANCE_FORM_CONFIG.fields.associateEngineerName,
          selectConfig: selectWithOptions(
            baseEng,
            mergeOptions(engineerOpt, employeeOptions)
          ),
        },
        associatedVehicle: {
          ...FORCE_ATTENDANCE_FORM_CONFIG.fields.associatedVehicle,
          selectConfig: selectWithOptions(
            baseVeh,
            mergeOptions(vehicleOpt, vehicleOptions)
          ),
        },
      },
    };
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeForceAttendance(formData);
  }

  private prepareFormData(): IAttendanceForceFormDto & {
    assignmentSnapshot?: {
      site: Record<string, unknown>;
      company: Record<string, unknown>;
      contractors: Record<string, unknown>[];
      vehicle: Record<string, unknown>;
      assignedEngineer: Record<string, unknown>;
    };
  } {
    const formData = this.form.getData();
    const snapshot = this.assignmentSnapshotData();
    const assignmentSnapshot = snapshot
      ? {
          site: (snapshot.site as Record<string, unknown>) ?? {},
          company: (snapshot.company as Record<string, unknown>) ?? {},
          contractors: snapshot.contractors
            ? snapshot.contractors.map(
                c => c as unknown as Record<string, unknown>
              )
            : [],
          vehicle: (snapshot.vehicle as Record<string, unknown>) ?? {},
          assignedEngineer:
            (snapshot.assignedEngineer as Record<string, unknown>) ?? {},
        }
      : {
          site: {},
          company: {},
          contractors: [],
          vehicle: {},
          assignedEngineer: {},
        };
    return { ...formData, assignmentSnapshot };
  }

  private executeForceAttendance(formData: IAttendanceForceFormDto): void {
    this.loadingService.show({
      title: 'Force Attendance',
      message: 'Please wait while we force attendance...',
    });
    this.form.disable();

    this.attendanceService
      .forceAttendance(formData)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.form.enable();
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.notificationService.success(
            'Force attendance applied successfully'
          );
          const routeSegments = [
            ROUTE_BASE_PATHS.ATTENDANCE,
            ROUTES.ATTENDANCE.LIST,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to apply force attendance');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm();
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Force Attendance',
      subtitle: 'Force attendance on behalf of an employee',
    };
  }
}
