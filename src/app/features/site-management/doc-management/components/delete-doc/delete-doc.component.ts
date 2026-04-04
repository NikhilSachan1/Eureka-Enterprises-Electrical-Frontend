import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import { IDialogActionHandler } from '@shared/types';
import { DocService } from '../../services/doc.service';
import { ConfirmationDialogService } from '@shared/services';
import {
  IDocDeleteResponseDto,
  IDocGetBaseResponseDto,
} from '../../types/doc.dto';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-delete-doc',
  imports: [],
  templateUrl: './delete-doc.component.html',
  styleUrl: './delete-doc.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteDocComponent
  extends FormBase
  implements IDialogActionHandler, OnInit
{
  private readonly docService = inject(DocService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IDocGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to delete doc but was not provided'
      );
      return;
    }
  }

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData(this.selectedRecord());
    this.executeDocDeleteAction(formData);
  }

  private prepareFormData(record: IDocGetBaseResponseDto[]): {
    docIds: string[];
  } {
    return {
      docIds: record.map((row: IDocGetBaseResponseDto) => row.id),
    };
  }

  private executeDocDeleteAction(formData: { docIds: string[] }): void {
    const loadingMessage = {
      title: 'Deleting Doc',
      message: 'Please wait while we delete the doc...',
    };
    this.loadingService.show(loadingMessage);

    this.docService
      .deleteDoc(formData.docIds[0])
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (_response: IDocDeleteResponseDto) => {
          this.notificationService.success('Doc deleted successfully');
          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
      });
  }
}
