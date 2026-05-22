import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import {
  ADD_DSR_FORM_CONFIG,
  FORCE_DSR_FORM_CONFIG,
} from '@features/site-management/dsr-management/config';
import { DsrService } from '@features/site-management/dsr-management/services/dsr.service';
import {
  IDsrForceFormDto,
  IDsrForceResponseDto,
  IDsrForceUIFormDto,
} from '@features/site-management/dsr-management/types/dsr.dto';
import { ProjectService } from '@features/site-management/project-management/services/project.service';
import { ProjectWorkspaceContextService } from '@features/site-management/project-management/services/project-workspace-context.service';
import { IProjectOverviewGetResponseDto } from '@features/site-management/project-management/types/project.dto';
import { FormBase } from '@shared/base/form.base';
import {
  AppConfigurationService,
  ConfirmationDialogService,
} from '@shared/services';
import {
  IDialogActionHandler,
  IInputFieldsConfig,
  ITrackedFields,
} from '@shared/types';
import { finalize } from 'rxjs';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { IEmployeeGetBaseResponseDto } from '@features/employee-management/types/employee.dto';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';

@Component({
  selector: 'app-force-dsr',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './force-dsr.component.html',
  styleUrl: './force-dsr.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForceDsrComponent
  extends FormBase<IDsrForceUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly dsrService = inject(DsrService);
  private readonly projectService = inject(ProjectService);
  private readonly projectWorkspaceContext = inject(
    ProjectWorkspaceContextService
  );
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  private trackedForceDsrFields!: ITrackedFields<IDsrForceUIFormDto>;

  protected readonly onSuccess = input.required<() => void>();
  protected readonly projectName = input<string>();

  constructor() {
    super();
    effect(() => {
      if (this.trackedForceDsrFields?.projectName) {
        const projectId = this.trackedForceDsrFields.projectName();
        if (projectId && typeof projectId === 'string') {
          this.loadProjectOverviewOptions(projectId);
        }
      }
    });
    effect(() => {
      if (this.trackedForceDsrFields?.reportedEngineerName) {
        const engineerName = this.trackedForceDsrFields.reportedEngineerName();
        if (engineerName && typeof engineerName === 'string') {
          this.prefillReportedEngineerContact(engineerName);
        }
      }
    });
  }

  ngOnInit(): void {
    this.form = this.formService.createForm<IDsrForceUIFormDto>(
      FORCE_DSR_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: {
          projectName: this.projectName(),
        },
      }
    );

    this.trackedForceDsrFields =
      this.formService.trackMultipleFieldChanges<IDsrForceUIFormDto>(
        this.form.formGroup,
        ['projectName', 'reportedEngineerName'],
        this.destroyRef
      );
    this.projectWorkspaceContext.patchDateField(
      this.form.fieldConfigs,
      'statusDate',
      this.changeDetectorRef
    );
  }

  private prefillReportedEngineerContact(engineerName: string): void {
    const employee = getMappedValueFromArrayOfObjects(
      this.appConfigurationService.employeeList(),
      engineerName,
      'label',
      'data'
    ) as IEmployeeGetBaseResponseDto | string;

    if (!employee || typeof employee !== 'object' || !employee.contactNumber) {
      return;
    }

    this.form.patch({
      reportedEngineerContact: Number(employee.contactNumber),
    });
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    this.executeForceDsr(this.form.getData());
  }

  private loadProjectOverviewOptions(projectId: string): void {
    this.applyEmployeeOptions([], true);
    this.applyWorkDoneOptions([], true);

    this.projectService
      .getProjectOverview(projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: IProjectOverviewGetResponseDto) => {
          const allocatedEmployees = response.employees?.allocated ?? [];
          const deallocatedEmployees = response.employees?.deallocated ?? [];
          const availableEmployeeNames = [
            ...allocatedEmployees,
            ...deallocatedEmployees,
          ]
            .map(employee => employee?.userId)
            .filter((userId): userId is string => !!userId);
          const workTypes = response.site?.workTypes ?? [];

          this.applyEmployeeOptions(availableEmployeeNames, false);
          this.applyWorkDoneOptions(workTypes, false);
          if (response.site) {
            this.projectWorkspaceContext.patchDateField(
              this.form.fieldConfigs,
              'statusDate',
              this.changeDetectorRef,
              response.site
            );
          }
        },
        error: error => {
          this.logger.error('Failed to load project overview', error);
          this.notificationService.error(
            'Could not load project details. Please try again.'
          );
          this.applyEmployeeOptions([], false);
          this.applyWorkDoneOptions([], false);
        },
      });
  }

  private applyEmployeeOptions(
    availableEmployeeNames: string[],
    loading: boolean
  ): void {
    const defaultSelectConfig =
      FORCE_DSR_FORM_CONFIG.fields.employeeName.selectConfig;
    if (!defaultSelectConfig) {
      return;
    }

    const hasEmployees = availableEmployeeNames.length > 0;
    const base = this.form.fieldConfigs.employeeName;

    this.form.fieldConfigs.employeeName = {
      ...base,
      selectConfig: {
        ...defaultSelectConfig,
        ...(hasEmployees
          ? {
              filterOptions: {
                include: availableEmployeeNames,
              },
            }
          : {
              optionsDropdown: [],
              dynamicDropdown: undefined,
              filterOptions: undefined,
              emptyMessage: 'No employee found',
            }),
        loading,
      },
    } as IInputFieldsConfig;

    queueMicrotask(() => this.changeDetectorRef.detectChanges());
  }

  private applyWorkDoneOptions(workTypes: string[], loading: boolean): void {
    const defaultMultiSelectConfig =
      ADD_DSR_FORM_CONFIG.fields.workDone.multiSelectConfig;
    if (!defaultMultiSelectConfig) {
      return;
    }

    const hasWorkTypes = workTypes.length > 0;
    const base = this.form.fieldConfigs.workDone;

    this.form.fieldConfigs.workDone = {
      ...base,
      multiSelectConfig: {
        ...defaultMultiSelectConfig,
        ...(hasWorkTypes
          ? {
              filterOptions: {
                include: workTypes,
              },
            }
          : {
              optionsDropdown: [],
              dynamicDropdown: undefined,
              filterOptions: undefined,
              emptyMessage: 'No work type found',
            }),
        loading,
      },
    } as IInputFieldsConfig;

    queueMicrotask(() => this.changeDetectorRef.detectChanges());
  }

  private executeForceDsr(formData: IDsrForceFormDto): void {
    this.loadingService.show({
      title: 'Force DSR',
      message:
        "Please wait while we're adding the DSR on behalf of the employee. This will just take a moment.",
    });
    this.form.disable();

    this.dsrService
      .forceDsr(formData)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.form.enable();
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IDsrForceResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to force DSR', error);
          this.notificationService.error('Failed to force DSR.');
        },
      });
  }
}
