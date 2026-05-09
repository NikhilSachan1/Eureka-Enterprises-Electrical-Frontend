import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EDocContext } from '@features/site-management/doc-management/types/doc.enum';
import { APP_CONFIG } from '@core/config';
import { LoggerService } from '@core/services';
import {
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
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEnhancedTable,
  ITableActionClickEvent,
} from '@shared/types';
import { TableLazyLoadEvent } from 'primeng/table';
import { PO_ACTION_CONFIG_MAP, PO_TABLE_ENHANCED_CONFIG } from '../../config';
import {
  IPoGetBaseResponseDto,
  IPoGetFormDto,
  IPoGetResponseDto,
} from '../../types/po.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { PoService } from '../../services/po.service';
import { IPo } from '../../types/po.interface';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { ICONS } from '@shared/constants';
import { GetPoDetailComponent } from '../get-po-detail/get-po-detail.component';
import {
  getParamFromRouteAncestors,
  getRouteDataFromAncestors,
} from '@shared/utility';

@Component({
  selector: 'app-get-po',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DataTableComponent, CurrencyPipe, DatePipe],
  templateUrl: './get-po.component.html',
  styleUrl: './get-po.component.scss',
})
export class GetPoComponent implements OnInit {
  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly icons = ICONS;

  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly loadingService = inject(LoadingService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly drawerService = inject(DrawerService);
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );
  private readonly poService = inject(PoService);
  private readonly route = inject(ActivatedRoute);

  private docContext?: EDocContext | null;

  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;

  ngOnInit(): void {
    this.docContext = getRouteDataFromAncestors<EDocContext>(
      this.route,
      'docContext'
    );
    this.table = this.dataTableService.createTable(
      PO_TABLE_ENHANCED_CONFIG(this.docContext)
    );
  }

  private loadPoList(): void {
    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading PO',
      message: "We're loading the PO. This will just take a moment.",
    });

    const paramData = this.prepareParamData();

    this.poService
      .getPoList(paramData)
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IPoGetResponseDto) => {
          const { records, totalRecords } = response;

          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });

          this.logger.logUserAction('PO records loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.logger.logUserAction('Failed to load PO records', error);
        },
      });
  }

  private prepareParamData(): IPoGetFormDto {
    const base =
      this.tableServerSideFilterAndSortService.buildQueryParams<IPoGetFormDto>(
        this.tableFilterData,
        this.table.getHeaders()
      );

    const siteName = getParamFromRouteAncestors(this.route, 'projectId');
    const docType = getRouteDataFromAncestors<EDocContext>(
      this.route,
      'docContext'
    );
    return {
      ...base,
      ...(siteName ? { siteName } : {}),
      ...(docType !== undefined && docType !== null ? { docType } : {}),
    };
  }

  private mapTableData(response: IPoGetBaseResponseDto[]): IPo[] {
    return response.map((record: IPoGetBaseResponseDto) => {
      return {
        id: record.id,
        poDate: record.poDate,
        poNumber: record.poNumber,
        taxableAmount: record.taxableAmount,
        gstAmount: record.gstAmount,
        totalAmount: record.totalAmount,
        fileKey: record.fileKey,
        fileKeys: record.fileKey ? [record.fileKey] : [],
        approvalStatus: record.approvalStatus,
        isLocked: record.isLocked,
        unlockRequestedAt: record.unlockRequestedAt,
        unlockRequestedBy: record.unlockRequestedBy,
        unlockReason: record.unlockReason,
        invoicedTotal: record.invoicedTotal,
        bookedTotal: record.bookedTotal,
        paidTotal: record.paidTotal,
        lastInvoiceAt: record.lastInvoiceAt,
        lastPaymentAt: record.lastPaymentAt,
        contractor: record.contractor,
        vendor: record.vendor,
        originalRawData: record,
      };
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadPoList();
  }

  protected handlePoTableActionClick(
    event: ITableActionClickEvent<IPoGetBaseResponseDto>
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (actionType === EButtonActionType.VIEW) {
      this.showPoDetailsDrawer(selectedFirstRow);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamicComponentInputs: any = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadPoList();
      },
    };

    const recordDetail = this.preparePoRecordDetail(selectedFirstRow);

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      PO_ACTION_CONFIG_MAP[actionType],
      recordDetail,
      false,
      true,
      dynamicComponentInputs
    );
  }

  private preparePoRecordDetail(
    selectedRow: IPoGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'PO Date',
        value: selectedRow.poDate,
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      {
        label: 'PO Taxable Amount',
        value: selectedRow.taxableAmount,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      {
        label: 'PO GST Amount',
        value: selectedRow.gstAmount,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      {
        label: 'PO Total Amount',
        value: selectedRow.totalAmount,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      {
        label: 'Attachment(s)',
        value: [selectedRow.fileKey],
        type: EDataType.ATTACHMENTS,
      },
    ];
    return {
      details: [
        {
          status: {
            entryType: selectedRow.partyType,
            approvalStatus: selectedRow.approvalStatus,
          },
          entryData,
        },
      ],
      entity: {
        name: `${selectedRow.contractor?.name} ${selectedRow.vendor?.name}`,
        subtitle: `${selectedRow.poNumber}`,
      },
    };
  }

  private showPoDetailsDrawer(rowData: IPoGetBaseResponseDto): void {
    this.logger.logUserAction('Opening PO details drawer', rowData);

    this.drawerService.showDrawer(GetPoDetailComponent, {
      header: `PO Details`,
      subtitle: `Detailed view of PO`,
      componentData: {
        po: rowData,
      },
    });
  }
}
