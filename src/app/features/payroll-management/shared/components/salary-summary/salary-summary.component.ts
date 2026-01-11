import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { APP_CONFIG } from '@core/config/app.config';
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

  protected readonly summaryItems = computed(() =>
    this.getSalarySummaryItems()
  );

  protected readonly totalCTC = computed(() => this.getTotalCTC());

  private getSalarySummaryItems(): IEmployeeSalarySummaryItem[] {
    const fields = this.salaryFields();
    const basic = fields.basic ?? 0;
    const hra = fields.hra ?? 0;
    const tds = fields.tds ?? 0;
    const esic = fields.esic ?? 0;
    const employeePf = fields.employeePf ?? 0;
    const employerPf = fields.employeePf ?? 0;

    const grossSalary = parseFloat(basic) + parseFloat(hra);
    const totalDeductions = parseFloat(tds) + parseFloat(employeePf);
    const inHandSalary = grossSalary - totalDeductions;
    const totalEmployerBenefits = parseFloat(esic) + parseFloat(employerPf);

    return [
      {
        label: 'Gross Salary',
        value: grossSalary,
        description: 'Basic + HRA',
      },
      {
        label: 'Deductions',
        value: totalDeductions,
        description: 'TDS + PF (Employee)',
      },
      {
        label: 'In-Hand Salary',
        value: inHandSalary,
        description: 'Gross - Deductions',
      },
      {
        label: 'Employer Benefits',
        value: totalEmployerBenefits,
        description: 'Employer PF + Employer ESIC',
      },
    ];
  }

  private getTotalCTC(): number {
    const fields = this.salaryFields();
    const basic = fields.basic ?? 0;
    const hra = fields.hra ?? 0;
    const esic = fields.esic ?? 0;
    const employerPf = fields.employeePf ?? 0;

    const grossSalary = parseFloat(basic) + parseFloat(hra);
    const totalEmployerBenefits = parseFloat(employerPf) + parseFloat(esic);

    return grossSalary + totalEmployerBenefits;
  }
}
