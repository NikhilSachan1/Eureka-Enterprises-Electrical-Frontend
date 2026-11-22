import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { AppPermissionService, LoggerService } from '@core/services';
import { ButtonComponent } from '@shared/components/button/button.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { SkeletonComponent } from '@shared/components/skeleton/skeleton.component';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import {
  AttachmentsService,
  ConfirmationDialogService,
  GalleryService,
  NotificationService,
  RouterNavigationService,
} from '@shared/services';
import {
  EButtonActionType,
  IButtonConfig,
  IDialogActionConfig,
} from '@shared/types';
import { MenuItem } from 'primeng/api';
import { Menu, MenuModule } from 'primeng/menu';
import {
  combineLatest,
  distinctUntilChanged,
  EMPTY,
  finalize,
  map,
  Observable,
  startWith,
  Subject,
  switchMap,
  tap,
  catchError,
} from 'rxjs';
import {
  MY_FILE_ITEM_ACTIONS,
  MY_FILES_ACTION_CONFIG_MAP,
  MY_FILES_LOAD_MORE_BUTTON_CONFIG,
  MY_FILES_PAGE_HEADER_CONFIG,
  MY_FILES_NEW_FOLDER_BUTTON_CONFIG,
  MY_FILES_UPLOAD_BUTTON_CONFIG,
} from '../../config';
import {
  MY_FILES_PAGE_SIZE,
  MY_FILES_PATH_SEPARATOR,
  MY_FILES_ROOT_LABEL,
  MY_FILES_SKELETON_COUNT,
  MY_FILES_VIEW_MODE_STORAGE_KEY,
} from '../../constants/my-files.constants';
import { MyFilesService } from '../../services/my-files.service';
import {
  IMyFilesListFormDto,
  IMyFilesListResponseDto,
} from '../../types/my-files.dto';
import { IMyFile, IMyFilesMoveCrumb } from '../../types/my-files.interface';
import {
  TMyFileItemAction,
  TMyFilesViewMode,
} from '../../types/my-files.types';
import { getMyFileExtension, toMyFile } from '../../utils/my-files.util';
import { MyFilesBreadcrumbComponent } from '../my-files-breadcrumb/my-files-breadcrumb.component';

/**
 * My Files: a Drive-style browser. Folders first as tiles, then files as cards (or a
 * compact list), each with a ⋮ menu (open, download, rename, move, delete).
 * The folder shown follows the `parentId` query param.
 */
@Component({
  selector: 'app-get-my-files',
  imports: [
    ButtonComponent,
    MenuModule,
    MyFilesBreadcrumbComponent,
    NgTemplateOutlet,
    PageHeaderComponent,
    SkeletonComponent,
  ],
  templateUrl: './get-my-files.component.html',
  styleUrl: './get-my-files.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetMyFilesComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly myFilesService = inject(MyFilesService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly galleryService = inject(GalleryService);
  private readonly attachmentsService = inject(AttachmentsService);
  private readonly notificationService = inject(NotificationService);
  private readonly appPermissionService = inject(AppPermissionService);

  private readonly itemMenu = viewChild.required<Menu>('itemMenu');

  protected readonly ICONS = ICONS;
  protected readonly skeletons = Array.from(
    { length: MY_FILES_SKELETON_COUNT },
    (_, index) => index
  );
  protected readonly loadMoreButtonConfig = MY_FILES_LOAD_MORE_BUTTON_CONFIG;
  protected readonly pageHeaderConfig = MY_FILES_PAGE_HEADER_CONFIG;

  // ── State ──────────────────────────────────────────────────────────────────
  protected readonly items = signal<IMyFile[]>([]);
  protected readonly totalRecords = signal(0);
  protected readonly loading = signal(true);
  protected readonly loadingMore = signal(false);
  protected readonly failed = signal(false);
  protected readonly viewMode = signal<TMyFilesViewMode>(this.readViewMode());
  protected readonly menuItems = signal<MenuItem[]>([]);

  /** Folder path shown in the breadcrumb, "My Files" first. */
  private readonly path = signal<IMyFilesMoveCrumb[]>([
    { id: null, name: MY_FILES_ROOT_LABEL },
  ]);
  private page = 1;

  private readonly reload$ = new Subject<void>();

  // ── Derived ────────────────────────────────────────────────────────────────
  protected readonly folders = computed(() =>
    this.items().filter(item => item.isFolder)
  );
  protected readonly files = computed(() =>
    this.items().filter(item => !item.isFolder)
  );
  protected readonly hasMore = computed(
    () => this.items().length < this.totalRecords()
  );
  protected readonly folderName = computed(() => {
    const steps = this.path();
    return steps[steps.length - 1].name;
  });
  protected readonly locationLabel = computed(() =>
    this.path()
      .map(step => step.name)
      .join(MY_FILES_PATH_SEPARATOR)
  );
  protected readonly summary = computed(() => {
    const folders = this.folders().length;
    const files = this.files().length;
    const parts = [
      folders ? `${folders} ${folders === 1 ? 'folder' : 'folders'}` : '',
      files ? `${files} ${files === 1 ? 'file' : 'files'}` : '',
    ].filter(Boolean);
    return parts.join(' · ');
  });

  protected readonly toolbarButtons = computed(() =>
    this.appPermissionService.filterByPermission([
      MY_FILES_NEW_FOLDER_BUTTON_CONFIG,
      MY_FILES_UPLOAD_BUTTON_CONFIG,
    ])
  );
  protected readonly canAdd = computed(() => this.toolbarButtons().length > 0);

  ngOnInit(): void {
    const parentId$ = this.activatedRoute.queryParamMap.pipe(
      map(params => params.get('parentId')),
      distinctUntilChanged()
    );

    // Another folder, or a change in this one: start again from page 1.
    combineLatest([parentId$, this.reload$.pipe(startWith(undefined))])
      .pipe(
        tap(() => {
          this.page = 1;
          this.loading.set(true);
          this.failed.set(false);
        }),
        switchMap(() => this.fetchPage(1)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(response => {
        this.items.set(response.records.map(toMyFile));
        this.totalRecords.set(response.totalRecords);
      });
  }

  // ── Toolbar ────────────────────────────────────────────────────────────────
  protected setViewMode(mode: TMyFilesViewMode): void {
    this.viewMode.set(mode);
    try {
      localStorage.setItem(MY_FILES_VIEW_MODE_STORAGE_KEY, mode);
    } catch {
      // Storage unavailable (private mode): the choice lasts for this visit only.
    }
  }

  protected onPathChange(path: IMyFilesMoveCrumb[]): void {
    this.path.set(path);
  }

  protected onToolbarAction(button: Partial<IButtonConfig>): void {
    const action = button.id as EButtonActionType;
    this.confirmationDialogService.showConfirmationDialog(
      action,
      MY_FILES_ACTION_CONFIG_MAP[action],
      null,
      false,
      false,
      {
        parentId: this.currentParentId(),
        locationLabel: this.locationLabel(),
        onSuccess: () => this.reload(),
      }
    );
  }

  protected loadMore(): void {
    if (this.loadingMore() || !this.hasMore()) {
      return;
    }

    this.loadingMore.set(true);
    this.fetchPage(this.page + 1)
      .pipe(
        finalize(() => this.loadingMore.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(response => {
        this.page += 1;
        this.items.update(current => [
          ...current,
          ...response.records.map(toMyFile),
        ]);
        this.totalRecords.set(response.totalRecords);
      });
  }

  protected retry(): void {
    this.reload();
  }

  // ── Items ──────────────────────────────────────────────────────────────────
  protected extension(item: IMyFile): string {
    return getMyFileExtension(item.name, item.isFolder);
  }

  protected meta(item: IMyFile): string {
    return [item.isFolder ? '' : item.kind, item.sizeLabel]
      .filter(Boolean)
      .join(' · ');
  }

  protected open(item: IMyFile): void {
    if (item.isFolder) {
      this.openFolder(item.id);
      return;
    }

    if (item.raw.storageKey) {
      this.galleryService.show([{ mediaKey: item.raw.storageKey }]);
    }
  }

  protected openMenu(event: Event, item: IMyFile): void {
    event.preventDefault();
    event.stopPropagation();
    this.menuItems.set(this.buildMenu(item));
    this.itemMenu().toggle(event);
  }

  private buildMenu(item: IMyFile): MenuItem[] {
    const menu: MenuItem[] = [];

    for (const entry of MY_FILE_ITEM_ACTIONS) {
      const allowed =
        !entry.permission ||
        this.appPermissionService.hasAnyPermission(entry.permission);
      const applies =
        !entry.filesOnly || (!item.isFolder && !!item.raw.storageKey);

      if (allowed && applies) {
        if (entry.separatorBefore && menu.length) {
          menu.push({ separator: true });
        }
        menu.push({
          label: entry.label,
          icon: entry.icon,
          styleClass: entry.danger ? 'my-files-menu__danger' : undefined,
          command: () => this.runAction(entry.action, item),
        });
      }
    }

    return menu;
  }

  private runAction(action: TMyFileItemAction, item: IMyFile): void {
    switch (action) {
      case 'open':
        this.open(item);
        break;
      case 'download':
        this.download(item);
        break;
      case 'rename':
        this.openItemDialog(EButtonActionType.EDIT, item);
        break;
      case 'move':
        this.openItemDialog(EButtonActionType.MOVE, item);
        break;
      case 'delete':
        this.openItemDialog(EButtonActionType.DELETE, item);
        break;
      default:
        break;
    }
  }

  private download(item: IMyFile): void {
    const key = item.raw.storageKey;
    if (!key) {
      return;
    }

    this.attachmentsService
      .getFullMediaUrl(key)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ url }) => {
          const link = document.createElement('a');
          link.href = url;
          link.target = '_blank';
          link.rel = 'noopener';
          link.download = item.name;
          link.click();
        },
        error: error => {
          this.logger.logUserAction('Failed to get download link', error);
          this.notificationService.error(
            `Could not download “${item.name}”. Please try again.`
          );
        },
      });
  }

  private openItemDialog(action: EButtonActionType, item: IMyFile): void {
    this.confirmationDialogService.showConfirmationDialog(
      action,
      this.itemDialogConfig(action, item),
      null,
      false,
      false,
      {
        selectedRecord: [item.raw],
        startPath: this.path(),
        onSuccess: () => this.reload(),
      }
    );
  }

  private itemDialogConfig(
    action: EButtonActionType,
    item: IMyFile
  ): IDialogActionConfig {
    const base = MY_FILES_ACTION_CONFIG_MAP[action];
    const noun = item.isFolder ? 'folder' : 'file';

    const header: Partial<Record<EButtonActionType, string>> = {
      [EButtonActionType.EDIT]: `Rename ${noun}`,
      [EButtonActionType.MOVE]: `Move ${noun}`,
      [EButtonActionType.DELETE]: `Delete this ${noun}?`,
    };

    return {
      ...base,
      dialogConfig: {
        ...base.dialogConfig,
        header: header[action] ?? base.dialogConfig.header,
        // Delete explains itself inside the dialog (and warns for folders).
        ...(action === EButtonActionType.DELETE ? { message: '' } : {}),
      },
    };
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  private reload(): void {
    this.reload$.next();
  }

  private openFolder(folderId: string | null): void {
    void this.routerNavigationService.navigateWithQueryParams(
      [ROUTE_BASE_PATHS.MY_FILES, ROUTES.MY_FILES.LIST],
      { parentId: folderId }
    );
  }

  private currentParentId(): string | null {
    return this.activatedRoute.snapshot.queryParamMap.get('parentId');
  }

  private fetchPage(page: number): Observable<IMyFilesListResponseDto> {
    const params: IMyFilesListFormDto = {
      parentId: this.currentParentId(),
      page,
      pageSize: MY_FILES_PAGE_SIZE,
      // Folders first, then names A→Z (the API's default order, ascending).
      sortOrder: 'ASC',
    };

    return this.myFilesService.getMyFilesList(params).pipe(
      finalize(() => this.loading.set(false)),
      catchError(error => {
        this.logger.logUserAction('Failed to load my files', error);
        if (page === 1) {
          this.items.set([]);
          this.totalRecords.set(0);
          this.failed.set(true);
        } else {
          this.notificationService.error(
            'Could not load more items. Please try again.'
          );
        }
        return EMPTY;
      })
    );
  }

  private readViewMode(): TMyFilesViewMode {
    try {
      return localStorage.getItem(MY_FILES_VIEW_MODE_STORAGE_KEY) === 'list'
        ? 'list'
        : 'grid';
    } catch {
      return 'grid';
    }
  }
}
