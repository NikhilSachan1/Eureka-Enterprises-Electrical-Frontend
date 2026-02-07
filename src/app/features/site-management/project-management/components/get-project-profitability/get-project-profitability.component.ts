import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartsComponent } from '@shared/components/charts/charts.component';
import { ProgressBarComponent } from '@shared/components/progress-bar/progress-bar.component';
import {
  EChartType,
  IChartsConfig,
  IProgressBarConfig,
  EProgressBarMode,
} from '@shared/types';

interface RevenueData {
  totalPOValue: number;
  invoicedTillDate: number;
  pendingToInvoice: number;
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
  selector: 'app-get-project-profitability',
  imports: [CommonModule, ChartsComponent, ProgressBarComponent],
  templateUrl: './get-project-profitability.component.html',
  styleUrl: './get-project-profitability.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetProjectProfitabilityComponent implements OnInit {
  revenueData: RevenueData = {
    totalPOValue: 12000000, // ₹1.20 Cr
    invoicedTillDate: 5000000, // ₹50.00 L
    pendingToInvoice: 7000000, // ₹70.00 L
  };

  expenses: ExpenseItem[] = [
    { label: 'Employee Salary (allocated)', amount: 800000 },
    { label: 'Travel & Accommodation', amount: 250000 },
    { label: 'Fuel & Vehicle', amount: 120000 },
    { label: 'Material/Equipment', amount: 300000 },
    { label: 'Miscellaneous', amount: 50000 },
  ];

  totalExpenses = 2090000; // ₹20.90 L

  profitability: ProfitabilityData = {
    grossProfit: 2910000, // ₹29.10 L
    profitMargin: 58.2,
    roi: 139,
  };

  healthScore = 45;

  // Chart Configurations
  expenseDistributionChartConfig!: IChartsConfig;
  revenueExpenseChartConfig!: IChartsConfig;

  // Progress Bar Configuration
  healthScoreConfig: Partial<IProgressBarConfig> = {
    value: 45,
    showValue: false,
    mode: EProgressBarMode.DETERMINATE,
  };

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

  private initializeChartConfigs(): void {
    // Expense Distribution Doughnut Chart
    this.expenseDistributionChartConfig = {
      chartType: EChartType.DOUGHNUT,
      labels: this.expenses.map(e => e.label),
      datasets: [
        {
          label: 'Expenses',
          data: this.expenses.map(e => e.amount),
          backgroundColor: [
            '#4F8EF7', // Employee Salary - Blue
            '#9D4EDD', // Travel - Purple
            '#FFA726', // Fuel - Orange
            '#26C485', // Material - Green
            '#EC4899', // Misc - Pink
          ],
          borderWidth: 0,
        },
      ],
      options: {
        maintainAspectRatio: false,
        cutout: '70%',
      },
    };

    // Revenue vs Expenses Bar Chart
    this.revenueExpenseChartConfig = {
      chartType: EChartType.BAR,
      labels: ['Revenue', 'Expenses', 'Profit'],
      datasets: [
        {
          label: 'Revenue',
          data: [
            this.revenueData.invoicedTillDate,
            this.totalExpenses,
            this.profitability.grossProfit,
          ],
        },
        {
          label: 'Expenses',
          data: [this.totalExpenses],
        },
        {
          label: 'Profit',
          data: [this.profitability.grossProfit],
        },
      ],
      options: {
        maintainAspectRatio: true,
      },
    };
  }
}
