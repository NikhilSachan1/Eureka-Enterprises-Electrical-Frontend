import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AttendanceService } from '@features/attendance-management/services/attendance.service';
import {
  IAttendanceApplyFormDto,
  IAttendanceApplyRequestDto,
  IAttendanceCurrentStatusGetResponseDto,
} from '@features/attendance-management/types/attendance.dto';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ICONS } from '@shared/constants/icon.constants';
import {
  type IFormConfig,
  type IOptionDropdown,
  EButtonActionType,
  EButtonSeverity,
  EButtonVariant,
  IButtonConfig,
  IPageHeaderConfig,
} from '@shared/types';
import { SecondsToDhmsPipe } from '@shared/pipes/seconds-to-dhms.pipe';
import { TextCasePipe } from '@shared/pipes/text-case.pipe';
import {
  AppConfigurationService,
  RouterNavigationService,
} from '@shared/services';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { EApplyAttendanceAction } from '@features/attendance-management/types/attendance.enum';
import { APPLY_ATTENDANCE_FORM_CONFIG } from '@features/attendance-management/config/form/apply-attendance.config';
import { AuthService } from '@features/auth-management/services/auth.service';
import { getMappedValueFromArrayOfObjects, toTitleCase } from '@shared/utility';
import {
  CONFIGURATION_KEYS,
  EUserRole,
  MODULE_NAMES,
  ROUTE_BASE_PATHS,
  ROUTES,
} from '@shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBase } from '@shared/base/form.base';
import { APP_CONFIG } from '@core/config';

@Component({
  selector: 'app-apply-attendance',
  imports: [
    PageHeaderComponent,
    DatePipe,
    SecondsToDhmsPipe,
    TextCasePipe,
    ButtonComponent,
    ReactiveFormsModule,
    InputFieldComponent,
  ],
  templateUrl: './apply-attendance.component.html',
  styleUrl: './apply-attendance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplyAttendanceComponent
  extends FormBase<IAttendanceApplyFormDto>
  implements OnInit
{
  protected readonly attendanceService = inject(AttendanceService);
  private readonly authService = inject(AuthService);
  private readonly appConfigurationService = inject(AppConfigurationService);
  protected readonly activatedRoute = inject(ActivatedRoute);
  protected readonly routerNavigationService = inject(RouterNavigationService);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected assignmentHeaderButtonConfig = computed(() =>
    this.getAssignmentHeaderButtonConfig()
  );

  protected readonly initialAttendanceData =
    signal<IAttendanceApplyFormDto | null>(null);
  protected readonly currentStatusData =
    signal<IAttendanceCurrentStatusGetResponseDto | null>(null);
  protected readonly isEditingAssignment = signal(false);

  protected readonly todayDate = new Date();
  protected readonly ALL_APPLY_ATTENDANCE_ACTIONS = EApplyAttendanceAction;
  protected readonly ALL_ICONS = ICONS;
  protected readonly APP_CONFIG = APP_CONFIG;

  ngOnInit(): void {
    this.loadCurrentStatusDataFromRoute();

    const currentUser = this.authService.getCurrentUser();
    const isDriverUser = currentUser?.activeRole === EUserRole.DRIVER;

    const formConfig = this.getApplyAttendanceFormConfig();
    this.form = this.formService.createForm<IAttendanceApplyFormDto>(
      formConfig,
      {
        destroyRef: this.destroyRef,
        defaultValues: this.initialAttendanceData(),
        context: {
          isDriver: isDriverUser,
        },
      }
    );
  }

  private getApplyAttendanceFormConfig(): IFormConfig<IAttendanceApplyFormDto> {
    const assignedEngineer = this.currentStatusData()?.assignedEngineer;
    const employeeOptions =
      this.appConfigurationService.getDropdown(
        MODULE_NAMES.EMPLOYEE,
        CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST
      )() ?? [];

    const assignedEngineerOption: IOptionDropdown | null = assignedEngineer
      ? {
          label: toTitleCase(
            `${assignedEngineer.firstName} ${assignedEngineer.lastName}`.trim()
          ),
          value: assignedEngineer.id,
        }
      : null;

    const associateEngineerOptions: IOptionDropdown[] = assignedEngineerOption
      ? [
          assignedEngineerOption,
          ...employeeOptions.filter(
            opt => opt.value !== assignedEngineerOption.value
          ),
        ]
      : employeeOptions;

    return {
      ...APPLY_ATTENDANCE_FORM_CONFIG,
      fields: {
        ...APPLY_ATTENDANCE_FORM_CONFIG.fields,
        associateEngineerName: {
          ...APPLY_ATTENDANCE_FORM_CONFIG.fields.associateEngineerName,
          selectConfig: {
            optionsDropdown: associateEngineerOptions,
          },
        },
      },
    };
  }

  private loadCurrentStatusDataFromRoute(): void {
    const currentStatusFromResolver = this.activatedRoute.snapshot.data[
      'currentStatus'
    ] as IAttendanceCurrentStatusGetResponseDto;

    if (!currentStatusFromResolver) {
      const routeSegments = [
        ROUTE_BASE_PATHS.ATTENDANCE,
        ROUTES.ATTENDANCE.LIST,
      ];
      void this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }
    const prefilledAttendanceData = this.preparePrefilledFormData(
      currentStatusFromResolver
    );
    this.currentStatusData.set(currentStatusFromResolver);
    this.initialAttendanceData.set(prefilledAttendanceData);
  }

  private preparePrefilledFormData(
    currentStatusFromResolver: IAttendanceCurrentStatusGetResponseDto
  ): IAttendanceApplyFormDto {
    const { company, contractors, vehicle, assignedEngineer } =
      currentStatusFromResolver;
    return {
      locationName: company?.id ?? '',
      clientName: contractors?.[0]?.id ?? company?.id ?? '',
      associateEngineerName: assignedEngineer?.id ?? '',
      associatedVehicle: vehicle?.id ?? '',
      notes: '',
    };
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeApplyAttendance(formData);
  }

  private prepareFormData(): IAttendanceApplyFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private buildActionRequestPayload(
    formData: IAttendanceApplyFormDto
  ): IAttendanceApplyRequestDto {
    const status = this.currentStatusData();
    const action =
      status?.checkInTime && !status?.checkOutTime
        ? EApplyAttendanceAction.CHECK_OUT
        : EApplyAttendanceAction.CHECK_IN;

    const assignmentSnapshot = {
      site: status?.site ?? {},
      company: status?.company ?? {},
      contractors: status?.contractors ?? [],
      vehicle: status?.vehicle ?? null,
      assignedEngineer: status?.assignedEngineer ?? null,
    };

    return {
      action,
      notes:
        formData.notes?.trim() ??
        `${formData.clientName ?? ''} - ${formData.locationName ?? ''}`.trim() ??
        'Check in',
      assignmentSnapshot,
    };
  }

  protected executeApplyAttendance(formData: IAttendanceApplyFormDto): void {
    this.loadingService.show({
      title: 'Apply Attendance',
      message: 'Please wait while we apply attendance...',
    });

    const payload = this.buildActionRequestPayload(formData);
    this.attendanceService
      .applyAttendance(payload)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.loadingService.hide();
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          const routeSegments = [
            ROUTE_BASE_PATHS.ATTENDANCE,
            ROUTES.ATTENDANCE.LIST,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
          this.notificationService.success('Attendance applied successfully');
        },
        error: () => {
          this.notificationService.error('Failed to apply attendance');
        },
      });
  }

  private getAssignmentHeaderButtonConfig(): Partial<IButtonConfig> {
    if (this.isEditingAssignment()) {
      return {
        id: EButtonActionType.SUBMIT,
        icon: ICONS.ACTIONS.CHECK,
        variant: EButtonVariant.TEXT,
        severity: EButtonSeverity.SUCCESS,
      };
    }

    return {
      id: EButtonActionType.EDIT,
      icon: ICONS.ACTIONS.EDIT,
      variant: EButtonVariant.TEXT,
    };
  }

  protected toggleAssignmentEditing(): void {
    this.isEditingAssignment.update(isEditing => !isEditing);
  }

  protected getLocationDisplay(): string {
    const value = this.form?.formGroup?.get('locationName')?.value;
    const options =
      this.appConfigurationService.getDropdown(
        MODULE_NAMES.COMPANY,
        CONFIGURATION_KEYS.COMPANY.COMPANY_LIST
      )() ?? [];
    return (value && getMappedValueFromArrayOfObjects(options, value)) ?? '-';
  }

  protected getClientDisplay(): string {
    const value = this.form?.formGroup?.get('clientName')?.value;
    const options =
      this.appConfigurationService.getDropdown(
        MODULE_NAMES.CONTRACTOR,
        CONFIGURATION_KEYS.CONTRACTOR.CONTRACTOR_LIST
      )() ?? [];
    return (value && getMappedValueFromArrayOfObjects(options, value)) ?? '-';
  }

  protected getAssociateEngineerDisplay(): string {
    const value = this.form?.formGroup?.get('associateEngineerName')?.value;
    const options = this.getAssociateEngineerOptions();
    return (value && getMappedValueFromArrayOfObjects(options, value)) ?? '-';
  }

  protected getAssociatedVehicleDisplay(): string {
    const value = this.form?.formGroup?.get('associatedVehicle')?.value;
    const options =
      this.appConfigurationService.getDropdown(
        MODULE_NAMES.VEHICLE,
        CONFIGURATION_KEYS.VEHICLE.VEHICLE_LIST
      )() ?? [];
    return (value && getMappedValueFromArrayOfObjects(options, value)) ?? '-';
  }

  private getAssociateEngineerOptions(): IOptionDropdown[] {
    const assignedEngineer = this.currentStatusData()?.assignedEngineer;
    const employeeOptions =
      this.appConfigurationService.getDropdown(
        MODULE_NAMES.EMPLOYEE,
        CONFIGURATION_KEYS.EMPLOYEE.EMPLOYEE_LIST
      )() ?? [];
    if (!assignedEngineer) {
      return employeeOptions;
    }
    const assignedOption: IOptionDropdown = {
      label: toTitleCase(
        `${assignedEngineer.firstName} ${assignedEngineer.lastName}`.trim()
      ),
      value: assignedEngineer.id,
    };
    return [
      assignedOption,
      ...employeeOptions.filter(opt => opt.value !== assignedEngineer.id),
    ];
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: 'Apply Attendance',
      subtitle: 'Check in or check out from your assigned location',
      showHeaderButton: false,
    };
  }
}
