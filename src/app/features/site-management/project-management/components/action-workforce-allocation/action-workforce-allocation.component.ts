import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  OnInit,
  Signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { FormBase } from '@shared/base/form.base';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ConfirmationDialogService } from '@shared/services';
import {
  EButtonActionType,
  IDialogActionHandler,
  IInputFieldsConfig,
} from '@shared/types';
import { toTitleCase } from '@shared/utility';
import {
  IWorkforceAllocationActionFormDto,
  WORKFORCE_ALLOCATION_ACTION_FORM_CONFIG,
} from '../../config/form/action-workforce-allocation.config';
import { ProjectService } from '../../services/project.service';
import {
  IWorkforceAllocationGetBaseResponseDto,
  IWorkforceAllocationManageFormDto,
  IWorkforceAllocationManageResponseDto,
} from '../../types/project.dto';
import {
  applyProjectDateRangeFromOverview,
  applyProjectDateRangeFromSite,
  IProjectSiteDateRange,
  parseProjectDateOnly,
  resetProjectDateField,
  setProjectDateFieldLoading,
} from '../../utility/project-overview-date.util';

@Component({
  selector: 'app-action-workforce-allocation',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './action-workforce-allocation.component.html',
  styleUrl: './action-workforce-allocation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionWorkforceAllocationComponent
  extends FormBase<IWorkforceAllocationActionFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly projectService = inject(ProjectService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  private trackedReleaseDate?: Signal<Date | null | undefined>;
  private trackedProjectName?: Signal<string | null | undefined>;

  protected readonly selectedRecord =
    input.required<IWorkforceAllocationGetBaseResponseDto[]>();
  protected readonly dialogActionType = input.required<EButtonActionType>();
  protected readonly onSuccess = input<() => void>();

  protected readonly EButtonActionTypeEnum = EButtonActionType;

  constructor() {
    super();
    effect(() => {
      const releaseDate = this.trackedReleaseDate?.();
      if (
        this.dialogActionType() !== EButtonActionType.TRANSFER ||
        !this.form
      ) {
        return;
      }

      this.applyTransferAllocateReleaseMin(releaseDate);
      this.clearDateIfBeforeMin('allocateDate', releaseDate);
      queueMicrotask(() => this.changeDetectorRef.detectChanges());
    });

    effect(() => {
      const projectId = this.trackedProjectName?.();
      if (
        !this.form ||
        (this.dialogActionType() !== EButtonActionType.ALLOCATE &&
          this.dialogActionType() !== EButtonActionType.TRANSFER)
      ) {
        return;
      }

      if (projectId && typeof projectId === 'string') {
        this.loadTargetProjectDateRange(projectId);
        return;
      }

      this.resetAllocateDateField();
    });
  }

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record?.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required for workforce allocation action but was not provided'
      );
      return;
    }

    const actionType = this.dialogActionType();
    this.form = this.formService.createForm<IWorkforceAllocationActionFormDto>(
      WORKFORCE_ALLOCATION_ACTION_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        context: {
          actionType,
        },
      }
    );

    if (
      actionType === EButtonActionType.DEALLOCATE ||
      actionType === EButtonActionType.TRANSFER
    ) {
      this.applyReleaseDateRangeFromCurrentProject(record[0]?.currentProject);
      this.trackedReleaseDate = this.formService.trackFieldChanges<
        Date | null | undefined
      >(this.form.formGroup, 'releaseDate', this.destroyRef);
    }

    if (
      actionType === EButtonActionType.ALLOCATE ||
      actionType === EButtonActionType.TRANSFER
    ) {
      this.trackedProjectName = this.formService.trackFieldChanges<
        string | null | undefined
      >(this.form.formGroup, 'projectName', this.destroyRef);
    }

    if (actionType === EButtonActionType.TRANSFER) {
      this.form.fieldConfigs.projectName = {
        ...this.form.fieldConfigs.projectName,
        label: 'New Project',
      };
    }
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const payload = this.prepareFormData();
    const actionType = this.dialogActionType();
    const loadingCopy = this.getLoadingCopy(actionType);

    this.loadingService.show(loadingCopy);
    this.form.disable();

    this.projectService
      .manageWorkforceAllocation(payload)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IWorkforceAllocationManageResponseDto) => {
          this.showResponseNotification(
            response,
            this.selectedRecord()[0]?.employeeName ?? ''
          );
          this.onSuccess()?.();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.error('Workforce allocation action failed', error);
          this.notificationService.error(
            'Could not update workforce allocation. Please try again.'
          );
        },
      });
  }

  private prepareFormData(): IWorkforceAllocationManageFormDto {
    const record = this.selectedRecord()[0];

    return {
      ...this.form.getData(),
      actionType:
        this.dialogActionType() as IWorkforceAllocationManageFormDto['actionType'],
      userId: record.userId,
      allocationId: record.currentProject?.allocationId ?? null,
    };
  }

  private getLoadingCopy(actionType: EButtonActionType): {
    title: string;
    message: string;
  } {
    if (actionType === EButtonActionType.ALLOCATE) {
      return {
        title: 'Allocating employees',
        message: 'Please wait while employees are being allocated.',
      };
    }

    if (actionType === EButtonActionType.DEALLOCATE) {
      return {
        title: 'Deallocating employees',
        message: 'Please wait while employees are being deallocated.',
      };
    }

    return {
      title: 'Transferring employee',
      message: 'Please wait while the employee is being transferred.',
    };
  }

  private showResponseNotification(
    response: IWorkforceAllocationManageResponseDto,
    employeeName: string
  ): void {
    const name = toTitleCase(employeeName || 'Employee');
    const allocationResult = response.allocations?.results?.[0];
    const deallocationResult = response.deallocations?.results?.[0];
    const failedResult =
      allocationResult?.success === false
        ? allocationResult
        : deallocationResult?.success === false
          ? deallocationResult
          : undefined;

    if (failedResult) {
      this.notificationService.warning(
        `${name} — ${this.formatOperationFailureMessage(failedResult.message)}`,
        response.message
      );
      return;
    }

    this.notificationService.success(response.message, 'Workforce allocation');
  }

  private formatOperationFailureMessage(message?: string | null): string {
    const trimmed = (message ?? '').trim();
    const cleaned = trimmed.replace(/^employee\b\s*/i, '').trim();
    return cleaned.length > 0 ? cleaned : 'Operation failed.';
  }

  private loadTargetProjectDateRange(projectId: string): void {
    setProjectDateFieldLoading(this.form, 'allocateDate', true);
    queueMicrotask(() => this.changeDetectorRef.detectChanges());

    this.projectService
      .getProjectOverview(projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: overview => {
          applyProjectDateRangeFromOverview(
            this.form,
            'allocateDate',
            WORKFORCE_ALLOCATION_ACTION_FORM_CONFIG.fields.allocateDate
              .dateConfig,
            overview
          );
          this.applyTransferAllocateReleaseMin(this.trackedReleaseDate?.());
          queueMicrotask(() => this.changeDetectorRef.detectChanges());
        },
        error: error => {
          this.logger.error('Failed to load project overview for dates', error);
          this.resetAllocateDateField();
        },
      });
  }

  private applyReleaseDateRangeFromCurrentProject(
    currentProject: IWorkforceAllocationGetBaseResponseDto['currentProject']
  ): void {
    if (!currentProject) {
      return;
    }

    applyProjectDateRangeFromSite(
      this.form,
      'releaseDate',
      WORKFORCE_ALLOCATION_ACTION_FORM_CONFIG.fields.releaseDate.dateConfig,
      currentProject as IProjectSiteDateRange
    );
    queueMicrotask(() => this.changeDetectorRef.detectChanges());
  }

  private resetAllocateDateField(): void {
    resetProjectDateField(
      this.form,
      'allocateDate',
      WORKFORCE_ALLOCATION_ACTION_FORM_CONFIG.fields.allocateDate.dateConfig
    );
    queueMicrotask(() => this.changeDetectorRef.detectChanges());
  }

  private applyTransferAllocateReleaseMin(
    releaseDate: Date | null | undefined
  ): void {
    if (this.dialogActionType() !== EButtonActionType.TRANSFER) {
      return;
    }

    const base = this.form.fieldConfigs.allocateDate;
    if (!base) {
      return;
    }

    const releaseMin = parseProjectDateOnly(releaseDate);
    const projectMin = base.dateConfig?.minDate;
    const minDate = this.resolveMinDate(projectMin, releaseMin);

    this.form.fieldConfigs.allocateDate = {
      ...base,
      dateConfig: {
        ...base.dateConfig,
        minDate,
      },
    } as IInputFieldsConfig;
  }

  private resolveMinDate(
    projectMin?: Date,
    releaseMin?: Date
  ): Date | undefined {
    if (projectMin && releaseMin) {
      return projectMin.getTime() >= releaseMin.getTime()
        ? projectMin
        : releaseMin;
    }

    return projectMin ?? releaseMin;
  }

  private clearDateIfBeforeMin(
    fieldName: 'allocateDate' | 'releaseDate',
    minValue: unknown
  ): void {
    const minDate = parseProjectDateOnly(
      minValue instanceof Date ? minValue : undefined
    );
    if (!minDate) {
      return;
    }

    const control = this.form.formGroup.get(fieldName);
    const value = parseProjectDateOnly(
      control?.value instanceof Date ? control.value : undefined
    );

    if (value && value.getTime() < minDate.getTime()) {
      control?.setValue(null);
    }
  }
}
