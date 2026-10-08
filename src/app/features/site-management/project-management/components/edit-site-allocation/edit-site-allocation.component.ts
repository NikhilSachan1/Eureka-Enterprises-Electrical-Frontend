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
import { IDialogActionHandler, IInputFieldsConfig } from '@shared/types';
import {
  EDIT_SITE_ALLOCATION_FORM_CONFIG,
  ISiteAllocationEditFormDto as ISiteAllocationEditUiFormDto,
} from '../../config/form/edit-site-allocation.config';
import { ProjectService } from '../../services/project.service';
import {
  ISiteAllocationEditFormDto,
  ISiteAllocationEditResponseDto,
  ISiteAllocationGetBaseResponseDto,
} from '../../types/project.dto';
import { parseProjectDateOnly } from '../../utility/project-overview-date.util';

@Component({
  selector: 'app-edit-site-allocation',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './edit-site-allocation.component.html',
  styleUrl: './edit-site-allocation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditSiteAllocationComponent
  extends FormBase<ISiteAllocationEditUiFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly projectService = inject(ProjectService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  private trackedAllocateDate?: Signal<Date | null | undefined>;

  protected readonly selectedRecord =
    input.required<ISiteAllocationGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  constructor() {
    super();

    effect(() => {
      const allocateDate = this.trackedAllocateDate?.();
      if (!this.form) {
        return;
      }

      this.applyReleaseMinDate(allocateDate);
      queueMicrotask(() => this.changeDetectorRef.detectChanges());
    });
  }

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record?.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to edit allocation but was not provided'
      );
      return;
    }

    const allocation = record[0];
    this.form = this.formService.createForm<ISiteAllocationEditUiFormDto>(
      EDIT_SITE_ALLOCATION_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: {
          role: allocation.role?.trim() || undefined,
          allocateDate: parseProjectDateOnly(allocation.allocatedAt),
          releaseDate: parseProjectDateOnly(allocation.deallocatedAt) ?? null,
        },
      }
    );

    this.trackedAllocateDate = this.formService.trackFieldChanges<
      Date | null | undefined
    >(this.form.formGroup, 'allocateDate', this.destroyRef);
    this.applyReleaseMinDate(this.trackedAllocateDate());
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const { id: allocationId } = this.selectedRecord()[0];
    const formData = this.prepareFormData();
    this.executeAllocationEditAction(formData, allocationId);
  }

  private prepareFormData(): ISiteAllocationEditFormDto {
    const formData = this.form.getData();

    return {
      role: formData.role ?? '',
      allocateDate: formData.allocateDate as Date,
      releaseDate: formData.releaseDate ?? null,
    };
  }

  private executeAllocationEditAction(
    formData: ISiteAllocationEditFormDto,
    allocationId: string
  ): void {
    const loadingMessage = {
      title: 'Updating Allocation',
      message: "We're updating the allocation. This will just take a moment.",
    };
    this.loadingService.show(loadingMessage);

    this.projectService
      .updateSiteAllocation(formData, allocationId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ISiteAllocationEditResponseDto) => {
          this.notificationService.success(response.message);
          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
      });
  }

  private applyReleaseMinDate(allocateDate: Date | null | undefined): void {
    const minDate = parseProjectDateOnly(allocateDate);
    const base = this.form.fieldConfigs.releaseDate;
    if (!base) {
      return;
    }

    this.form.fieldConfigs.releaseDate = {
      ...base,
      dateConfig: {
        ...base.dateConfig,
        minDate,
      },
    } as IInputFieldsConfig;

    const control = this.form.formGroup.get('releaseDate');
    const releaseDate = parseProjectDateOnly(
      control?.value instanceof Date ? control.value : undefined
    );
    if (minDate && releaseDate && releaseDate.getTime() < minDate.getTime()) {
      control?.setValue(null);
    }
  }
}
