import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { LoggerService } from '@core/services';
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
  IEnhancedTable,
  IEnhancedTableConfig,
  ITableActionClickEvent,
} from '@shared/types';
import { DocService } from '../../services/doc.service';
import { DOC_ACTION_CONFIG_MAP, DOC_TABLE_ENHANCED_CONFIG } from '../../config';
import { TableLazyLoadEvent } from 'primeng/table';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  IDocGetBaseResponseDto,
  IDocGetFormDto,
  IDocGetResponseDto,
} from '../../types/doc.dto';
import { IDoc } from '../../types/doc.interface';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';

@Component({
  selector: 'app-get-doc',
  imports: [DataTableComponent],
  templateUrl: './get-doc.component.html',
  styleUrl: './get-doc.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetDocComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly docService = inject(DocService);
  private readonly loadingService = inject(LoadingService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly drawerService = inject(DrawerService);
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );
  protected table!: IEnhancedTable;
  protected tableFilterData!: TableLazyLoadEvent;

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      DOC_TABLE_ENHANCED_CONFIG as IEnhancedTableConfig
    );
  }

  private loadDocList(): void {
    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading DOC',
      message: 'Please wait while we load the DOC...',
    });

    const paramData = this.prepareParamData();

    this.docService
      .getDocList(paramData)
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IDocGetResponseDto) => {
          const { records, totalRecords } = response;

          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
          this.logger.logUserAction('DOC records loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.logger.logUserAction('Failed to load DOC records', error);
        },
      });
  }

  private prepareParamData(): IDocGetFormDto {
    return this.tableServerSideFilterAndSortService.buildQueryParams<IDocGetFormDto>(
      this.tableFilterData,
      this.table.getHeaders()
    );
  }

  private mapTableData(response: IDocGetBaseResponseDto[]): IDoc[] {
    return response.map((record: IDocGetBaseResponseDto) => {
      return {
        id: record.id,
        documentDate: record.documentDate,
        documentType: getMappedValueFromArrayOfObjects(
          this.appConfigurationService.projectDocumentTypes(),
          record.documentType
        ),
        documentNumber: record.documentNumber,
        amount: record.amount,
        remarks: record.remarks,
        originalRawData: record,
        docDocuments: [],
      } satisfies IDoc;
    });
  }

  protected onTableStateChange(tableFilterData: TableLazyLoadEvent): void {
    this.tableFilterData = tableFilterData;
    this.loadDocList();
  }

  protected handleDocTableActionClick(
    event: ITableActionClickEvent<IDocGetBaseResponseDto>,
    isBulk: boolean
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    if (actionType === EButtonActionType.VIEW) {
      this.showDocDetailsDrawer(selectedFirstRow);
      return;
    }

    if (actionType === EButtonActionType.EDIT) {
      this.navigateToEditDoc(selectedFirstRow.id);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dynamicComponentInputs: any = {
      selectedRecord: selectedRows,
      onSuccess: () => {
        this.loadDocList();
      },
    };

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      DOC_ACTION_CONFIG_MAP[actionType],
      null,
      isBulk,
      !isBulk,
      dynamicComponentInputs
    );
  }

  private showDocDetailsDrawer(rowData: IDocGetBaseResponseDto): void {
    this.logger.logUserAction('Opening DOC details drawer', rowData);

    // this.drawerService.showDrawer(GetDocDetailComponent, {
    //   header: `DOC Details`,
    //   subtitle: `Detailed view of DOC`,
    //   componentData: {
    //     doc: rowData,
    //   },
    // });
  }

  private navigateToEditDoc(docId: string): void {
    try {
      const routeSegments = [
        ROUTE_BASE_PATHS.SITE.BASE,
        ROUTE_BASE_PATHS.SITE.DOC,
        ROUTES.SITE.DOC.EDIT,
        docId,
      ];

      void this.routerNavigationService.navigateToRoute(routeSegments);
    } catch (error) {
      this.logger.logUserAction('Navigation error while editing DOC', error);
    }
  }
}
