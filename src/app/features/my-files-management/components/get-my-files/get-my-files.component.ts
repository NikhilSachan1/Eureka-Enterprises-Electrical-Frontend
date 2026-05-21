import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoggerService } from '@core/services';
import {
  LoadingService,
  ConfirmationDialogService,
  DrawerService,
  RouterNavigationService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import { MyFilesService } from '../../services/my-files.service';
import {
  EButtonActionType,
  EDataType,
  EDrawerPosition,
  IButtonConfig,
  IDialogActionConfig,
  IEnhancedTable,
  IInputFieldsConfig,
  IPageHeaderConfig,
  ITableActionClickEvent,
} from '@shared/types';
import { TableLazyLoadEvent } from 'primeng/table';
import {
  IMyFileBaseResponseDto,
  IMyFilesListFormDto,
  IMyFilesListResponseDto,
} from '../../types/my-files.dto';
import {
  MY_FILES_ACTION_CONFIG_MAP,
  MY_FILES_TABLE_ENHANCED_CONFIG,
} from '../../config';
import {
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  Subject,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IMyFile } from '../../types/my-files.interface';
import { EMyFileType } from '../../types/my-files.enum';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { DEFAULT_INPUT_FIELD_CONFIG } from '@shared/config/input-field.config';
import { formatFileSize } from '@shared/utility';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { MyFilesBreadcrumbComponent } from '../my-files-breadcrumb/my-files-breadcrumb.component';
import { MoveMyFileComponent } from '../move-my-file/move-my-file.component';

@Component({
  selector: 'app-get-my-files',
  imports: [
    PageHeaderComponent,
    MyFilesBreadcrumbComponent,
    InputFieldComponent,
    ButtonComponent,
    DataTableComponent,
  ],
  templateUrl: './get-my-files.component.html',
  styleUrl: './get-my-files.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetMyFilesComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly dataTableService = inject(TableService);
  private readonly myFilesService = inject(MyFilesService);
  private readonly loadingService = inject(LoadingService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly tableServerSideParamsBuilderService = inject(
    TableServerSideParamsBuilderService
  );
  private readonly drawerService = inject(DrawerService);
  private readonly searchInputChanges$ = new Subject<string>();

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected readonly searchFieldConfig: IInputFieldsConfig = {
    ...DEFAULT_INPUT_FIELD_CONFIG,
    fieldType: EDataType.TEXT,
    id: 'search',
    fieldName: 'search',
    label: 'Search',
    placeholder: 'Search files and folders',
  } as IInputFieldsConfig;
  protected readonly searchInput = signal('');
  protected readonly searchTerm = signal('');

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      MY_FILES_TABLE_ENHANCED_CONFIG
    );

    this.searchInputChanges$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(term => {
        this.searchTerm.set(term.trim());
        if (this.tableFilterData) {
          this.loadMyFilesList();
        }
      });

    this.activatedRoute.queryParamMap
      .pipe(
        map(params => params.get('parentId')),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        if (this.tableFilterData) {
          this.loadMyFilesList();
        }
      });
  }

  protected onSearchFieldChange(value: unknown): void {
    const term = String(value ?? '');
    this.searchInput.set(term);
    this.searchInputChanges$.next(term);
  }

  private loadMyFilesList(): void {
    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading Files',
      message: "We're loading your files. This will just take a moment.",
    });

    const paramData = this.prepareParamData();

    this.myFilesService
      .getMyFilesList(paramData)
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IMyFilesListResponseDto) => {
          const { records, totalRecords } = response;

          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
          this.logger.logUserAction('My files loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.table.updateTableConfig({ totalRecords: 0 });
          this.logger.logUserAction('Failed to load my files', error);
        },
      });
  }

  private prepareParamData(): IMyFilesListFormDto {
    return {
      ...this.tableServerSideParamsBuilderService.buildQueryParams<IMyFilesListFormDto>(
        this.tableFilterData,
        this.table.getHeaders()
      ),
      parentId: this.getCurrentParentId(),
      ...(this.searchTerm() ? { search: this.searchTerm() } : {}),
    };
  }

  protected readonly EButtonActionType = EButtonActionType;

  private getCurrentParentId(): string | null {
    return this.activatedRoute.snapshot.queryParamMap.get('parentId');
  }

  private mapTableData(records: IMyFileBaseResponseDto[]): IMyFile[] {
    return records.map((record: IMyFileBaseResponseDto) => {
      return {
        id: record.id,
        name: record.name,
        parentId: record.parentId,
        storageKey: record.storageKey,
        mimeType: record.mimeType,
        itemIcon:
          record.type === EMyFileType.FOLDER
            ? ICONS.COMMON.FOLDER
            : ICONS.COMMON.FILE,
        formattedSize:
          record.type === EMyFileType.FOLDER
            ? '-'
            : formatFileSize(Number(record.size)),
        documentKeys:
          record.type === EMyFileType.FILE && record.storageKey
            ? [record.storageKey]
            : [],
        originalRawData: record,
      } satisfies IMyFile;
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadMyFilesList();
  }

  protected isFolder(row: IMyFile): boolean {
    return row.originalRawData.type === EMyFileType.FOLDER;
  }

  protected onFolderNameClick(row: IMyFile): void {
    void this.routerNavigationService.navigateWithQueryParams(
      [ROUTE_BASE_PATHS.MY_FILES, ROUTES.MY_FILES.LIST],
      { parentId: row.id }
    );
  }

  protected startMoveDrawer(record: IMyFileBaseResponseDto): void {
    const itemLabel = record.type === EMyFileType.FOLDER ? 'folder' : 'file';

    this.drawerService.showDrawer(MoveMyFileComponent, {
      header: 'Move to Folder',
      subtitle: `Select a folder for this ${itemLabel}`,
      position: EDrawerPosition.BOTTOM,
      dismissible: true,
      componentData: {
        itemToMove: record,
        onSuccess: (destinationParentId: string | null) => {
          this.handleMoveSuccess(destinationParentId);
        },
      },
    });
  }

  private handleMoveSuccess(destinationParentId: string | null): void {
    const currentParentId = this.getCurrentParentId();

    if (currentParentId === destinationParentId) {
      this.loadMyFilesList();
      return;
    }

    void this.routerNavigationService.navigateWithQueryParams(
      [ROUTE_BASE_PATHS.MY_FILES, ROUTES.MY_FILES.LIST],
      { parentId: destinationParentId }
    );
  }

  protected handleMyFilesTableActionClick(
    event: ITableActionClickEvent<IMyFileBaseResponseDto>
  ): void {
    const { actionType, selectedRows } = event;

    if (actionType === EButtonActionType.MOVE) {
      const [row] = selectedRows;
      if (row) {
        this.startMoveDrawer(row);
      }
      return;
    }

    const dynamicComponentInputs: Record<string, unknown> = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadMyFilesList();
      },
    };

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      this.resolveMyFilesDialogConfig(
        actionType,
        selectedRows as unknown as IMyFileBaseResponseDto[]
      ),
      null,
      false,
      false,
      dynamicComponentInputs
    );
  }

  private resolveMyFilesDialogConfig(
    actionType: EButtonActionType,
    selectedRows: IMyFileBaseResponseDto[]
  ): IDialogActionConfig {
    const baseConfig = MY_FILES_ACTION_CONFIG_MAP[actionType];
    const [record] = selectedRows;
    const isFolder = record?.type === EMyFileType.FOLDER;
    const itemLabel = isFolder ? 'folder' : 'file';
    const itemLabelTitle = isFolder ? 'Folder' : 'File';

    if (actionType === EButtonActionType.EDIT) {
      return {
        ...baseConfig,
        dialogConfig: {
          ...baseConfig.dialogConfig,
          header: `Rename ${itemLabelTitle}`,
          message: `Update the ${itemLabel} name.`,
        },
      };
    }

    if (actionType === EButtonActionType.DELETE) {
      return {
        ...baseConfig,
        dialogConfig: {
          ...baseConfig.dialogConfig,
          header: `Delete ${itemLabelTitle}`,
          message: `Delete the ${itemLabel}?`,
        },
      };
    }

    return baseConfig;
  }

  protected openMyFilesActionDialog(actionType: EButtonActionType): void {
    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      MY_FILES_ACTION_CONFIG_MAP[actionType],
      null,
      false,
      false,
      {
        parentId: this.getCurrentParentId(),
        onSuccess: () => {
          this.loadMyFilesList();
        },
      }
    );
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: 'My Files',
      subtitle: 'Browse and download your public files and folders',
    };
  }

  protected getCreateFolderButtonConfig(): Partial<IButtonConfig> {
    return {
      id: EButtonActionType.CREATE_FOLDER,
      label: 'New Folder',
      icon: ICONS.COMMON.FOLDER,
    };
  }

  protected getUploadMyFileButtonConfig(): Partial<IButtonConfig> {
    return {
      id: EButtonActionType.UPLOAD,
      label: 'Upload Files',
      icon: ICONS.COMMON.UPLOAD,
    };
  }
}
