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
import { ConfirmationDialogService } from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { CREATE_MY_FILE_FOLDER_FORM_CONFIG } from '../../config/form/create-my-file-folder.config';
import { MyFilesService } from '../../services/my-files.service';
import {
  IMyFilesCreateFolderFormDto,
  IMyFilesCreateFolderResponseDto,
  IMyFilesCreateFolderUIFormDto,
} from '../../types/my-files.dto';

@Component({
  selector: 'app-create-my-file-folder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './create-my-file-folder.component.html',
  styleUrl: './create-my-file-folder.component.scss',
})
export class CreateMyFileFolderComponent
  extends FormBase<IMyFilesCreateFolderUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly myFilesService = inject(MyFilesService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly parentId = input<string | null>(null);
  protected readonly onSuccess = input.required<() => void>();

  ngOnInit(): void {
    this.form = this.formService.createForm<IMyFilesCreateFolderUIFormDto>(
      CREATE_MY_FILE_FOLDER_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    this.executeCreateFolderAction();
  }

  private executeCreateFolderAction(): void {
    const formData = this.prepareFormData();

    this.loadingService.show({
      title: 'Creating Folder',
      message: "We're creating your folder. This will just take a moment.",
    });
    this.form.disable();

    this.myFilesService
      .createMyFileFolder(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IMyFilesCreateFolderResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.logUserAction('Failed to create folder', error);
          this.notificationService.error(
            'Could not create the folder. Please try again.'
          );
        },
      });
  }

  private prepareFormData(): IMyFilesCreateFolderFormDto {
    return {
      ...this.form.getData(),
      parentId: this.parentId(),
    };
  }
}
