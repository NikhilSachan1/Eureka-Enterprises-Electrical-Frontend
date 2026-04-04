import { Pipe, PipeTransform } from '@angular/core';
import { APP_CONFIG } from '@core/config';

type IndianCurrencyFormat = 'short' | 'full';

@Pipe({
  name: 'indianCurrency',
})
export class IndianCurrencyPipe implements PipeTransform {
  private readonly CRORE = 10000000;
  private readonly LAKH = 100000;
  private readonly THOUSAND = 1000;

  transform(
    value: number | string | null | undefined,
    format: IndianCurrencyFormat = 'short',
    showSymbol = true,
    decimals = 2
  ): string {
    if (value === null || value === undefined) {
      return '';
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) {
      return '';
    }

    const symbol = showSymbol ? APP_CONFIG.CURRENCY_CONFIG.SYMBOL : '';
    const absValue = Math.abs(numValue);
    const sign = numValue < 0 ? '-' : '';

    if (format === 'full') {
      return `${sign}${symbol}${absValue.toLocaleString(APP_CONFIG.NUMBER_FORMATS.LOCALE)}`;
    }

    if (absValue >= this.CRORE) {
      const formatted = (absValue / this.CRORE).toFixed(decimals);
      return `${sign}${symbol}${this.trimTrailingZeros(formatted)} Cr`;
    }

    if (absValue >= this.LAKH) {
      const formatted = (absValue / this.LAKH).toFixed(decimals);
      return `${sign}${symbol}${this.trimTrailingZeros(formatted)} L`;
    }

    if (absValue >= this.THOUSAND) {
      const formatted = (absValue / this.THOUSAND).toFixed(decimals);
      return `${sign}${symbol}${this.trimTrailingZeros(formatted)} K`;
    }

    return `${sign}${symbol}${absValue.toLocaleString(APP_CONFIG.NUMBER_FORMATS.LOCALE)}`;
  }

  private trimTrailingZeros(value: string): string {
    return value.replace(/\.?0+$/, '');
  }
}
