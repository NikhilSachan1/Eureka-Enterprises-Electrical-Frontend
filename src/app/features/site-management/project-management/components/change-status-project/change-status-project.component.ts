import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import {
  IProjectChangeStatusFormDto,
  IProjectChangeStatusResponseDto,
  IProjectGetBaseResponseDto,
} from '../../types/project.dto';
import { ConfirmationDialogService } from '@shared/services';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ProjectService } from '../../services/project.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IDialogActionHandler } from '@shared/types';
import { CHANGE_STATUS_PROJECT_FORM_CONFIG } from '../../config';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-change-status-project',
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './change-status-project.component.html',
  styleUrl: './change-status-project.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeStatusProjectComponent
  extends FormBase<IProjectChangeStatusFormDto>
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
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to change status of project but was not provided'
      );
      return;
    }

    this.form = this.formService.createForm<IProjectChangeStatusFormDto>(
      CHANGE_STATUS_PROJECT_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const { id: projectId } = this.selectedRecord()[0];

    const formData = this.prepareFormData();
    this.executeProjectChangeStatusAction(formData, projectId);
  }

  private prepareFormData(): IProjectChangeStatusFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeProjectChangeStatusAction(
    formData: IProjectChangeStatusFormDto,
    projectId: string
  ): void {
    const loadingMessage = {
      title: 'Changing Project Status',
      message: 'Please wait while we change the project status...',
    };
    this.loadingService.show(loadingMessage);

    this.projectService
      .changeProjectStatus(formData, projectId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IProjectChangeStatusResponseDto) => {
          this.notificationService.success(response.message);
          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
      });
  }
}
