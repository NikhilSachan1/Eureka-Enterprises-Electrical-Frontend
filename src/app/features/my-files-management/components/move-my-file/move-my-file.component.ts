import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, Subscription } from 'rxjs';
import { LoggerService } from '@core/services';
import { ICONS } from '@shared/constants';
import {
  ConfirmationDialogService,
  LoadingService,
  NotificationService,
} from '@shared/services';
import { IDialogActionHandler } from '@shared/types';
import { MY_FILES_ROOT_LABEL } from '../../constants/my-files.constants';
import { MyFilesService } from '../../services/my-files.service';
import { IMyFileBaseResponseDto } from '../../types/my-files.dto';
import { EMyFileType } from '../../types/my-files.enum';
import {
  IMyFilesMoveCrumb,
  IMyFilesMoveFolderTreeItem,
} from '../../types/my-files.interface';
import { MyFilePreviewComponent } from '../my-file-preview/my-file-preview.component';

/**
 * Move dialog: browse folders like a mini file manager (open a folder to go in, the path
 * to go back) and "Move here" moves the item into the folder that is open.
 * The folder being moved is never listed, so it cannot be moved into itself.
 */
@Component({
  selector: 'app-move-my-file',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MyFilePreviewComponent],
  templateUrl: './move-my-file.component.html',
  styleUrl: './move-my-file.component.scss',
})
export class MoveMyFileComponent implements OnInit, IDialogActionHandler {
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
  /** Where the page is now (the item's folder), "My Files" first. */
  protected readonly startPath = input<IMyFilesMoveCrumb[]>([]);
  protected readonly onSuccess =
    input.required<(destinationParentId: string | null) => void>();

  protected readonly ICONS = ICONS;

  /** Folder open in the dialog, "My Files" first. */
  protected readonly path = signal<IMyFilesMoveCrumb[]>([
    { id: null, name: MY_FILES_ROOT_LABEL },
  ]);
  protected readonly folders = signal<IMyFilesMoveFolderTreeItem[]>([]);
  protected readonly loading = signal(false);
  protected readonly failed = signal(false);

  protected readonly record = computed(() => this.selectedRecord()[0] ?? null);

  protected readonly current = computed(() => {
    const steps = this.path();
    return steps[steps.length - 1];
  });

  /** The open folder is where the item already is: moving would change nothing. */
  protected readonly isAlreadyHere = computed(
    () => (this.record()?.parentId ?? null) === this.current().id
  );

  private listSubscription?: Subscription;

  ngOnInit(): void {
    const start = this.startPath();
    if (start.length) {
      this.path.set(start);
    }
    this.loadFolders();
  }

  protected openFolder(folder: IMyFilesMoveFolderTreeItem): void {
    this.path.update(steps => [...steps, { id: folder.id, name: folder.name }]);
    this.loadFolders();
  }

  protected goTo(index: number): void {
    if (index >= this.path().length - 1) {
      return;
    }
    this.path.update(steps => steps.slice(0, index + 1));
    this.loadFolders();
  }

  protected goUp(): void {
    this.goTo(this.path().length - 2);
  }

  protected retry(): void {
    this.loadFolders();
  }

  onDialogAccept(): void {
    const record = this.record();
    if (!record) {
      return;
    }

    if (this.isAlreadyHere()) {
      this.notificationService.info(
        `“${record.name}” is already in ${this.current().name}. Open another folder to move it there.`
      );
      return;
    }

    this.move(record, this.current().id);
  }

  private loadFolders(): void {
    const record = this.record();
    this.listSubscription?.unsubscribe();
    this.loading.set(true);
    this.failed.set(false);

    this.listSubscription = this.myFilesService
      .getMoveFolderTreeItems(
        this.current().id,
        record?.type === EMyFileType.FOLDER ? record.id : undefined
      )
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: folders => this.folders.set(folders),
        error: error => {
          this.folders.set([]);
          this.failed.set(true);
          this.logger.logUserAction('Failed to load folders for move', error);
        },
      });
  }

  private move(
    record: IMyFileBaseResponseDto,
    destination: string | null
  ): void {
    const isFolder = record.type === EMyFileType.FOLDER;

    this.loadingService.show({
      title: isFolder ? 'Moving folder' : 'Moving file',
      message: `Moving “${record.name}” to ${this.current().name}.`,
    });

    this.myFilesService
      .moveMyFile(record.id, { parentId: destination })
      .pipe(
        finalize(() => this.loadingService.hide()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: response => {
          this.notificationService.success(response.message);
          this.onSuccess()(destination);
          this.confirmationDialogService.closeDialog();
        },
        error: error => {
          this.logger.logUserAction('Failed to move file or folder', error);
          this.notificationService.error(
            error?.error?.message ??
              (isFolder
                ? 'Could not move the folder. Please try again.'
                : 'Could not move the file. Please try again.')
          );
        },
      });
  }
}
