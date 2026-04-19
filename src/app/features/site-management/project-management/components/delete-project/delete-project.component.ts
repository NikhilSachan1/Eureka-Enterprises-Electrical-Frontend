import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ConfirmationDialogService } from '@shared/services';
import {
  IProjectDeleteFormDto,
  IProjectDeleteResponseDto,
  IProjectGetBaseResponseDto,
} from '../../types/project.dto';
import { ProjectService } from '../../services/project.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EButtonActionType } from '@shared/types';

@Component({
  selector: 'app-delete-project',
  imports: [],
  templateUrl: './delete-project.component.html',
  styleUrl: './delete-project.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteProjectComponent
  extends FormBase<IProjectDeleteFormDto>
  implements OnInit
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
        'Selected record is required to delete project but was not provided'
      );
      return;
    }
  }

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData(this.selectedRecord());
    this.executeProjectDeleteAction(formData);
  }

  private prepareFormData(
    record: IProjectGetBaseResponseDto[]
  ): IProjectDeleteFormDto {
    return {
      projectIds: record.map((row: IProjectGetBaseResponseDto) => row.id),
    };
  }

  private executeProjectDeleteAction(formData: IProjectDeleteFormDto): void {
    const loadingMessage = {
      title: 'Deleting Project',
      message: "We're removing the project. This will just take a moment.",
    };
    this.loadingService.show(loadingMessage);

    this.projectService
      .deleteProject(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IProjectDeleteResponseDto) => {
          this.notificationService.bulkOperationFromApiResponse(
            response,
            'project',
            EButtonActionType.DELETE
          );

          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
      });
  }
}
