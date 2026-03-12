import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DsrService } from '@features/site-management/project-management/services/dsr.service';
import {
  IDsrDeleteResponseDto,
  IDsrGetBaseResponseDto,
} from '@features/site-management/project-management/types/project.dto';
import { FormBase } from '@shared/base/form.base';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { ConfirmationDialogService } from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-delete-dsr',
  imports: [],
  templateUrl: './delete-dsr.component.html',
  styleUrl: './delete-dsr.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteDsrComponent
  extends FormBase
  implements IDialogActionHandler, OnInit
{
  private readonly dsrService = inject(DsrService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected readonly selectedRecord =
    input.required<IDsrGetBaseResponseDto[]>();
  protected readonly onSuccess = input<() => void>();

  ngOnInit(): void {
    const record = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to delete DSR but was not provided'
      );
      return;
    }
  }

  onDialogAccept(): void {
    this.handleSubmit();
  }

  protected override handleSubmit(): void {
    const dsrId = this.selectedRecord()[0].id;
    this.executeDsrDeleteAction(dsrId);
  }

  private executeDsrDeleteAction(dsrId: string): void {
    const loadingMessage = {
      title: 'Deleting DSR',
      message: 'Please wait while we delete the DSR...',
    };
    this.loadingService.show(loadingMessage);

    this.dsrService
      .deleteDsr(dsrId)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
          this.isSubmitting.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IDsrDeleteResponseDto) => {
          this.notificationService.success(response.message);

          const successCallback = this.onSuccess();
          successCallback?.();
          this.confirmationDialogService.closeDialog();
        },
      });
  }
}
