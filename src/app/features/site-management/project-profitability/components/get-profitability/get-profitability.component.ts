import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { EChartType, IChartsConfig } from '@shared/types';
import { ChartsComponent } from '@shared/components/charts/charts.component';

interface RevenueData {
  totalPOValue: number;
  invoicedTillDate: number;
  pendingToInvoice: number;
  totalInvoicesRaised: number;
}

interface ExpenseItem {
  label: string;
  amount: number;
}

interface ProfitabilityData {
  grossProfit: number;
  profitMargin: number;
  roi: number;
}

@Component({
  selector: 'app-get-profitability',
  imports: [ChartsComponent],
  templateUrl: './get-profitability.component.html',
  styleUrl: './get-profitability.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetProfitabilityComponent implements OnInit {
  revenueData: RevenueData = {
    totalPOValue: 12000000, // ₹1.20 Cr
    invoicedTillDate: 5000000, // ₹50.00 L
    pendingToInvoice: 7000000, // ₹70.00 L
    totalInvoicesRaised: 18,
  };

  expenses: ExpenseItem[] = [
    { label: 'Employee Salary (allocated)', amount: 800000 },
    { label: 'Travel & Accommodation', amount: 250000 },
    { label: 'Fuel & Vehicle', amount: 120000 },
    { label: 'Material/Equipment', amount: 300000 },
    { label: 'Site Utilities', amount: 320000 },
    { label: 'Admin & Compliance', amount: 250000 },
    { label: 'Miscellaneous', amount: 50000 },
  ];

  totalExpenses = 2090000; // ₹20.90 L

  profitability: ProfitabilityData = {
    grossProfit: 2910000, // ₹29.10 L
    profitMargin: 58.2,
    roi: 139,
  };

  // Chart Configurations
  expenseDistributionChartConfig!: IChartsConfig;
  revenueExpenseChartConfig!: IChartsConfig;

  get salaryExpenses(): ExpenseItem[] {
    return this.expenses.filter(expense =>
      expense.label.toLowerCase().includes('salary')
    );
  }

  get fuelExpenses(): ExpenseItem[] {
    return this.expenses.filter(expense =>
      expense.label.toLowerCase().includes('fuel')
    );
  }

  get regularExpenses(): ExpenseItem[] {
    return this.expenses.filter(expense => {
      const label = expense.label.toLowerCase();
      return !label.includes('salary') && !label.includes('fuel');
    });
  }

  get salaryExpenseTotal(): number {
    return this.salaryExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
  }

  get fuelExpenseTotal(): number {
    return this.fuelExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }

  get regularExpenseTotal(): number {
    return this.regularExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );
  }

  get netProfitOrLoss(): number {
    return this.revenueData.invoicedTillDate - this.totalExpenses;
  }

  get netMargin(): number {
    if (this.revenueData.invoicedTillDate === 0) {
      return 0;
    }

    return (this.netProfitOrLoss / this.revenueData.invoicedTillDate) * 100;
  }

  get invoiceRealizationPercent(): number {
    if (this.revenueData.totalPOValue === 0) {
      return 0;
    }

    return (
      (this.revenueData.invoicedTillDate / this.revenueData.totalPOValue) * 100
    );
  }

  get pendingBillingPercent(): number {
    if (this.revenueData.totalPOValue === 0) {
      return 0;
    }

    return (
      (this.revenueData.pendingToInvoice / this.revenueData.totalPOValue) * 100
    );
  }

  get expenseToRevenuePercent(): number {
    if (this.revenueData.invoicedTillDate === 0) {
      return 0;
    }

    return (this.totalExpenses / this.revenueData.invoicedTillDate) * 100;
  }

  get averageInvoiceValue(): number {
    if (this.revenueData.totalInvoicesRaised === 0) {
      return 0;
    }

    return (
      this.revenueData.invoicedTillDate / this.revenueData.totalInvoicesRaised
    );
  }

  get invoicedProgressWidth(): number {
    return Math.min(Math.max(this.invoiceRealizationPercent, 0), 100);
  }

  get expenseLoadWidth(): number {
    return Math.min(Math.max(this.expenseToRevenuePercent, 0), 100);
  }

  get netMarginWidth(): number {
    return Math.min(Math.abs(this.netMargin), 100);
  }

  ngOnInit(): void {
    this.initializeChartConfigs();
  }

  formatCurrency(amount: number): string {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  formatNumber(value: number): string {
    return value.toLocaleString('en-IN');
  }

  getExpenseShare(amount: number): string {
    if (!this.totalExpenses) {
      return '0%';
    }

    return `${((amount / this.totalExpenses) * 100).toFixed(1)}%`;
  }

  private initializeChartConfigs(): void {
    // Expense Distribution Doughnut Chart
    this.expenseDistributionChartConfig = {
      chartType: EChartType.DOUGHNUT,
      labels: ['Salary', 'Fuel', 'Regular Expenses'],
      datasets: [
        {
          label: 'Expense Share',
          data: [
            this.salaryExpenseTotal,
            this.fuelExpenseTotal,
            this.regularExpenseTotal,
          ],
          backgroundColor: ['#3b82f6', '#f97316', '#8b5cf6'],
          borderWidth: 0,
        },
      ],
      options: {
        maintainAspectRatio: true,
        cutout: '70%',
      },
    };

    // Financial Ratios Bar Chart
    this.revenueExpenseChartConfig = {
      chartType: EChartType.BAR,
      labels: [
        'Invoice Realization',
        'Pending Billing',
        'Expense Load',
        'Net Margin',
      ],
      datasets: [
        {
          label: 'Ratio (%)',
          data: [
            Number(this.invoiceRealizationPercent.toFixed(1)),
            Number(this.pendingBillingPercent.toFixed(1)),
            Number(this.expenseToRevenuePercent.toFixed(1)),
            Number(this.netMargin.toFixed(1)),
          ],
          backgroundColor: ['#16a34a', '#0ea5e9', '#ef4444', '#7c3aed'],
          borderColor: ['#15803d', '#0284c7', '#dc2626', '#6d28d9'],
        },
      ],
      options: {
        maintainAspectRatio: true,
      },
    };
  }
}
