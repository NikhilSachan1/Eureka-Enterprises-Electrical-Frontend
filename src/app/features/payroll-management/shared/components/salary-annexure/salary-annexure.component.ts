import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CurrencyPipe, DatePipe, NgTemplateOutlet } from '@angular/common';
import { ICONS } from '@shared/constants';
import { APP_CONFIG } from '@core/config/app.config';
import {
  IEmployeeAnnexure,
  IEmployeeSalaryRevisionHistoryItem,
} from '@features/payroll-management/types/payroll.interface';
import { StatusTagComponent } from '@shared/components/status-tag/status-tag.component';

@Component({
  selector: 'app-salary-annexure',
  imports: [CurrencyPipe, DatePipe, NgTemplateOutlet, StatusTagComponent],
  templateUrl: './salary-annexure.component.html',
  styleUrl: './salary-annexure.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalaryAnnexureComponent {
  readonly annexureData = input.required<
    IEmployeeAnnexure | IEmployeeSalaryRevisionHistoryItem
  >();

  // Date and Currency formats from APP_CONFIG
  protected readonly dateFormat = APP_CONFIG.DATE_FORMATS.DEFAULT;
  protected readonly currencyCode = APP_CONFIG.CURRENCY_CONFIG.DEFAULT;
  protected readonly currencyFormat = APP_CONFIG.NUMBER_FORMATS.WITH_DECIMALS;
  protected readonly locale = APP_CONFIG.NUMBER_FORMATS.LOCALE;
  protected readonly ICONS = ICONS;

  /**
   * Get color classes for different sections (earnings, deductions, employer benefits)
   */
  protected getColorClasses(color: string): {
    headerClass: string;
    hoverClass: string;
    totalBgClass: string;
    totalTextClass: string;
  } {
    const colorMap = {
      green: {
        header: 'bg-gradient-to-r from-green-600 to-green-700',
        hover: 'hover:bg-green-50',
        bg: 'bg-green-50 border-green-300',
        text: 'text-green-700',
      },
      red: {
        header: 'bg-gradient-to-r from-red-600 to-red-700',
        hover: 'hover:bg-red-50',
        bg: 'bg-red-50 border-red-300',
        text: 'text-red-700',
      },
      blue: {
        header: 'bg-gradient-to-r from-blue-600 to-blue-700',
        hover: 'hover:bg-blue-50',
        bg: 'bg-blue-50 border-blue-300',
        text: 'text-blue-700',
      },
    } as const;

    const defaultColor =
      colorMap[color as keyof typeof colorMap] || colorMap.blue;

    return {
      headerClass: defaultColor.header,
      hoverClass: defaultColor.hover,
      totalBgClass: defaultColor.bg,
      totalTextClass: defaultColor.text,
    };
  }
}
