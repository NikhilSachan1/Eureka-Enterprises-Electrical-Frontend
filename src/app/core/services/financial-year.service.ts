import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FinancialYearService {
  public financialYear = this.getFinancialYearFromStartMonth();
  private readonly financialYearStartMonth: number = 3;

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
    if (startMonth < 1 || startMonth > 12) {
      throw new Error('Start month must be between 1 and 12');
    }

    const currentYear = new Date().getFullYear();
    if (startMonth === 1) {
      return `${currentYear}-${currentYear}`;
    }
    return `${currentYear}-${currentYear + 1}`;
  }
}
