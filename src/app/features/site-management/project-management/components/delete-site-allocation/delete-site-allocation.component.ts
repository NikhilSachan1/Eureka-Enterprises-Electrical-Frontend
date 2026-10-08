import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, throwError } from 'rxjs';
import { LoggerService } from '@core/services';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import {
  ConfirmationDialogService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { ProjectService } from '../../services/project.service';
import {
  ISiteAllocationDeleteResponseDto,
  ISiteAllocationGetBaseResponseDto,
} from '../../types/project.dto';

@Component({
  selector: 'app-delete-site-allocation',
  imports: [],
  templateUrl: './delete-site-allocation.component.html',
  styleUrl: './delete-site-allocation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteSiteAllocationComponent
  implements OnInit, IDialogActionHandler
{
  private readonly projectService = inject(ProjectService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly selectedRecord =
    input.required<ISiteAllocationGetBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  private allocationId?: string;

  ngOnInit(): void {
    const rows = this.selectedRecord();
    if (!rows?.length) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error(
        'Selected record is required to delete allocation but was not provided'
      );
      return;
    }

    this.allocationId = rows[0].id;
  }

  onDialogAccept(): void {
    if (!this.allocationId) {
      return;
    }

    this.executeAllocationDeleteAction(this.allocationId);
  }

  private executeAllocationDeleteAction(allocationId: string): void {
    this.loadingService.show({
      title: 'Deleting Allocation',
      message: "We're removing the allocation. This will just take a moment.",
    });

    this.projectService
      .deleteSiteAllocation(allocationId)
      .pipe(
        catchError(error => {
          if (this.readError(error).status !== 409) {
            return throwError(() => error);
          }

          return this.projectService.deleteSiteAllocation(allocationId, true);
        }),
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ISiteAllocationDeleteResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: (error: unknown) => {
          this.logger.error('Failed to delete allocation.', error);
          this.notificationService.error(this.readError(error).message);
        },
      });
  }

  private readError(error: unknown): { status: number; message: string } {
    if (!(error instanceof HttpErrorResponse)) {
      return { status: 0, message: 'Failed to delete allocation.' };
    }

    const body = error.error as
      | { message?: unknown; error?: { message?: unknown } }
      | undefined;
    const raw = body?.error?.message ?? body?.message;
    const message =
      typeof raw === 'string' && raw.trim().length > 0
        ? raw.trim()
        : 'Failed to delete allocation.';

    return { status: error.status, message };
  }
}
