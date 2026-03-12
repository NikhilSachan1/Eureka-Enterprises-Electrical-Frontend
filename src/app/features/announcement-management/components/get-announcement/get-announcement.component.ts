import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AnnouncementService } from '@features/announcement-management/services/announcement.service';
import {
  IAnnouncementGetBaseResponseDto,
  IAnnouncementGetFormDto,
  IAnnouncementGetResponseDto,
  IAnnouncementGetStatsResponseDto,
} from '@features/announcement-management/types/announcement.dto';
import { IAnnouncement } from '@features/announcement-management/types/announcement.interface';
import {
  AppConfigurationService,
  ConfirmationDialogService,
  DrawerService,
  LoadingService,
  RouterNavigationService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import {
  EButtonActionType,
  EDataType,
  EDrawerSize,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEnhancedTable,
  IEnhancedTableConfig,
  IMetricGroup,
  IPageHeaderConfig,
  ITableActionClickEvent,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { TableLazyLoadEvent } from 'primeng/table';
import { finalize } from 'rxjs';
import { GetAnnouncementDetailComponent } from '../get-announcement-detail/get-announcement-detail.component';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import {
  ANNOUNCEMENT_ACTION_CONFIG_MAP,
  ANNOUNCEMENT_TABLE_ENHANCED_CONFIG,
  SEARCH_FILTER_ANNOUNCEMENT_FORM_CONFIG,
} from '@features/announcement-management/config';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { MetricsCardComponent } from '@shared/components/metrics-card/metrics-card.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { APP_CONFIG } from '@core/config';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';

@Component({
  selector: 'app-get-announcement',
  imports: [
    PageHeaderComponent,
    MetricsCardComponent,
    SearchFilterComponent,
    DataTableComponent,
  ],
  templateUrl: './get-announcement.component.html',
  styleUrl: './get-announcement.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetAnnouncementComponent implements OnInit {
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly announcementService = inject(AnnouncementService);
  private readonly loadingService = inject(LoadingService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly drawerService = inject(DrawerService);
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;
  private readonly announcementStats =
    signal<IAnnouncementGetStatsResponseDto | null>(null);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected metricGroups = computed(() => this.getMetricGroups());

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      ANNOUNCEMENT_TABLE_ENHANCED_CONFIG as IEnhancedTableConfig
    );
    this.searchFilterConfig = SEARCH_FILTER_ANNOUNCEMENT_FORM_CONFIG;
  }

  private loadAnnouncementList(): void {
    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading Announcement',
      message: 'Please wait while we load the announcement...',
    });

    const paramData = this.prepareParamData();

    this.announcementService
      .getAnnouncementList(paramData)
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IAnnouncementGetResponseDto) => {
          const { records, stats, totalRecords } = response;

          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
          this.announcementStats.set(stats ?? null); //TODO: Remove null when backend is updated
        },
        error: () => {
          this.table.setData([]);
          this.announcementStats.set(null);
        },
      });
  }

  private prepareParamData(): IAnnouncementGetFormDto {
    return this.tableServerSideFilterAndSortService.buildQueryParams<IAnnouncementGetFormDto>(
      this.tableFilterData,
      this.table.getHeaders()
    );
  }

  private mapTableData(
    response: IAnnouncementGetBaseResponseDto[]
  ): IAnnouncement[] {
    return response.map((record: IAnnouncementGetBaseResponseDto) => {
      return {
        id: record.id,
        title: record.title,
        announcementDuration: [
          new Date(record.startAt),
          new Date(record.expiryAt),
        ],
        announcementStatus: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.announcementStatuses(),
          record.status
        ),
        acknowledgmentStats: `${record.stats?.acknowledged} / ${record.stats?.total}`,
        originalRawData: record,
      };
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadAnnouncementList();
  }

  private getMetricGroups(): IMetricGroup[] {
    const stats = this.announcementStats();
    if (!stats) {
      return [];
    }

    return [
      {
        id: 'acknowledgment',
        title: 'Acknowledgment Status',
        icon: 'pi pi-megaphone',
        metrics: [
          { label: 'Total', value: stats.total },
          { label: 'Acknowledged', value: stats.acknowledged },
          { label: 'Pending', value: stats.pending },
        ],
      },
    ];
  }

  protected handleAnnouncementTableActionClick(
    event: ITableActionClickEvent<IAnnouncementGetBaseResponseDto>,
    isBulk: boolean
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (actionType === EButtonActionType.VIEW) {
      this.showAnnouncementDetailsDrawer(selectedFirstRow);
      return;
    }

    if (actionType === EButtonActionType.EDIT) {
      this.navigateToEditAnnouncement(selectedFirstRow.id);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamicComponentInputs: any = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadAnnouncementList();
      },
    };

    if (actionType === EButtonActionType.DELETE) {
      dynamicComponentInputs.dialogActionType = actionType;
    }

    const recordDetail = this.prepareAnnouncementRecordDetail(selectedFirstRow);

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      ANNOUNCEMENT_ACTION_CONFIG_MAP[actionType],
      recordDetail,
      isBulk,
      !isBulk,
      dynamicComponentInputs
    );
  }

  private prepareAnnouncementRecordDetail(
    selectedRow: IAnnouncementGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Title',
        value: selectedRow.title,
        type: EDataType.TEXT,
      },
      {
        label: 'Announcement Period',
        value: [selectedRow.startAt, selectedRow.expiryAt],
        type: EDataType.RANGE,
        dataType: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
    ];
    return {
      details: [
        {
          status: {
            approvalStatus: selectedRow.status,
          },
          entryData,
        },
      ],
    };
  }

  private showAnnouncementDetailsDrawer(
    rowData: IAnnouncementGetBaseResponseDto
  ): void {
    this.drawerService.showDrawer(GetAnnouncementDetailComponent, {
      header: `Announcement Details`,
      subtitle: `Detailed view of announcement`,
      size: EDrawerSize.LARGE,
      componentData: {
        announcement: rowData,
      },
    });
  }

  private navigateToEditAnnouncement(announcementId: string): void {
    try {
      const routeSegments = [
        ROUTE_BASE_PATHS.ANNOUNCEMENT,
        ROUTES.ANNOUNCEMENT.EDIT,
        announcementId,
      ];

      void this.routerNavigationService.navigateToRoute(routeSegments);
    } catch {
      // Navigation error - silently fail
    }
  }

  protected onHeaderButtonClick(actionName: string): void {
    let navigationRoute: string[] = [];
    if (actionName === 'addAnnouncement') {
      navigationRoute = [
        ROUTE_BASE_PATHS.ANNOUNCEMENT,
        ROUTES.ANNOUNCEMENT.ADD,
      ];
    }
    void this.routerNavigationService.navigateToRoute(navigationRoute);
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: 'Announcement Management',
      subtitle: 'Manage announcement records',
      showHeaderButton: true,
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Add Announcement',
          icon: ICONS.COMMON.PLUS,
          actionName: 'addAnnouncement',
          permission: [APP_PERMISSION.ANNOUNCEMENT.ADD],
        },
      ],
    };
  }
}
