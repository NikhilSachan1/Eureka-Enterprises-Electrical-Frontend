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
import { RENAME_MY_FILE_FORM_CONFIG } from '../../config/form/rename-my-file.config';
import { MyFilesService } from '../../services/my-files.service';
import {
  IMyFileBaseResponseDto,
  IMyFilesRenameFormDto,
  IMyFilesRenameResponseDto,
  IMyFilesRenameUIFormDto,
} from '../../types/my-files.dto';

@Component({
  selector: 'app-rename-my-file',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputFieldComponent, ReactiveFormsModule],
  templateUrl: './rename-my-file.component.html',
  styleUrl: './rename-my-file.component.scss',
})
export class RenameMyFileComponent
  extends FormBase<IMyFilesRenameUIFormDto>
  implements OnInit, IDialogActionHandler
{
  private readonly myFilesService = inject(MyFilesService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IMyFileBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord()?.[0];
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error('Rename my file: selected record was not provided');
      return;
    }

    this.form = this.formService.createForm<IMyFilesRenameUIFormDto>(
      RENAME_MY_FILE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: {
          name: record.name,
        },
      }
    );
  }

  onDialogAccept(): void {
    super.onSubmit();
  }

  protected override handleSubmit(): void {
    const [selectedRecord] = this.selectedRecord();
    if (!selectedRecord) {
      return;
    }

    this.executeRenameAction(selectedRecord.id);
  }

  private executeRenameAction(fileId: string): void {
    const formData = this.prepareFormData();

    this.loadingService.show({
      title: 'Renaming',
      message: "We're updating the name. This will just take a moment.",
    });
    this.form.disable();

    this.myFilesService
      .renameMyFile(fileId, formData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
          this.form.enable();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IMyFilesRenameResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.logUserAction('Failed to rename file or folder', error);
          this.notificationService.error(
            'Could not rename the file or folder. Please try again.'
          );
        },
      });
  }

  private prepareFormData(): IMyFilesRenameFormDto {
    return this.form.getData();
  }
}
