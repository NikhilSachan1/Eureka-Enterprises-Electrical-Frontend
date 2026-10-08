import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  OnInit,
  signal,
  Signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { FormBase } from '@shared/base/form.base';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ConfirmationDialogService } from '@shared/services';
import { IDialogActionHandler, IInputFieldsConfig } from '@shared/types';
import {
  EDIT_SITE_ALLOCATION_FORM_CONFIG,
  ISiteAllocationEditFormDto,
} from '../../config/form/edit-site-allocation.config';
import { ProjectService } from '../../services/project.service';
import { ISiteAllocationGetBaseResponseDto } from '../../types/project.dto';
import { parseProjectDateOnly } from '../../utility/project-overview-date.util';

@Component({
  selector: 'app-edit-site-allocation',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './edit-site-allocation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditSiteAllocationComponent
  extends FormBase<ISiteAllocationEditFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly projectService = inject(ProjectService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  private trackedAllocateDate?: Signal<Date | null | undefined>;
  private readonly formReady = signal(false);

  public readonly selectedRecord = input<ISiteAllocationGetBaseResponseDto[]>(
    []
  );
  public readonly onSuccess = input<() => void>();

  constructor() {
    super();

    effect(() => {
      const record = this.selectedRecord()[0];
      if (!this.formReady() || !record) {
        return;
      }

      this.form.formGroup.patchValue({
        role: record.role?.trim() || null,
        allocateDate: parseProjectDateOnly(record.allocatedAt) ?? null,
        releaseDate: parseProjectDateOnly(record.deallocatedAt) ?? null,
      });
      queueMicrotask(() => this.changeDetectorRef.detectChanges());
    });

    effect(() => {
      const allocateDate = this.trackedAllocateDate?.();
      if (!this.form) {
        return;
      }

      const minDate = parseProjectDateOnly(allocateDate);
      const base = this.form.fieldConfigs.releaseDate;
      if (base) {
        this.form.fieldConfigs.releaseDate = {
          ...base,
          dateConfig: {
            ...base.dateConfig,
            minDate,
          },
        } as IInputFieldsConfig;
      }

      const control = this.form.formGroup.get('releaseDate');
      const releaseDate = parseProjectDateOnly(
        control?.value instanceof Date ? control.value : undefined
      );
      if (minDate && releaseDate && releaseDate.getTime() < minDate.getTime()) {
        control?.setValue(null);
      }

      queueMicrotask(() => this.changeDetectorRef.detectChanges());
    });
  }

  ngOnInit(): void {
    const record = this.selectedRecord()[0];
    this.form = this.formService.createForm<ISiteAllocationEditFormDto>(
      EDIT_SITE_ALLOCATION_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: {
          role: record?.role?.trim() || undefined,
          allocateDate: parseProjectDateOnly(record?.allocatedAt),
          releaseDate: parseProjectDateOnly(record?.deallocatedAt) ?? null,
        },
      }
    );

    this.trackedAllocateDate = this.formService.trackFieldChanges<
      Date | null | undefined
    >(this.form.formGroup, 'allocateDate', this.destroyRef);
    this.formReady.set(true);
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const record = this.selectedRecord()[0];
    if (!record) {
      return;
    }

    const formData = this.form.getData();
    if (!formData.allocateDate || !formData.role) {
      return;
    }

    this.loadingService.show({
      title: 'Updating allocation',
      message: 'Please wait while the allocation is saved.',
    });
    this.form.disable();

    this.projectService
      .updateSiteAllocation(
        {
          role: formData.role,
          allocateDate: formData.allocateDate,
          releaseDate: formData.releaseDate ?? null,
        },
        record.id
      )
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: response => {
          const message = response.message?.trim();
          this.notificationService.success(
            message && message.length > 0
              ? message
              : 'Allocation updated successfully'
          );
          this.onSuccess()?.();
          this.confirmationDialogService.closeDialog();
        },
        error: (error: unknown) => {
          this.logger.error('Edit site allocation failed', error);
        },
      });
  }
}
