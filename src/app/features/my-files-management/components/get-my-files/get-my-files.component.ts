import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoggerService } from '@core/services';
import {
  LoadingService,
  ConfirmationDialogService,
  RouterNavigationService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import { MyFilesService } from '../../services/my-files.service';
import {
  EButtonActionType,
  IButtonConfig,
  IEnhancedTable,
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
import { distinctUntilChanged, finalize, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IMyFile } from '../../types/my-files.interface';
import { EMyFileType } from '../../types/my-files.enum';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { formatFileSize } from '@shared/utility';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { MyFilesBreadcrumbComponent } from '../my-files-breadcrumb/my-files-breadcrumb.component';

@Component({
  selector: 'app-get-my-files',
  imports: [
    PageHeaderComponent,
    MyFilesBreadcrumbComponent,
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

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      MY_FILES_TABLE_ENHANCED_CONFIG
    );

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
    };
  }

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

  protected handleMyFilesTableActionClick(
    event: ITableActionClickEvent<IMyFile>
  ): void {
    const { actionType, selectedRows } = event;

    const dynamicComponentInputs: Record<string, unknown> = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadMyFilesList();
      },
    };

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      MY_FILES_ACTION_CONFIG_MAP[actionType],
      null,
      false,
      false,
      dynamicComponentInputs
    );
  }

  protected readonly EButtonActionType = EButtonActionType;

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
    };
  }

  protected getUploadMyFileButtonConfig(): Partial<IButtonConfig> {
    return {
      id: EButtonActionType.UPLOAD,
      label: 'Upload Files',
    };
  }
}
