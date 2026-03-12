import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  AppConfigurationService,
  ConfirmationDialogService,
  DrawerService,
  RouterNavigationService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import { LoggerService } from '@core/services';
import { DsrService } from '@features/site-management/project-management/services/dsr.service';
import {
  IDsrGetBaseResponseDto,
  IDsrGetFormDto,
  IDsrGetResponseDto,
} from '@features/site-management/project-management/types/project.dto';
import {
  DSR_ACTION_CONFIG_MAP,
  DSR_TABLE_ENHANCED_CONFIG,
  SEARCH_FILTER_DSR_FORM_CONFIG,
} from '@features/site-management/project-management/config';
import { APP_CONFIG } from '@core/config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import {
  EButtonActionType,
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEnhancedTable,
  ITableActionClickEvent,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { TableLazyLoadEvent } from 'primeng/table';
import { IDsr } from '@features/site-management/project-management/types/project.interface';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { GetDsrDetailComponent } from '../get-dsr-detail/get-dsr-detail.component';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';

@Component({
  selector: 'app-get-dsr',
  imports: [DataTableComponent, SearchFilterComponent],
  templateUrl: './get-dsr.component.html',
  styleUrl: './get-dsr.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetDsrComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dsrService = inject(DsrService);
  private readonly dataTableService = inject(TableService);
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly drawerService = inject(DrawerService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly routerNavigationService = inject(RouterNavigationService);

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(DSR_TABLE_ENHANCED_CONFIG);
    this.searchFilterConfig = SEARCH_FILTER_DSR_FORM_CONFIG;
  }

  private loadDsrList(): void {
    this.table.setLoading(true);

    const paramData = this.prepareParamData();

    this.dsrService
      .getDSRList(paramData)
      .pipe(
        finalize(() => this.table.setLoading(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IDsrGetResponseDto) => {
          const { records, totalRecords } = response;
          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
          this.logger.logUserAction('DSR records loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.logger.logUserAction('Failed to load DSR records', error);
        },
      });
  }

  private prepareParamData(): IDsrGetFormDto {
    return this.tableServerSideFilterAndSortService.buildQueryParams<IDsrGetFormDto>(
      this.tableFilterData,
      this.table.getHeaders()
    );
  }

  private mapTableData(records: IDsrGetBaseResponseDto[]): IDsr[] {
    return records.map(record => {
      return {
        id: record.id,
        reportDate: record.reportDate,
        workTypes: record.workTypes
          .map(workType =>
            getMappedValueFromArrayOfObjects(
              this.appConfigurationService.projectWorkTypes(),
              workType
            )
          )
          .join(', '),
        reportingEngineerName: record.reportingEngineerName,
        reportingEngineerContact: record.reportingEngineerContact,
        remarks: record.remarks,
        createdByUser: {
          ...record.createdByUser,
          fullName: `${record.createdByUser.firstName} ${record.createdByUser.lastName}`,
        },
        originalRawData: record,
      };
    });
  }

  protected onTableStateChange(event: TableLazyLoadEvent): void {
    this.tableFilterData = event;
    this.loadDsrList();
  }

  protected handleDsrTableActionClick(
    event: ITableActionClickEvent<IDsrGetBaseResponseDto>,
    isBulk = false
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedRow] = selectedRows;

    if (actionType === EButtonActionType.VIEW) {
      this.showDsrDetailsDrawer(selectedRow);
      return;
    }

    if (actionType === EButtonActionType.EDIT) {
      this.navigateToEditDsr(selectedRow.id);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamicComponentInputs: any = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadDsrList();
      },
    };

    const recordDetail = this.prepareDsrRecordDetail(selectedRow);

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      DSR_ACTION_CONFIG_MAP[actionType],
      recordDetail,
      isBulk,
      !isBulk,
      dynamicComponentInputs
    );
  }

  private prepareDsrRecordDetail(
    selectedRow: IDsrGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Status Date',
        value: selectedRow.reportDate,
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      {
        label: 'Work Types',
        value: selectedRow.workTypes
          .map(workType =>
            getMappedValueFromArrayOfObjects(
              this.appConfigurationService.projectWorkTypes(),
              workType
            )
          )
          .join(', '),
      },
      // {
      //   label: 'Attachment(s)',
      //   value: selectedRow.fileKeys,
      //   type: EDataType.ATTACHMENTS,
      // },
    ];
    return {
      details: [
        {
          entryData,
        },
      ],
      entity: {
        name: `${selectedRow.createdByUser.firstName} ${selectedRow.createdByUser.lastName}`,
        subtitle: selectedRow.createdByUser.employeeId,
      },
    };
  }

  private showDsrDetailsDrawer(rowData: IDsrGetBaseResponseDto): void {
    this.logger.logUserAction('Opening expense details drawer', rowData);

    this.drawerService.showDrawer(GetDsrDetailComponent, {
      header: `DSR Details`,
      subtitle: `Detailed view of DSR`,
      componentData: {
        dsr: rowData,
      },
    });
  }

  private navigateToEditDsr(dsrId: string): void {
    try {
      const routeSegments = [
        ROUTE_BASE_PATHS.SITE.BASE,
        ROUTE_BASE_PATHS.SITE.PROJECT,
        ROUTES.SITE.PROJECT.DAILY_STATUS.EDIT,
        dsrId,
      ];

      void this.routerNavigationService.navigateToRoute(routeSegments);
    } catch (error) {
      this.logger.logUserAction('Navigation error while editing DSR', error);
    }
  }
}
