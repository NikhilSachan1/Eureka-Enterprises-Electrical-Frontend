import { CurrencyPipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { APP_CONFIG } from '@core/config';
import { LoggerService } from '@core/services';
import { LoadingService } from '@shared/services/loading.service';
import { finalize } from 'rxjs';
import {
  IProjectProfitabilityGetFormDto,
  IProjectProfitabilityGetResponseDto,
} from '../../types/project-profitability.dto';
import {
  IExpenseDetailView,
  IExpenseSummaryView,
  IProjectProfitabilityReport,
} from '../../types/project-profitability.interface';
import { ProjectProfitabilityService } from '../../services/project-profitability.service';

@Component({
  selector: 'app-get-profitability',
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './get-profitability.component.html',
  styleUrl: './get-profitability.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetProfitabilityComponent implements OnInit {
  private readonly loadingService = inject(LoadingService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(LoggerService);
  private readonly projectProfitabilityService = inject(
    ProjectProfitabilityService
  );
  private readonly activatedRoute = inject(ActivatedRoute);

  protected readonly APP_CONFIG = APP_CONFIG;
  private readonly projectId = signal<string>('');
  protected readonly report = signal<IProjectProfitabilityReport | null>(null);

  ngOnInit(): void {
    const projectId = this.activatedRoute.snapshot.params[
      'projectId'
    ] as string;
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    this.projectId.set(projectId);
    this.loadProjectProfitability();
  }

  private loadProjectProfitability(): void {
    this.loadingService.show({
      title: 'Loading Project Profitability',
      message: 'Please wait while we load the project profitability...',
    });

    const paramData = this.prepareParamData();

    this.projectProfitabilityService
      .getProjectProfitability(paramData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IProjectProfitabilityGetResponseDto) => {
          this.report.set(this.mapApiResponseToReport(response));
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

  private prepareParamData(): IProjectProfitabilityGetFormDto {
    return {
      projectName: this.projectId(),
    };
  }

  private mapApiResponseToReport(
    data: IProjectProfitabilityGetResponseDto
  ): IProjectProfitabilityReport {
    const rev = data.revenue;
    const exp = data.expenses;
    const prof = data.profitability;

    const totalPO = rev?.totalPOValue ?? 0;
    const invoiced = rev?.totalInvoiced ?? 0;
    const pending = rev?.pendingToInvoice ?? 0;
    const invoicesRaised = rev?.totalInvoicesRaised ?? 0;

    const totalExpense = exp?.total ?? 0;
    const salaryAmt = (exp?.employeeExpenses ?? 0) + (exp?.payrollCosts ?? 0);
    const fuelAmt = exp?.fuelExpenses ?? 0;
    const regularAmt = Math.max(0, totalExpense - salaryAmt - fuelAmt);

    const expenseSummary: IExpenseSummaryView[] = [
      {
        label: 'Salary & payroll',
        amount: salaryAmt,
        percentLabel: '0%',
      },
      {
        label: 'Fuel expense',
        amount: fuelAmt,
        percentLabel: '0%',
      },
      {
        label: 'Regular expense',
        amount: regularAmt,
        percentLabel: '0%',
      },
    ];

    const rawLines = exp?.categorizedBreakdown ?? [];
    const expenseDetail: IExpenseDetailView[] = rawLines.map(line => {
      const amount = line.amount ?? 0;
      return {
        label: line.label ?? '',
        amount,
        percentage: 0,
      };
    });

    const netProfit = invoiced - totalExpense;
    const marginPercent = prof?.profitMarginPercent ?? 0;

    return {
      kpiCards: [
        {
          label: 'Total Purchase Order',
          hint: 'Approved project order value',
          display: 'currency',
          value: totalPO,
        },
        {
          label: 'Invoices Raised',
          hint: 'Invoices cut till date',
          display: 'number',
          value: invoicesRaised,
        },
        {
          label: 'Invoiced Value',
          hint: 'Revenue billed to client',
          display: 'currency',
          value: invoiced,
        },
        {
          label: 'Unbilled PO Value',
          hint: 'Available billing headroom in PO',
          display: 'currency',
          value: pending,
        },
      ],
      expenseBreakdown: {
        totalExpenseAmount: totalExpense,
        expenseSummary,
        expenseDetail,
      },
      profitPanel: {
        marginPercent,
        invoiceBillingPercent: 0,
        expenseToRevenuePercent: 0,
        billingPendingPercent: 0,
        invoicedAmount: invoiced,
        totalExpenseAmount: totalExpense,
        netProfit,
      },
    };
  }
}
