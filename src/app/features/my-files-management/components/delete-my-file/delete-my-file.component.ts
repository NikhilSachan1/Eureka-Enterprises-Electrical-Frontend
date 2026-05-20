import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { LoggerService } from '@core/services';
import {
  ConfirmationDialogService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { FORM_VALIDATION_MESSAGES } from '@shared/constants';
import { MyFilesService } from '../../services/my-files.service';
import {
  IMyFileBaseResponseDto,
  IMyFilesDeleteResponseDto,
} from '../../types/my-files.dto';
import { EMyFileType } from '../../types/my-files.enum';

@Component({
  selector: 'app-delete-my-file',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './delete-my-file.component.html',
  styleUrl: './delete-my-file.component.scss',
})
export class DeleteMyFileComponent implements OnInit, IDialogActionHandler {
  private readonly myFilesService = inject(MyFilesService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly selectedRecord =
    input.required<IMyFileBaseResponseDto[]>();
  protected readonly onSuccess = input.required<() => void>();

  private selectedItem?: IMyFileBaseResponseDto;

  ngOnInit(): void {
    const [record] = this.selectedRecord();
    if (!record) {
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      this.logger.error('Delete my file: selected record was not provided');
      return;
    }

    this.selectedItem = record;
  }

  onDialogAccept(): void {
    if (!this.selectedItem) {
      return;
    }

    this.executeDeleteAction(this.selectedItem);
  }

  private executeDeleteAction(record: IMyFileBaseResponseDto): void {
    const isFolder = record.type === EMyFileType.FOLDER;

    this.loadingService.show({
      title: isFolder ? 'Deleting Folder' : 'Deleting File',
      message: isFolder
        ? "We're removing the folder. This will just take a moment."
        : "We're removing the file. This will just take a moment.",
    });

    this.myFilesService
      .deleteMyFile(record.id)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IMyFilesDeleteResponseDto) => {
          this.notificationService.success(response.message);
          this.onSuccess()();
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.logUserAction('Failed to delete file or folder', error);
          this.notificationService.error(
            'Could not delete the file or folder. Please try again.'
          );
        },
      });
  }
}
