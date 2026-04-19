import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import { AttendanceService } from '../../services/attendance.service';
import {
  AppConfigurationService,
  RouterNavigationService,
} from '@shared/services';
import { IPageHeaderConfig, ITrackedFields } from '@shared/types';
import { FORCE_ATTENDANCE_FORM_CONFIG } from '../../config';
import {
  IAttendanceCurrentStatusGetFormDto,
  IAttendanceCurrentStatusGetResponseDto,
  IAttendanceForceFormDto,
  IAttendanceForceUIFormDto,
} from '@features/attendance-management/types/attendance.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { finalize } from 'rxjs';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBase } from '@shared/base/form.base';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { ICompanyGetBaseResponseDto } from '@features/site-management/company-management/types/company.dto';
import { IContractorGetBaseResponseDto } from '@features/site-management/contractor-management/types/contractor.dto';
import { VehicleBaseSchema } from '@features/transport-management/vehicle-management/schemas/base-vehicle.schema';
import { EmployeeBaseSchema } from '@features/employee-management/schemas/base-employee.schema';
import type { z } from 'zod';

type VehicleApplyValue = z.infer<typeof VehicleBaseSchema>;
type EmployeeApplyValue = z.infer<typeof EmployeeBaseSchema>;

@Component({
  selector: 'app-force-attendance',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './force-attendance.component.html',
  styleUrl: './force-attendance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForceAttendanceComponent
  extends FormBase<IAttendanceForceUIFormDto>
  implements OnInit
{
  private readonly attendanceService = inject(AttendanceService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  private trackedAttendanceFields!: ITrackedFields<IAttendanceForceUIFormDto>;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  constructor() {
    super();
    effect(() => {
      if (
        this.trackedAttendanceFields &&
        this.trackedAttendanceFields.employeeName
      ) {
        const employeeName = this.trackedAttendanceFields.employeeName();
        if (employeeName && typeof employeeName === 'string') {
          this.loadEmployeeCurrentStatusDetail(employeeName);
        }
      }
    });
  }

  ngOnInit(): void {
    this.form = this.formService.createForm<IAttendanceForceUIFormDto>(
      FORCE_ATTENDANCE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    const trackedFields: (keyof IAttendanceForceUIFormDto)[] = ['employeeName'];
    this.trackedAttendanceFields =
      this.formService.trackMultipleFieldChanges<IAttendanceForceUIFormDto>(
        this.form.formGroup,
        trackedFields,
        this.destroyRef
      );

    // this.loadMockData(FORCE_ATTENDANCE_PREFILLED_DATA);
  }

  private loadEmployeeCurrentStatusDetail(employeeName: string): void {
    this.loadingService.show({
      title: 'Loading employee assignment',
      message:
        "We're loading the employee assignment. This will just take a moment.",
    });

    const paramData = this.prepareParamDataForCurrentStatusDetail(employeeName);

    this.attendanceService
      .getAttendanceCurrentStatus(paramData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAttendanceCurrentStatusGetResponseDto) => {
          const prefilledAttendanceData =
            this.preparePrefilledFormData(response);
          this.form.patch(prefilledAttendanceData);
        },
        error: error => {
          this.logger.error(
            'Error loading employee current status detail',
            error
          );
        },
      });
  }

  private prepareParamDataForCurrentStatusDetail(
    employeeName: string
  ): IAttendanceCurrentStatusGetFormDto {
    return {
      employeeName,
    };
  }

  private preparePrefilledFormData(
    response: IAttendanceCurrentStatusGetResponseDto
  ): Partial<IAttendanceForceUIFormDto> {
    return {
      company: response.company?.id ?? null,
      contractors: response.contractors?.map(c => c?.id ?? '') ?? [],
      vehicle: response.vehicle?.id ?? null,
    };
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeForceAttendance(formData);
  }

  private prepareFormData(): IAttendanceForceFormDto {
    const formData = this.form.getData();
    const companyId = formData.company;
    const vehicleId = formData.vehicle;
    const engineerId = formData.assignedEngineer;

    return {
      ...formData,
      remark: formData.remark?.trim() ? formData.remark.trim() : null,
      company: this.isBlankId(companyId)
        ? null
        : ((getMappedValueFromArrayOfObjects(
            this.appConfigurationService.companyList(),
            companyId,
            'value',
            'data'
          ) as ICompanyGetBaseResponseDto) ?? null),
      contractors: formData.contractors.map(c =>
        this.isBlankId(c)
          ? null
          : ((getMappedValueFromArrayOfObjects(
              this.appConfigurationService.contractorList(),
              c,
              'value',
              'data'
            ) as IContractorGetBaseResponseDto) ?? null)
      ),
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
    } satisfies IAttendanceForceFormDto;
  }

  private isBlankId(
    value: string | null | undefined
  ): value is null | undefined | '' {
    return value === null || value === undefined || value === '';
  }

  private executeForceAttendance(formData: IAttendanceForceFormDto): void {
    this.loadingService.show({
      title: 'Recording attendance',
      message: "We're recording attendance. This will just take a moment.",
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
