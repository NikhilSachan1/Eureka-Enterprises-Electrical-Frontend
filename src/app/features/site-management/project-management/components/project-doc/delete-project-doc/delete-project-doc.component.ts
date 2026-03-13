import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProjectDocService } from '@features/site-management/project-management/services/project-doc.service';
import type {
  ISiteDocumentDeleteResponseDto,
  ISiteDocumentGetBaseResponseDto,
} from '@features/site-management/project-management/types/project.dto';
import { FormBase } from '@shared/base/form.base';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ConfirmationDialogService } from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-delete-project-doc',
  imports: [],
  templateUrl: './delete-project-doc.component.html',
  styleUrl: './delete-project-doc.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteProjectDocComponent
  extends FormBase
  implements IDialogActionHandler, OnInit
{
  private readonly projectDocService = inject(ProjectDocService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<Record<string, unknown>[]>();
  protected readonly onSuccess = input<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record?.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
    }
  }

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    const rows = this.selectedRecord();
    const first = rows[0];
    const raw = first?.['originalRawData'] as
      | ISiteDocumentGetBaseResponseDto
      | undefined;
    const id = raw?.id ?? (first?.['id'] as string);
    if (!id) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      return;
    }
    this.executeDelete(id);
  }

  private executeDelete(id: string): void {
    this.loadingService.show({
      title: 'Deleting Document',
      message: 'Please wait...',
    });

    this.projectDocService
      .delete(id)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ISiteDocumentDeleteResponseDto) => {
          this.notificationService.success(
            response.message ?? 'Document deleted'
          );

          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
      });
  }
}
