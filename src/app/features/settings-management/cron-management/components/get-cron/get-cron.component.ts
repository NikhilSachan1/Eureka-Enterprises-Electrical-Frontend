import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { SearchFilterComponent } from '@shared/components/search-filter/search-filter.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { LoggerService } from '@core/services';
import {
  ConfirmationDialogService,
  LoadingService,
  TableService,
} from '@shared/services';
import { CronService } from '../../services/cron.service';
import {
  EDataType,
  IDataViewDetails,
  IDataViewDetailsWithEntity,
  IEnhancedTable,
  IPageHeaderConfig,
  ITableActionClickEvent,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ICronGetJobDto, ICronGetResponseDto } from '../../types/cron.dto';
import { ICron } from '../../types/cron.interface';
import {
  CRON_ACTION_CONFIG_MAP,
  CRON_TABLE_ENHANCED_CONFIG,
  SEARCH_FILTER_CRON_FORM_CONFIG,
} from '../../configs';
import { toTitleCase } from '@shared/utility';

@Component({
  selector: 'app-get-cron',
  imports: [PageHeaderComponent, SearchFilterComponent, DataTableComponent],
  templateUrl: './get-cron.component.html',
  styleUrl: './get-cron.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetCronComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dataTableService = inject(TableService);
  private readonly cronService = inject(CronService);
  private readonly loadingService = inject(LoadingService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );

  protected table!: IEnhancedTable;
  protected searchFilterConfig!: ITableSearchFilterFormConfig;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  ngOnInit(): void {
    this.table = this.dataTableService.createTable(CRON_TABLE_ENHANCED_CONFIG);
    this.searchFilterConfig = SEARCH_FILTER_CRON_FORM_CONFIG;
    this.loadCronJobList();
  }

  private loadCronJobList(): void {
    this.table.setLoading(true);
    this.loadingService.show({
      title: 'Loading cron jobs',
      message: 'Please wait while we load scheduled jobs...',
    });

    this.cronService
      .getCronJobList()
      .pipe(
        finalize(() => {
          this.table.setLoading(false);
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ICronGetResponseDto) => {
          const mapped = this.mapTableData(response.jobs);
          this.table.setData(mapped);
          this.table.updateTableConfig({ totalRecords: mapped.length });
          this.logger.logUserAction('Cron jobs loaded successfully');
        },
        error: error => {
          this.table.setData([]);
          this.table.updateTableConfig({ totalRecords: 0 });
          this.logger.logUserAction('Failed to load cron jobs', error);
        },
      });
  }

  private mapTableData(jobs: ICronGetJobDto[]): ICron[] {
    return jobs.map(job => ({
      id: job.name,
      cronJobTitle: this.formatCronLabel(job.name),
      cronJobName: job.name,
      cronJobDescription: job.description,
      requiredParameters: job.requiredParameters,
      dependencies: job.dependencies,
      originalRawData: job,
    }));
  }

  protected handleCronTableActionClick(
    event: ITableActionClickEvent<ICronGetJobDto>,
    isBulk: boolean
  ): void {
    const { actionType, selectedRows } = event;
    const [selectedFirstRow] = selectedRows;

    const recordDetail = this.prepareCronRecordDetail(selectedFirstRow);

    this.confirmationDialogService.showConfirmationDialog(
      actionType,
      CRON_ACTION_CONFIG_MAP[actionType],
      recordDetail,
      isBulk,
      !isBulk,
      {
        selectedRecord: selectedRows,
      }
    );
  }

  private prepareCronRecordDetail(
    selectedRow: ICronGetJobDto
  ): IDataViewDetailsWithEntity {
    const entryData: IDataViewDetails['entryData'] = [
      {
        label: 'Display name',
        value: toTitleCase(selectedRow.name.replaceAll('_', ' ').trim()),
        type: EDataType.TEXT,
      },
      {
        label: 'Job key',
        value: selectedRow.name,
        type: EDataType.TEXT,
      },
      {
        label: 'Description',
        value: selectedRow.description,
        type: EDataType.TEXT,
      },
      {
        label: 'Required parameters',
        value:
          selectedRow.requiredParameters.length > 0
            ? selectedRow.requiredParameters
                .map(p => this.formatCronLabel(p))
                .join(', ')
            : 'N/A',
        type: EDataType.TEXT,
      },
      {
        label: 'Dependencies',
        value:
          selectedRow.dependencies.length > 0
            ? selectedRow.dependencies
                .map(d => this.formatCronLabel(d))
                .join(', ')
            : 'N/A',
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

  protected formatCronLabel(label: string): string {
    return toTitleCase(label.replaceAll('_', ' ').trim());
  }

  protected accentTone(raw: string): number {
    let h = 0;
    for (let i = 0; i < raw.length; i++) {
      h = (Math.imul(31, h) + raw.charCodeAt(i)) | 0;
    }
    return Math.abs(h) % 4;
  }

  private getPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: 'Cron management',
      subtitle: 'View and trigger scheduled jobs',
      showHeaderButton: false,
    };
  }
}
