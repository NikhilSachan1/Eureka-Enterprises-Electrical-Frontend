import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { APP_CONFIG } from '@core/config/app.config';
import { ICONS } from '@shared/constants';
import {
  ISalaryFields,
  IEmployeeSalarySummaryItem,
} from '@features/payroll-management/types/payroll.interface';

@Component({
  selector: 'app-salary-summary',
  imports: [CardModule, CurrencyPipe],
  templateUrl: './salary-summary.component.html',
  styleUrl: './salary-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalarySummaryComponent {
  readonly salaryFields = input.required<ISalaryFields>();

  protected readonly currencyFormat = APP_CONFIG.CURRENCY_CONFIG.DEFAULT;
  protected readonly totalCtcIcon = ICONS.EXPENSE.MONEY;

  protected readonly summaryItems = computed(() =>
    this.getSalarySummaryItems()
  );

  protected readonly totalCTC = computed(() => this.getTotalCTC());

  private getSalarySummaryItems(): IEmployeeSalarySummaryItem[] {
    const fields = this.salaryFields();
    const basic = fields.basic ?? 0;
    const hra = fields.hra ?? 0;
    const specialAllowance = fields.specialAllowance ?? 0;
    const esic = fields.esic ?? 0;
    const employeePf = fields.employeePf ?? 0;
    const employerPf = employeePf;

    const grossSalary = basic + hra + specialAllowance;
    const totalDeductions = employeePf + esic;
    const inHandSalary = grossSalary - totalDeductions;
    const totalEmployerBenefits = employerPf;

    return [
      {
        label: 'Gross Salary',
        value: grossSalary,
        description: 'Basic + HRA + Special Allowance',
        icon: ICONS.EXPENSE.MONEY,
      },
      {
        label: 'Deductions',
        value: totalDeductions,
        description: 'PF (Employee) + ESIC',
        icon: ICONS.COMMON.ARROW_DOWN,
      },
      {
        label: 'In-Hand Salary',
        value: inHandSalary,
        description: 'Gross - Deductions',
        icon: ICONS.PAYROLL.WALLET,
      },
      {
        label: 'Employer Benefits',
        value: totalEmployerBenefits,
        description: 'Employer PF',
        icon: ICONS.COMMON.GIFT,
      },
    ];
  }

  private getTotalCTC(): number {
    const fields = this.salaryFields();
    const basic = fields.basic ?? 0;
    const hra = fields.hra ?? 0;
    const specialAllowance = fields.specialAllowance ?? 0;
    const employerPf = fields.employeePf ?? 0;
    const grossSalary = basic + hra + specialAllowance;

    return grossSalary + employerPf;
  }
}
