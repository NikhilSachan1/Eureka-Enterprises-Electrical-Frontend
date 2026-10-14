import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, finalize } from 'rxjs';
import { APP_CONFIG } from '@core/config';
import { LoggerService } from '@core/services';
import { DashboardService } from '@features/dashboard/services/dashboard.services';
import { IDocumentGapDetailGetResponseDto } from '@features/dashboard/types/dashboard.dto';
import {
  documentGapListCommands,
  documentGapParty,
  isMissingDocumentNumber,
} from '@features/dashboard/utils/document-gap-link.util';
import { DOC_TAB_SEARCH_QUERY_KEY, ICONS } from '@shared/constants';
import { DRAWER_DATA } from '@shared/constants/drawer.constants';
import { DrawerService } from '@shared/services';

type GapDetailRow = {
  id: string;
  documentLabel: string;
  siteName: string;
  amount: number | null;
  since: string | null;
  commands: string[];
  query: Record<string, string>;
};

const SECTION_ORDER = ['contractor', 'vendor', 'other'] as const;

@Component({
  selector: 'app-document-gap-detail',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './document-gap-detail.component.html',
  styleUrl: './document-gap-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentGapDetailComponent implements OnInit {
  private readonly drawerData = inject(DRAWER_DATA) as { key: string };
  private readonly dashboardService = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(LoggerService);
  private readonly drawerService = inject(DrawerService);

  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly icons = ICONS;
  protected readonly loading = signal(true);
  protected readonly detail = signal<IDocumentGapDetailGetResponseDto | null>(
    null
  );
  protected readonly errorMessage = signal<string | null>(null);

  private readonly gapKey = this.drawerData.key;

  protected readonly bannerCommands = computed(() =>
    documentGapListCommands(this.gapKey, this.detail()?.partyType)
  );

  protected readonly sections = computed(() => {
    const gap = this.detail();
    if (!gap) {
      return [];
    }

    const buckets: Record<(typeof SECTION_ORDER)[number], GapDetailRow[]> = {
      contractor: [],
      vendor: [],
      other: [],
    };

    for (const item of gap.items) {
      const partyType = item.partyType ?? gap.partyType;
      const party = documentGapParty(partyType) ?? 'other';
      const missingNumber = isMissingDocumentNumber(item.documentNumber);
      const number = item.documentNumber?.trim() ?? '';

      buckets[party].push({
        id: item.id,
        documentLabel: missingNumber ? '(no number)' : number,
        siteName: item.siteName || '—',
        amount: item.amount ?? null,
        since: item.since ?? null,
        commands: documentGapListCommands(this.gapKey, partyType),
        query: missingNumber
          ? {}
          : { [DOC_TAB_SEARCH_QUERY_KEY]: number },
      });
    }

    return SECTION_ORDER.filter(tone => buckets[tone].length > 0).map(tone => ({
      key: tone,
      tone,
      title: tone === 'contractor' ? 'Contractor' : tone === 'vendor' ? 'Vendor' : '',
      hasAmount: buckets[tone].some(row => row.amount != null),
      items: buckets[tone],
    }));
  });

  ngOnInit(): void {
    this.dashboardService
      .getDocumentGapDetail(this.gapKey)
      .pipe(
        finalize(() => this.loading.set(false)),
        catchError((error: HttpErrorResponse) => {
          const raw = error.error?.error?.message;
          this.errorMessage.set(
            typeof raw === 'string' && raw.trim()
              ? raw
              : 'Could not load this document gap.'
          );
          this.logger.logUserAction(
            'Failed to load document gap detail',
            error
          );
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(response => {
        this.detail.set(response);
        this.logger.logUserAction('Document gap detail loaded', {
          key: response.key,
        });
      });
  }

  protected closeDrawer(): void {
    this.drawerService.hideDrawer();
  }
}
