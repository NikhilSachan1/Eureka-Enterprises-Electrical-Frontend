import {
  Component,
  inject,
  OnInit,
  ChangeDetectionStrategy,
  DestroyRef,
} from '@angular/core';
import {
  TableService,
  RouterNavigationService,
  LoadingService,
  ConfirmationDialogService,
} from '@shared/services/';
import { LoggerService } from '@core/services';
import {
  ISystemPermissionGetBaseResponseDto,
  ISystemPermissionGetResponseDto,
} from '../../types/system-permission.dto';
import { finalize } from 'rxjs/operators';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import {
  SYSTEM_PERMISSION_ACTION_CONFIG_MAP,
  SYSTEM_PERMISSION_TABLE_ENHANCED_CONFIG,
} from '../../config';
import { SystemPermissionService } from '../../services/system-permission.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import {
  EButtonActionType,
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEnhancedTable,
  IEnhancedTableConfig,
  ITableActionClickEvent,
} from '@shared/types';
import { ISystemPermission } from '../../types/system-permission.interface';
import {
  replaceTextWithSeparator,
  toSentenceCase,
  toTitleCase,
} from '@shared/utility';

@Component({
  selector: 'app-get-system-permission',
  imports: [DataTableComponent],
  templateUrl: './get-system-permission.component.html',
  styleUrl: './get-system-permission.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetSystemPermissionComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly systemPermissionService = inject(SystemPermissionService);
  private readonly loadingService = inject(LoadingService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected table!: IEnhancedTable;

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      SYSTEM_PERMISSION_TABLE_ENHANCED_CONFIG as IEnhancedTableConfig
    );
  }

  private loadSystemPermissionList(): void {
    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading System Permissions',
      message: 'Please wait while we load the system permissions...',
    });

    this.systemPermissionService
      .getSystemPermissionList()
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ISystemPermissionGetResponseDto) => {
          const { records, totalRecords } = response;
          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
          this.logger.logUserAction('System permissions loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.logger.logUserAction('Failed to load system permissions', error);
        },
      });
  }

  private mapTableData(
    response: ISystemPermissionGetBaseResponseDto[]
  ): ISystemPermission[] {
    return response.map((record: ISystemPermissionGetBaseResponseDto) => ({
      id: record.id,
      permissionLabel: toTitleCase(
        replaceTextWithSeparator(record.label, '_', ' ')
      ),
      permissionDescription: toSentenceCase(record.description),
      moduleName: toTitleCase(
        replaceTextWithSeparator(record.module, '_', ' ')
      ),
      permissionCode: record.name,
      isEditable: record.isEditable,
      isDeletable: record.isDeletable,
      originalRawData: record,
    }));
  }

  protected onTableStateChange(): void {
    this.loadSystemPermissionList();
  }

  protected handleSystemPermissionTableActionClick(
    event: ITableActionClickEvent<ISystemPermissionGetBaseResponseDto>,
    isBulk: boolean
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (actionType === EButtonActionType.EDIT) {
      this.navigateToEditSystemPermission(
        selectedFirstRow.id,
        selectedFirstRow
      );
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamicComponentInputs: any = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadSystemPermissionList();
      },
    };

    const recordDetail =
      this.prepareSystemPermissionRecordDetail(selectedFirstRow);

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      SYSTEM_PERMISSION_ACTION_CONFIG_MAP[actionType],
      recordDetail,
      isBulk,
      !isBulk,
      dynamicComponentInputs
    );
  }

  private prepareSystemPermissionRecordDetail(
    selectedRow: ISystemPermissionGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Permission Label',
        value: toTitleCase(
          replaceTextWithSeparator(selectedRow.label, '_', ' ')
        ),
        type: EDataType.TEXT,
      },
      {
        label: 'Module Name',
        value: toTitleCase(
          replaceTextWithSeparator(selectedRow.module, '_', ' ')
        ),
        type: EDataType.TEXT,
      },
      {
        label: 'Permission Code',
        value: selectedRow.name,
        type: EDataType.TEXT,
      },
    ];
    return {
      details: [
        {
          entryData,
        },
      ],
    };
  }

  private navigateToEditSystemPermission(
    systemPermissionId: string,
    selectedRow: ISystemPermissionGetBaseResponseDto
  ): void {
    try {
      const routeSegments = [
        ROUTE_BASE_PATHS.SETTINGS.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.BASE,
        ROUTE_BASE_PATHS.SETTINGS.PERMISSION.SYSTEM,
        ROUTES.SETTINGS.PERMISSION.SYSTEM.EDIT,
        systemPermissionId,
      ];

      const success = this.routerNavigationService.navigateWithState(
        routeSegments,
        { systemPermissionDetail: selectedRow }
      );

      if (!success) {
        this.logger.logUserAction(
          'Navigation failed for edit system permission',
          {
            systemPermissionId,
          }
        );
      }
    } catch (error) {
      this.logger.logUserAction(
        'Navigation error while editing system permission',
        error
      );
    }
  }
}
