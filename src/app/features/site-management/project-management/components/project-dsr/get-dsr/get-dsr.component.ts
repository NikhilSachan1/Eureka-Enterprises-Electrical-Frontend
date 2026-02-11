import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  AppConfigurationService,
  AvatarService,
  ConfirmationDialogService,
  LoadingService,
  RouterNavigationService,
  TableServerSideParamsBuilderService,
} from '@shared/services';
import { ICONS } from '@shared/constants';
import { LoggerService } from '@core/services';
import { DsrService } from '@features/site-management/project-management/services/dsr.service';
import {
  IDsrGetFormDto,
  IDsrGetResponseDto,
} from '@features/site-management/project-management/types/project.dto';
import { APP_CONFIG } from '@core/config';
import { PaginatorState } from 'primeng/paginator';
import { PaginatorComponent } from '@shared/components/paginator/paginator.component';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface IDsrCardEntry {
  id: string;
  userName: string;
  employeeId: string;
  date: string;
  description: string;
  workType: string;
}

@Component({
  selector: 'app-get-dsr',
  imports: [CommonModule, PaginatorComponent],
  templateUrl: './get-dsr.component.html',
  styleUrl: './get-dsr.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetDsrComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dsrService = inject(DsrService);
  private readonly loadingService = inject(LoadingService);
  private readonly confirmationDialogService = inject(
    ConfirmationDialogService
  );
  private readonly tableServerSideFilterAndSortService = inject(
    TableServerSideParamsBuilderService
  );
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly avatarService = inject(AvatarService);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected icons = ICONS;

  protected readonly dsrEntries = signal<IDsrCardEntry[]>([]);
  protected readonly totalRecords = signal(0);
  protected readonly loading = signal(false);
  protected readonly paginatorFirst = signal(0);
  protected readonly paginatorRows = signal(
    APP_CONFIG.TABLE_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE
  );
  protected readonly tablePaginationConfig = APP_CONFIG.TABLE_PAGINATION_CONFIG;

  private get projectId(): string | null {
    return (
      this.activatedRoute.snapshot.params['projectId'] ??
      this.activatedRoute.snapshot.parent?.params['projectId'] ??
      null
    );
  }

  ngOnInit(): void {
    this.loadDsrList();
  }

  protected onPageChange(event: PaginatorState): void {
    this.paginatorFirst.set(event.first ?? 0);
    this.paginatorRows.set(
      event.rows ?? APP_CONFIG.TABLE_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE
    );
    this.loadDsrList();
  }

  private loadDsrList(): void {
    const { projectId } = this;
    if (!projectId) {
      this.logger.logUserAction('Get DSR: projectId not found in route');
      this.dsrEntries.set([]);
      this.totalRecords.set(0);
      return;
    }

    this.loading.set(true);
    const params: IDsrGetFormDto =
      this.tableServerSideFilterAndSortService.buildQueryParams<IDsrGetFormDto>(
        {
          first: this.paginatorFirst(),
          rows: this.paginatorRows(),
          sortField: undefined,
          sortOrder: 1,
          filters: {},
        },
        [],
        { projectName: projectId },
        APP_CONFIG.TABLE_PAGINATION_CONFIG.DEFAULT_PAGE_SIZE
      );

    this.dsrService
      .getDSRList(params)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IDsrGetResponseDto) => {
          this.totalRecords.set(response.totalRecords);
          this.dsrEntries.set(this.mapToCardEntries(response.records));
          this.logger.logUserAction('DSR records loaded successfully');
        },
        error: error => {
          this.dsrEntries.set([]);
          this.totalRecords.set(0);
          this.logger.logUserAction('Failed to load DSR records', error);
        },
      });
  }

  private mapToCardEntries(
    records: IDsrGetResponseDto['records']
  ): IDsrCardEntry[] {
    return records.map(record => ({
      id: record.id,
      userName:
        `${record.createdByUser?.firstName ?? ''} ${record.createdByUser?.lastName ?? ''}`.trim() ||
        '-',
      employeeId: record.createdByUser?.employeeId ?? '-',
      date: record.reportDate ?? '-',
      description: record.remarks,
      workType: Array.isArray(record.workTypes)
        ? record.workTypes.join(', ')
        : (record.workTypes ?? '-'),
    }));
  }

  getAvatarUrl(name: string): string {
    return this.avatarService.getAvatarFromName(name);
  }
}
