import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { APP_CONFIG } from '@core/config';
import { DEFAULT_INPUT_FIELD_CONFIG } from '@shared/config/input-field.config';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import type { IDashboardExpenseMetricsLedger } from '@features/dashboard/types/dashboard.interface';
import { ICONS } from '@shared/constants';
import { Card } from 'primeng/card';
import { EDataType, IInputFieldsConfig } from '@shared/types';

@Component({
  selector: 'app-dashboard-ledger-summary-section',
  imports: [Card, CurrencyPipe, InputFieldComponent],
  templateUrl: './dashboard-ledger-summary-section.component.html',
  styleUrl: './dashboard-ledger-summary-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardLedgerSummarySectionComponent {
  protected readonly ICONS = ICONS;
  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly LEDGER_EMPTY_TEXT = 'No employee-wise balances.';

  readonly variant = input<'expense' | 'fuel'>('expense');
  readonly loading = input<boolean>(false);
  readonly ledgerTitle = input.required<string>();
  readonly ledgerSubtitle = input.required<string>();
  readonly ledgerData = input<IDashboardExpenseMetricsLedger | null>(null);

  protected readonly searchTerm = signal('');
  protected readonly searchFieldConfig: IInputFieldsConfig = {
    ...DEFAULT_INPUT_FIELD_CONFIG,
    fieldType: EDataType.TEXT,
    id: 'ledger-employee-search',
    fieldName: 'ledgerEmployeeSearch',
    label: 'Search employee',
    placeholder: 'Search by name',
  } as IInputFieldsConfig;

  protected readonly filteredRows = computed(
    (): IDashboardExpenseMetricsLedger['employees'] => {
      const rows = this.ledgerData()?.employees ?? [];

      const keyword = this.searchTerm().trim().toLowerCase();
      if (!keyword) {
        return rows;
      }

      return rows.filter((row): boolean => {
        return row.name.toLowerCase().includes(keyword);
      });
    }
  );

  protected onSearchFieldChange(value: unknown): void {
    this.searchTerm.set(String(value ?? ''));
  }
}
