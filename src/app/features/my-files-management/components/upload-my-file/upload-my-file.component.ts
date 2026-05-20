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
import { UPLOAD_MY_FILE_FORM_CONFIG } from '../../config/form/upload-my-file.config';
import { MyFilesService } from '../../services/my-files.service';
import {
  IMyFilesUploadFormDto,
  IMyFilesUploadResponseDto,
  IMyFilesUploadUIFormDto,
} from '../../types/my-files.dto';

@Component({
  selector: 'app-upload-my-file',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './upload-my-file.component.html',
  styleUrl: './upload-my-file.component.scss',
})
export class UploadMyFileComponent
  extends FormBase<IMyFilesUploadUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly myFilesService = inject(MyFilesService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly parentId = input<string | null>(null);
  protected readonly onSuccess = input.required<() => void>();

  ngOnInit(): void {
    this.form = this.formService.createForm<IMyFilesUploadUIFormDto>(
      UPLOAD_MY_FILE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: {
          files: [],
        },
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    this.executeUploadAction();
  }

  private executeUploadAction(): void {
    const formData = this.prepareFormData();

    this.loadingService.show({
      title: 'Uploading Files',
      message: "We're uploading your files. This will just take a moment.",
    });
    this.form.disable();

    this.myFilesService
      .uploadMyFile(formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IMyFilesUploadResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.logUserAction('Failed to upload files', error);
          this.notificationService.error(
            'Could not upload the files. Please try again.'
          );
        },
      });
  }

  private prepareFormData(): IMyFilesUploadFormDto {
    return {
      ...this.form.getData(),
      parentId: this.parentId(),
    };
  }
}
