import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  PAYROLL_ACTION_CONFIG_MAP,
  PAYSLIP_TABLE_ENHANCED_CONFIG,
  SEARCH_FILTER_PAYSLIP_FORM_CONFIG,
} from '@features/payroll-management/config';
import { PayrollService } from '@features/payroll-management/services/payroll.service';
import {
  IPayslipGetBaseResponseDto,
  IPayslipGetFormDto,
  IPayslipGetResponseDto,
} from '@features/payroll-management/types/payroll.dto';
import { IPayslip } from '@features/payroll-management/types/payroll.interface';
import {
  AppConfigurationService,
  ConfirmationDialogService,
  DrawerService,
  GalleryService,
  LoadingService,
  TableServerSideParamsBuilderService,
  TableService,
} from '@shared/services';
import {
  EButtonActionType,
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEnhancedTable,
  IGalleryInputData,
  IPageHeaderConfig,
  ITableActionClickEvent,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { TableLazyLoadEvent } from 'primeng/table';
import { finalize } from 'rxjs';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { ChipComponent } from '@shared/components/chip/chip.component';
import {
  getMappedValueFromArrayOfObjects,
  StatusUtil,
  formatMonthYear,
} from '@shared/utility';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { COMMON_PAGE_HEADER_ACTIONS } from '@shared/config/common-page-header-actions.config';
import { APP_CONFIG } from '@core/config';
import { GetPayslipDetailComponent } from '../get-payslip-detail/get-payslip-detail.component';
import { PAYROLL_MESSAGES } from '@features/payroll-management/constants';
import { ICONS } from '@shared/constants';
import { APP_PERMISSION } from '@core/constants/app-permission.constant';

@Component({
  selector: 'app-get-payslip',
  imports: [
    PageHeaderComponent,
    DataTableComponent,
    ChipComponent,
    SearchFilterComponent,
  ],
  templateUrl: './get-payslip.component.html',
  styleUrl: './get-payslip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetPayslipComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly payrollService = inject(PayrollService);
  private readonly loadingService = inject(LoadingService);
  private readonly galleryService = inject(GalleryService);
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly drawerService = inject(DrawerService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      PAYSLIP_TABLE_ENHANCED_CONFIG
    );
    this.searchFilterConfig = SEARCH_FILTER_PAYSLIP_FORM_CONFIG;
  }

  private loadPayslipList(): void {
    this.table.setLoading(true);
    this.loadingService.show({
      title: PAYROLL_MESSAGES.LOADING.PAYSLIP_LIST,
      message: PAYROLL_MESSAGES.LOADING_MESSAGES.PAYSLIP_LIST,
    });
    const paramData = this.prepareParamData();

    this.payrollService
      .getPayslipList(paramData)
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IPayslipGetResponseDto) => {
          const { records, totalRecords } = response;
          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
        },
        error: () => {
          this.table.setData([]);
        },
      });
  }

  private prepareParamData(): IPayslipGetFormDto {
    return this.tableServerSideFilterAndSortService.buildQueryParams<IPayslipGetFormDto>(
      this.tableFilterData,
      this.table.getHeaders()
    );
  }

  private mapTableData(response: IPayslipGetBaseResponseDto[]): IPayslip[] {
    return response.map((record: IPayslipGetBaseResponseDto) => {
      return {
        id: record.id,
        employeeName:
          `${record.user?.firstName ?? ''} ${record.user?.lastName ?? ''}`.trim(),
        employeeCode: record.user?.employeeId ?? '',
        period: formatMonthYear(record.month, record.year),
        attendanceDetails: {
          totalDays: record.totalDays,
          workingDays: record.workingDays,
          presentDays: record.presentDays,
          absentDays: record.absentDays,
          paidLeaveDays: record.paidLeaveDays,
          holidays: record.holidays,
          holidaysWorked: record.holidaysWorked,
        },
        grossEarnings: record.grossEarnings,
        totalDeductions: record.totalDeductions,
        netPayable: record.netPayable,
        status: record.status,
        viewPayslip: [record.id],
        originalRawData: record,
      };
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadPayslipList();
  }

  protected handlePayslipTableActionClick(
    event: ITableActionClickEvent<IPayslipGetBaseResponseDto>,
    isBulk: boolean
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (actionType === EButtonActionType.VIEW) {
      this.showPayslipDetailsDrawer(selectedFirstRow);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamicComponentInputs: any = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadPayslipList();
      },
    };

    if (
      actionType === EButtonActionType.PAID ||
      actionType === EButtonActionType.CANCEL ||
      actionType === EButtonActionType.APPROVE ||
      actionType === EButtonActionType.GENERATE
    ) {
      dynamicComponentInputs.dialogActionType = actionType;
    }

    const recordDetail = this.preparePayslipRecordDetail(selectedFirstRow);

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      PAYROLL_ACTION_CONFIG_MAP[actionType],
      recordDetail,
      isBulk,
      !isBulk,
      dynamicComponentInputs
    );
  }

  protected handleAttachmentClick(event: Record<string, unknown>): void {
    const payslip = event as IPayslipGetBaseResponseDto;
    if (!payslip.id) {
      return;
    }
    this.showPayslip(payslip);
  }

  private preparePayslipRecordDetail(
    selectedRow: IPayslipGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Period',
        value: formatMonthYear(selectedRow.month, selectedRow.year),
      },
      {
        label: 'Gross Earnings',
        value: selectedRow.grossEarnings,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      {
        label: 'Total Deductions',
        value: selectedRow.totalDeductions,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      {
        label: 'Net Payable',
        value: selectedRow.netPayable,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
    ];
    return {
      details: [
        {
          status: {
            approvalStatus: getMappedValueFromArrayOfObjects(
              this.appConfigurationService.payrollStatus(),
              selectedRow.status
            ),
          },
          entryData,
        },
      ],
      entity: {
        name: `${selectedRow.user?.firstName ?? ''} ${selectedRow.user?.lastName ?? ''}`,
        subtitle: selectedRow.user?.employeeId ?? '',
      },
    };
  }

  private showPayslipDetailsDrawer(rowData: IPayslipGetBaseResponseDto): void {
    this.drawerService.showDrawer(GetPayslipDetailComponent, {
      header: `Payslip Details`,
      subtitle: PAYROLL_MESSAGES.DRAWER.PAYSLIP_DETAIL_SUBTITLE,
      componentData: {
        payslip: rowData,
      },
    });
  }

  private generatePayroll(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamicComponentInputs: any = {
      onSuccess: () => {
        this.loadPayslipList();
      },
    };
    this.confirmationDialogService.showConfirmationDialog(
      EButtonActionType.GENERATE,
      PAYROLL_ACTION_CONFIG_MAP[EButtonActionType.GENERATE],
      undefined,
      false,
      false,
      dynamicComponentInputs
    );
  }

  private showPayslip(payslip: IPayslipGetBaseResponseDto): void {
    this.loadingService.show({
      title: PAYROLL_MESSAGES.LOADING.PAYSLIP_DETAIL,
      message: PAYROLL_MESSAGES.LOADING_MESSAGES.PAYSLIP_DETAIL,
    });

    this.payrollService
      .getPayslipBlob(payslip.id)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (blob: Blob) => {
          const blobUrl = URL.createObjectURL(blob);
          const galleryMedia: IGalleryInputData[] = [
            {
              mediaKey: `payslip-${payslip.id}.pdf`,
              actualMediaUrl: blobUrl,
            },
          ];
          this.galleryService.show(galleryMedia);
        },
        error: () => {
          // Payslip detail load failed - silently fail
        },
      });
  }

  protected onHeaderButtonClick(actionName: string): void {
    if (actionName === 'generatePayroll') {
      this.generatePayroll();
    }
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: PAYROLL_MESSAGES.PAGE_HEADER.PAYSLIP_MANAGEMENT_TITLE,
      subtitle: PAYROLL_MESSAGES.PAGE_HEADER.PAYSLIP_MANAGEMENT_SUBTITLE,
      showHeaderButton: true,
      headerButtonConfig: [
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_1,
          label: 'Generate Payroll',
          actionName: 'generatePayroll',
          permission: [APP_PERMISSION.PAYROLL.GENERATE],
        },
        {
          ...COMMON_PAGE_HEADER_ACTIONS.PAGE_HEADER_BUTTON_2,
          icon: ICONS.COMMON.DOWNLOAD,
          label: 'Download Monthly Report',
          actionName: 'downloadMonthlyReport',
          permission: [APP_PERMISSION.PAYROLL.MONTHLY_REPORT],
        },
      ],
    };
  }

  protected getChipStyleClass(statusKey: string): string {
    const colorClass = StatusUtil.getColorClass(statusKey);
    return `text-xs font-medium ${colorClass.bg}`;
  }
}
