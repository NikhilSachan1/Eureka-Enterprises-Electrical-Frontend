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
import { ADD_DSR_FORM_CONFIG } from '@features/site-management/dsr-management/config';
import { DsrService } from '@features/site-management/dsr-management/services/dsr.service';
import {
  IDsrAddFormDto,
  IDsrAddResponseDto,
  IDsrAddUIFormDto,
} from '@features/site-management/dsr-management/types/dsr.dto';
import { ProjectService } from '@features/site-management/project-management/services/project.service';
import { IProjectOverviewGetResponseDto } from '@features/site-management/project-management/types/project.dto';
import {
  applyProjectDateRangeFromOverview,
  resetProjectDateField,
  setProjectDateFieldLoading,
} from '@features/site-management/project-management/utility/project-overview-date.util';
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
  selector: 'app-add-dsr',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './add-dsr.component.html',
  styleUrl: './add-dsr.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddDsrComponent
  extends FormBase<IDsrAddUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly dsrService = inject(DsrService);
  private readonly projectService = inject(ProjectService);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  private trackedAddDsrFields!: ITrackedFields<IDsrAddUIFormDto>;

  protected readonly onSuccess = input.required<() => void>();
  protected readonly projectName = input<string>();

  constructor() {
    super();
    effect(() => {
      if (this.trackedAddDsrFields?.projectName) {
        const projectId = this.trackedAddDsrFields.projectName();
        if (projectId && typeof projectId === 'string') {
          this.loadProjectWorkTypeOptions(projectId);
          return;
        }

        this.resetStatusDateField();
      }
    });
    effect(() => {
      if (this.trackedAddDsrFields?.reportedEngineerName) {
        const engineerName = this.trackedAddDsrFields.reportedEngineerName();
        if (engineerName && typeof engineerName === 'string') {
          this.prefillReportedEngineerContact(engineerName);
        }
      }
    });
  }

  ngOnInit(): void {
    this.form = this.formService.createForm<IDsrAddUIFormDto>(
      ADD_DSR_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: {
          projectName: this.projectName(),
        },
      }
    );

    this.trackedAddDsrFields =
      this.formService.trackMultipleFieldChanges<IDsrAddUIFormDto>(
        this.form.formGroup,
        ['projectName', 'reportedEngineerName'],
        this.destroyRef
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
    this.executeAddDsr(this.form.getData());
  }

  private loadProjectWorkTypeOptions(projectId: string): void {
    setProjectDateFieldLoading(this.form, 'statusDate', true);
    queueMicrotask(() => this.changeDetectorRef.detectChanges());
    this.applyWorkDoneOptions([], true);

    this.projectService
      .getProjectOverview(projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: IProjectOverviewGetResponseDto) => {
          const workTypes = response.site?.workTypes ?? [];
          this.applyWorkDoneOptions(workTypes, false);
          applyProjectDateRangeFromOverview(
            this.form,
            'statusDate',
            ADD_DSR_FORM_CONFIG.fields.statusDate.dateConfig,
            response
          );
          queueMicrotask(() => this.changeDetectorRef.detectChanges());
        },
        error: error => {
          this.logger.error('Failed to load project overview', error);
          this.notificationService.error(
            'Could not load work types for this project. Please try again.'
          );
          this.applyWorkDoneOptions([], false);
          this.resetStatusDateField();
        },
      });
  }

  private resetStatusDateField(): void {
    resetProjectDateField(
      this.form,
      'statusDate',
      ADD_DSR_FORM_CONFIG.fields.statusDate.dateConfig
    );
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

  private executeAddDsr(formData: IDsrAddFormDto): void {
    this.loadingService.show({
      title: 'Adding DSR',
      message:
        "Please wait while we're adding the DSR. This will just take a moment.",
    });
    this.form.disable();

    this.dsrService
      .addDsr(formData)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.form.enable();
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IDsrAddResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Failed to add DSR', error);
          this.notificationService.error('Failed to add DSR.');
        },
      });
  }
}
