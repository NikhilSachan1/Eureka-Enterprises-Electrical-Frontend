import { CurrencyPipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APP_CONFIG } from '@core/config';
import { LoggerService } from '@core/services';
import { ProjectWorkspaceContextService } from '@features/site-management/project-management/services/project-workspace-context.service';
import { ChartsComponent } from '@shared/components/charts/charts.component';
import { EmptyMessagesComponent } from '@shared/components/empty-messages/empty-messages.component';
import { SectionLoaderComponent } from '@shared/components/section-loader/section-loader.component';
import { ICONS } from '@shared/constants';
import { TooltipModule } from 'primeng/tooltip';
import { finalize } from 'rxjs';
import { ProjectProfitabilityService } from '../../services/project-profitability.service';
import {
  IProjectProfitabilityGetFormDto,
  IProjectProfitabilityGetResponseDto,
} from '../../types/project-profitability.dto';
import {
  IProjectProfitabilityReport,
  ProfitabilityBreakdownType,
} from '../../types/project-profitability.interface';
import {
  buildDonutChart,
  compactInr,
} from '../../utility/profitability-chart.util';
import {
  buildProfitabilityView,
  PROFITABILITY_TONE_COLORS,
} from '../../utility/profitability-view.util';
import { ProfitabilityBreakdownComponent } from '../profitability-breakdown/profitability-breakdown.component';

@Component({
  selector: 'app-get-profitability',
  imports: [
    ChartsComponent,
    CurrencyPipe,
    DecimalPipe,
    EmptyMessagesComponent,
    ProfitabilityBreakdownComponent,
    SectionLoaderComponent,
    TooltipModule,
  ],
  templateUrl: './get-profitability.component.html',
  styleUrl: './get-profitability.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetProfitabilityComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(LoggerService);
  private readonly projectProfitabilityService = inject(
    ProjectProfitabilityService
  );
  private readonly workspaceContext = inject(ProjectWorkspaceContextService);

  protected readonly icons = ICONS;
  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly isLoading = signal(false);
  protected readonly report = signal<IProjectProfitabilityReport | null>(null);
  protected readonly view = computed(() => {
    const report = this.report();
    return report ? buildProfitabilityView(report) : null;
  });
  /** Headline ring: where each rupee of revenue went (costs only, on a loss). */
  protected readonly heroChart = computed(() => {
    const view = this.view();
    return view
      ? buildDonutChart(view.costShares, { title: 'Revenue split' })
      : null;
  });
  protected readonly netProfitCompact = computed(() =>
    compactInr(this.report()?.profitabilitySummary.netProfit ?? 0)
  );
  /** Rings on the receivable / payable cards: settled against still due. */
  protected readonly cashCharts = computed(() => {
    const view = this.view();
    if (!view) {
      return null;
    }
    return {
      in: buildDonutChart(
        [
          {
            label: 'Received',
            amount: view.receivable.settled,
            color: PROFITABILITY_TONE_COLORS.revenue,
          },
          {
            label: 'Still to receive',
            amount: view.receivable.outstanding,
            color: '#cbd5e1',
          },
        ],
        { cutout: '78%' }
      ),
      out: buildDonutChart(
        [
          {
            label: 'Paid',
            amount: view.payable.settled,
            color: PROFITABILITY_TONE_COLORS.vendor,
          },
          {
            label: 'Still to pay',
            amount: view.payable.outstanding,
            color: '#cbd5e1',
          },
        ],
        { cutout: '78%' }
      ),
    };
  });
  protected readonly hasSelectedProject =
    this.workspaceContext.selectedProjectId;
  /** Open tab of the breakdown section. */
  protected readonly breakdownType =
    signal<ProfitabilityBreakdownType>('sales-invoices');
  private readonly breakdown = viewChild('breakdown', { read: ElementRef });

  constructor() {
    effect(() => {
      const projectId = this.workspaceContext.selectedProjectId();
      this.workspaceContext.filterSubmitVersion();

      if (!projectId) {
        this.report.set(null);
        return;
      }

      this.loadProjectProfitability(projectId);
    });
  }

  /** Opens a statement line's tab in the breakdown and brings it into view. */
  protected showBreakdown(type: ProfitabilityBreakdownType): void {
    this.breakdownType.set(type);
    requestAnimationFrame(() =>
      this.breakdown()?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    );
  }

  private loadProjectProfitability(projectId: string): void {
    this.isLoading.set(true);
    this.report.set(null);
    this.breakdownType.set('sales-invoices');

    const paramData: IProjectProfitabilityGetFormDto = {
      projectName: projectId,
    };

    this.projectProfitabilityService
      .getProjectProfitability(paramData)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IProjectProfitabilityGetResponseDto) => {
          this.report.set(response);
          this.logger.logUserAction(
            'Project profitability loaded successfully'
          );
        },
        error: error => {
          this.report.set(null);
          this.logger.logUserAction(
            'Failed to load project profitability',
            error
          );
        },
      });
  }
}
