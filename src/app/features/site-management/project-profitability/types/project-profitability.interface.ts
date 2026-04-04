export interface IProjectProfitabilityReport {
  kpiCards: IKpiCardView[];
  expenseBreakdown: IExpenseBreakdownView;
  profitPanel: IProfitPanelView;
}

export interface IKpiCardView {
  label: string;
  hint: string;
  display: 'currency' | 'number';
  value: number;
}

export interface IExpenseBreakdownView {
  totalExpenseAmount: number;
  expenseSummary: IExpenseSummaryView[];
  expenseDetail: IExpenseDetailView[];
}

export interface IExpenseSummaryView {
  label: string;
  amount: number;
  percentLabel: string;
}

export interface IExpenseDetailView {
  label: string;
  amount: number;
  percentage: number;
}

export interface IProfitPanelView {
  marginPercent: number;
  invoiceBillingPercent: number;
  expenseToRevenuePercent: number;
  billingPendingPercent: number;
  invoicedAmount: number;
  totalExpenseAmount: number;
  netProfit: number;
}
