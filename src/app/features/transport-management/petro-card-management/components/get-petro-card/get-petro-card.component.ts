import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { LoggerService } from '@core/services';
import {
  ConfirmationDialogService,
  LoadingService,
  RouterNavigationService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import { PetroCardService } from '../../services/petro-card.service';
import {
  EButtonActionType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEnhancedTable,
  IMetric,
  IPageHeaderConfig,
  ITableActionClickEvent,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { TableLazyLoadEvent } from 'primeng/table';
import {
  IPetroCardGetBaseResponseDto,
  IPetroCardGetRequestDto,
  IPetroCardGetResponseDto,
  IPetroCardGetStatsResponseDto,
} from '../../types/petro-card.dto';
import {
  PETRO_CARD_ACTION_CONFIG_MAP,
  PETRO_CARD_TABLE_ENHANCED_CONFIG,
  SEARCH_FILTER_PETRO_CARD_FORM_CONFIG,
} from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { IPetroCard } from '../../types/petro-card.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { MetricsCardComponent } from '@shared/components/metrics-card/metrics-card.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { EPetroCardStatus } from '../../types/petro-card.enum';

@Component({
  selector: 'app-get-petro-card',
  imports: [
    PageHeaderComponent,
    MetricsCardComponent,
    SearchFilterComponent,
    DataTableComponent,
  ],
  templateUrl: './get-petro-card.component.html',
  styleUrl: './get-petro-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetPetroCardComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly petroCardService = inject(PetroCardService);
  private readonly loadingService = inject(LoadingService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;
  private readonly petroCardStats =
    signal<IPetroCardGetStatsResponseDto | null>(null);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected metricsCards = computed(() => this.getMetricCardsData());

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      PETRO_CARD_TABLE_ENHANCED_CONFIG
    );
    this.searchFilterConfig = SEARCH_FILTER_PETRO_CARD_FORM_CONFIG;
  }

  private loadPetroCardList(): void {
    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading Petro Card',
      message: 'Please wait while we load the petro card...',
    });

    const paramData = this.prepareParamData();

    this.petroCardService
      .getPetroCardList(paramData)
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IPetroCardGetResponseDto) => {
          const { records, stats, totalRecords } = response;

          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
          this.petroCardStats.set(stats);
          this.logger.logUserAction('Petro card records loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.petroCardStats.set(null);
          this.logger.logUserAction('Failed to load petro card records', error);
        },
      });
  }

  private prepareParamData(): IPetroCardGetRequestDto {
    return this.tableServerSideFilterAndSortService.buildQueryParams<IPetroCardGetRequestDto>(
      this.tableFilterData,
      this.table.getHeaders()
    );
  }

  private mapTableData(response: IPetroCardGetBaseResponseDto[]): IPetroCard[] {
    return response.map((record: IPetroCardGetBaseResponseDto) => {
      return {
        id: record.id,
        cardNumber: record.cardNumber,
        status: record.isAllocated
          ? EPetroCardStatus.ALLOCATED
          : EPetroCardStatus.AVAILABLE,
        vehicleNumber: record.allocatedVehicle
          ? record.allocatedVehicle.number
          : null,
        vehicleName: record.allocatedVehicle
          ? record.allocatedVehicle.name
          : null,
        addedBy: record.createdBy, // TODO: Get the employee name from the employee service
        employeeId: record.createdBy, // TODO: Get the employee id from the employee service
        addedAt: record.createdAt,
        cardName: record.cardName,
        originalRawData: record,
      };
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadPetroCardList();
  }

  private getMetricCardsData(): IMetric[] {
    const stats = this.petroCardStats();
    if (!stats) {
      return [];
    }

    return [
      { label: 'Total', value: stats.total },
      { label: 'Available', value: stats.available },
      { label: 'Assigned', value: stats.allocated },
    ];
  }

  protected handlePetroCardTableActionClick(
    event: ITableActionClickEvent<IPetroCardGetBaseResponseDto>,
    isBulk: boolean
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (actionType === EButtonActionType.EDIT) {
      this.navigateToEditPetroCard(selectedFirstRow.id, selectedFirstRow);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamicComponentInputs: any = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadPetroCardList();
      },
    };

    if (actionType === EButtonActionType.DELETE) {
      dynamicComponentInputs.dialogActionType = actionType;
    }

    const recordDetail = this.preparePetroCardRecordDetail(selectedFirstRow);

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      PETRO_CARD_ACTION_CONFIG_MAP[actionType],
      recordDetail,
      isBulk,
      !isBulk,
      dynamicComponentInputs
    );
  }

  private preparePetroCardRecordDetail(
    selectedRow: IPetroCardGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Card Name',
        value: selectedRow.cardName,
      },
      {
        label: 'Card Number',
        value: selectedRow.cardNumber,
      },
      {
        label: 'Allocated To',
        value: selectedRow.allocatedVehicle?.name ?? '-',
      },
    ];
    return {
      details: [
        {
          status: {
            approvalStatus: selectedRow.isAllocated
              ? EPetroCardStatus.ALLOCATED
              : EPetroCardStatus.AVAILABLE,
          },
          entryData,
        },
      ],
    };
  }

  private navigateToEditPetroCard(
    petroCardId: string,
    selectedRow: IPetroCardGetBaseResponseDto
  ): void {
    try {
      const routeSegments = [
        ROUTE_BASE_PATHS.TRANSPORT,
        ROUTE_BASE_PATHS.PETRO_CARD,
        ROUTES.PETRO_CARD.EDIT,
        petroCardId,
      ];

      const success = this.routerNavigationService.navigateWithState(
        routeSegments,
        { cardData: selectedRow }
      );

      if (!success) {
        this.logger.logUserAction('Navigation failed for edit petro card', {
          petroCardId,
        });
      }
    } catch (error) {
      this.logger.logUserAction(
        'Navigation error while editing petro card',
        error
      );
    }
  }

  protected onHeaderButtonClick(actionName: string): void {
    let navigationRoute: string[] = [];
    if (actionName === 'addPetroCard') {
      navigationRoute = [
        ROUTE_BASE_PATHS.TRANSPORT,
        ROUTE_BASE_PATHS.PETRO_CARD,
        ROUTES.PETRO_CARD.ADD,
      ];
    }
    const success =
      this.routerNavigationService.navigateToRoute(navigationRoute);

    if (!success) {
      this.logger.logUserAction(
        'Navigation failed for header button',
        navigationRoute
      );
    }
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: 'Petro Card Management',
      subtitle: 'Manage petro card records',
      showHeaderButton: true,
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Add Petro Card',
          actionName: 'addPetroCard',
        },
      ],
    };
  }
}
