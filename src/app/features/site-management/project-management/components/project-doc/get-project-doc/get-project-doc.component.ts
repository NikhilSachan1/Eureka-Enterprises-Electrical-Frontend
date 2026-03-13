import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  ConfirmationDialogService,
  DrawerService,
  GalleryService,
  NotificationService,
  RouterNavigationService,
  TableService,
} from '@shared/services';
import { ProjectDocService } from '@features/site-management/project-management/services/project-doc.service';
import {
  ISiteDocumentGetBaseResponseDto,
  ISiteDocumentGetResponseDto,
} from '@features/site-management/project-management/types/project.dto';
import {
  PROJECT_DOC_ACTION_CONFIG_MAP,
  PROJECT_DOC_TABLE_ENHANCED_CONFIG,
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
} from '@shared/types';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { GetProjectDocDetailComponent } from '../get-project-doc-detail/get-project-doc-detail.component';

@Component({
  selector: 'app-get-project-doc',
  imports: [DataTableComponent],
  templateUrl: './get-project-doc.component.html',
  styleUrl: './get-project-doc.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetProjectDocComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly projectDocService = inject(ProjectDocService);
  private readonly dataTableService = inject(TableService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly drawerService = inject(DrawerService);
  private readonly galleryService = inject(GalleryService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly notificationService = inject(NotificationService);

  protected table!: IEnhancedTable;

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(
      PROJECT_DOC_TABLE_ENHANCED_CONFIG
    );
    this.loadDocumentList();
  }

  private loadDocumentList(): void {
    const projectId = this.activatedRoute.snapshot.params[
      'projectId'
    ] as string;

    this.table.setLoading(true);

    this.projectDocService
      .getList(projectId)
      .pipe(
        finalize(() => this.table.setLoading(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ISiteDocumentGetResponseDto) => {
          const records = response.records ?? [];
          const totalRecords = response.totalRecords ?? records.length;
          const mappedData = this.mapTableData(records);
          this.table.setData(mappedData);
          this.table.updateTableConfig({ totalRecords });
        },
        error: () => {
          this.table.setData([]);
        },
      });
  }

  private mapTableData(
    records: ISiteDocumentGetBaseResponseDto[]
  ): Record<string, unknown>[] {
    return records.map(record => ({
      id: record.id,
      documentNumber: record.documentNumber,
      documentType: record.documentType,
      documentDate: record.documentDate,
      amount: record.amount,
      gstAmount: record.gstAmount,
      totalAmount: record.totalAmount,
      status: record.status,
      paymentStatus: record.paymentStatus,
      remarks: record.remarks,
      documentKeys: record.documentKeys ?? [],
      originalRawData: record,
    }));
  }

  protected handleProjectDocTableActionClick(
    event: ITableActionClickEvent<ISiteDocumentGetBaseResponseDto>,
    isBulk = false
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedRow] = selectedRows;
    const rawRow = (selectedRow as Record<string, unknown>)?.[
      'originalRawData'
    ] as ISiteDocumentGetBaseResponseDto | undefined;
    const row =
      rawRow ?? (selectedRow as unknown as ISiteDocumentGetBaseResponseDto);

    if (actionType === EButtonActionType.VIEW) {
      this.showDocumentDetailsDrawer(row);
      return;
    }

    if (actionType === EButtonActionType.EDIT) {
      this.navigateToEditDocument(row.id);
      return;
    }

    if (actionType === EButtonActionType.DOWNLOAD) {
      this.handleDownload(row);
      return;
    }

    const dynamicComponentInputs = {
      selectedRecord: selectedRows,
      onSuccess: (): void => {
        this.loadDocumentList();
      },
    };

    const recordDetail = this.prepareDocumentRecordDetail(row);

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      PROJECT_DOC_ACTION_CONFIG_MAP[actionType],
      recordDetail,
      isBulk,
      !isBulk,
      dynamicComponentInputs
    );
  }

  private prepareDocumentRecordDetail(
    row: ISiteDocumentGetBaseResponseDto
  ): IDataViewDetailsWithEntity {
    const documentKeys = (row.documentKeys ?? []).filter(
      (k): k is string => !!k
    );
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Document Number',
        value: row.documentNumber ?? null,
      },
      {
        label: 'Type',
        value: row.documentType ?? null,
      },
      {
        label: 'Document Date',
        value: row.documentDate ?? null,
        type: EDataType.DATE,
        format: APP_CONFIG.DATE_FORMATS.DEFAULT,
      },
      {
        label: 'Amount',
        value: row.amount ?? null,
        type: EDataType.CURRENCY,
        format: APP_CONFIG.CURRENCY_CONFIG.DEFAULT,
      },
      {
        label: 'Attachment(s)',
        value: documentKeys,
        type: EDataType.ATTACHMENTS,
      },
    ];
    return {
      details: [{ entryData }],
      entity: {
        name: row.documentNumber ?? row.id,
        subtitle: row.documentType ?? '',
      },
    };
  }

  private showDocumentDetailsDrawer(
    row: ISiteDocumentGetBaseResponseDto
  ): void {
    this.drawerService.showDrawer(GetProjectDocDetailComponent, {
      header: 'Document Details',
      subtitle: row.documentNumber ?? 'View document',
      componentData: { document: row },
    });
  }

  private navigateToEditDocument(id: string): void {
    const routeSegments = [
      ROUTE_BASE_PATHS.SITE.BASE,
      ROUTE_BASE_PATHS.SITE.PROJECT,
      ROUTES.SITE.PROJECT.DOCUMENT.EDIT,
      id,
    ];
    void this.routerNavigationService.navigateToRoute(routeSegments);
  }

  private handleDownload(row: ISiteDocumentGetBaseResponseDto): void {
    const documentKeys = row.documentKeys ?? [];
    if (documentKeys.length === 0) {
      this.notificationService.info('No attachments to download');
      return;
    }
    const keys = documentKeys.filter((k): k is string => !!k);
    const media = keys.map((key: string) => ({
      mediaKey: key,
      actualMediaUrl: '',
    }));
    this.galleryService.show(media);
  }
}
