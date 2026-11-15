import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import { ProjectListInsightsService } from '@features/site-management/project-management/services/project-list-insights.service';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { RouterNavigationService } from '@shared/services';
import { TooltipModule } from 'primeng/tooltip';
import { compactInr } from '../../utility/profitability-chart.util';

/**
 * Project list cell: a project's margin, how much of its revenue went to cost, and its net
 * profit. Loads through the list's batched P&L summary; opens the project's profitability tab.
 */
@Component({
  selector: 'app-project-pnl-cell',
  imports: [DecimalPipe, TooltipModule],
  templateUrl: './project-pnl-cell.component.html',
  styleUrl: './project-pnl-cell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectPnlCellComponent {
  private readonly insights = inject(ProjectListInsightsService);
  private readonly routerNavigationService = inject(RouterNavigationService);

  readonly projectId = input.required<string>();

  protected readonly entry = computed(() =>
    this.insights.pnlOf(this.projectId())
  );

  protected readonly view = computed(() => {
    const data = this.entry()?.data;
    if (!data) {
      return null;
    }
    const isLoss = data.netProfit < 0;
    // Cost as a share of revenue; on a loss the whole bar is cost.
    const costShare =
      data.revenue > 0
        ? Math.min((data.totalProjectCost / data.revenue) * 100, 100)
        : 100;
    return {
      hasRevenue: data.revenue > 0,
      /** Anything billed or spent yet. */
      hasActivity: data.revenue > 0 || data.totalProjectCost > 0,
      isLoss,
      margin: data.profitMarginPercentage,
      costShare,
      net: compactInr(data.netProfit),
      revenue: compactInr(data.revenue),
      cost: compactInr(data.totalProjectCost),
    };
  });

  constructor() {
    effect(() => {
      const projectId = this.projectId();
      untracked(() => this.insights.requestPnl(projectId));
    });
  }

  protected openProfitability(event: Event): void {
    event.stopPropagation();
    void this.routerNavigationService.navigateWithQueryParams(
      [
        ROUTE_BASE_PATHS.SITE.BASE,
        ROUTE_BASE_PATHS.SITE.PROJECT,
        ROUTES.SITE.PROJECT.WORKSPACE,
        ROUTES.SITE.PROJECT.PROFITABILITY,
      ],
      { projectId: this.projectId() }
    );
  }
}
