import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { FormBase } from '@shared/base/form.base';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ConfirmationDialogService } from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { ASSIGN_PROJECT_STAKEHOLDERS_FORM_CONFIG } from '../../config';
import { ProjectService } from '../../services/project.service';
import {
  IProjectAssignStakeholdersFormDto,
  IProjectGetBaseResponseDto,
} from '../../types/project.dto';

@Component({
  selector: 'app-assign-project-stakeholders',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './assign-project-stakeholders.component.html',
  styleUrl: './assign-project-stakeholders.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignProjectStakeholdersComponent
  extends FormBase<IProjectAssignStakeholdersFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly projectService = inject(ProjectService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IProjectGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record?.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to assign vendor but was not provided'
      );
      return;
    }

    this.form =
      this.formService.createForm<IProjectAssignStakeholdersFormDto>(
        ASSIGN_PROJECT_STAKEHOLDERS_FORM_CONFIG,
        {
          destroyRef: this.destroyRef,
          defaultValues: this.getPrefillValues(record[0]),
        }
      );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const { id: projectId } = this.selectedRecord()[0];
    this.executeAssignStakeholders(this.form.getData(), projectId);
  }

  private getPrefillValues(
    record: IProjectGetBaseResponseDto
  ): IProjectAssignStakeholdersFormDto {
    return {
      vendorNames: record.vendors?.map(vendor => vendor.id) ?? [],
    };
  }

  private executeAssignStakeholders(
    formData: IProjectAssignStakeholdersFormDto,
    projectId: string
  ): void {
    this.loadingService.show({
      title: 'Assigning vendor',
      message:
        "We're updating vendor assignment. This will just take a moment.",
    });
    this.form.disable();

    this.projectService
      .assignProjectStakeholders(formData, projectId)
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
          this.notificationService.success(
            response.message || 'Vendor assigned successfully'
          );
          this.onSuccess()?.();
          this.confirmationDialogService.closeDialog();
        },
        error: () => {
          this.notificationService.error(
            'Failed to assign vendor'
          );
        },
      });
  }
}
