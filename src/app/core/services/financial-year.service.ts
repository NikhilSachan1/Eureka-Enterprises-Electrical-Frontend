import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FinancialYearService {
  public financialYear!: string;
  private readonly financialYearStartMonth: number = 3; // April (0-indexed would be 3)
  private readonly financialYearEndMonth: number = 2; // March (0-indexed would be 2)

  constructor() {
    this.financialYear = this.getFinancialYearFromStartMonth();
  }

  getFinancialYear(): string {
    const financialYear = this.getFinancialYearFromStartMonth();
    return financialYear;
  }

  setFinancialYear(financialYear: string): void {
    this.financialYear = financialYear;
  }

  getFinancialYearFromStartMonth(
    startMonth = this.financialYearStartMonth
  ): string {
    const startMonth1Indexed = startMonth + 1;
    if (startMonth1Indexed < 1 || startMonth1Indexed > 12) {
      throw new Error('Start month must be between 1 and 12');
    }

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    if (currentMonth < startMonth1Indexed) {
      return `${currentYear - 1}-${currentYear}`;
    }
    if (startMonth1Indexed === 1) {
      return `${currentYear}-${currentYear}`;
    }
    return `${currentYear}-${currentYear + 1}`;
  }

  getFinancialYearStartDate(): Date {
    const [startYear] = this.financialYear.split('-').map(Number);
    return new Date(startYear, this.financialYearStartMonth, 1);
  }

  getFinancialYearEndDate(): Date {
    const [, endYear] = this.financialYear.split('-').map(Number);
    return new Date(endYear, this.financialYearEndMonth, 31);
  }
}
