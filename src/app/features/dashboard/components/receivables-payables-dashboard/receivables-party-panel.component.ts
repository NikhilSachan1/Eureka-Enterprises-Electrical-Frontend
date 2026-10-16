import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { APP_CONFIG } from '@core/config';
import { IReceivablesPayablesSideDto } from '@features/dashboard/types/dashboard.dto';
import { DEFAULT_INPUT_FIELD_CONFIG } from '@shared/config/input-field.config';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ICONS } from '@shared/constants';
import { EDataType, IInputFieldsConfig } from '@shared/types';
import { Card } from 'primeng/card';

type PartyRow = IReceivablesPayablesSideDto['parties'][number];

@Component({
  selector: 'app-receivables-party-panel',
  imports: [Card, CurrencyPipe, InputFieldComponent],
  templateUrl: './receivables-party-panel.component.html',
  styleUrls: [
    '../dashboard-ledger-summary-section/dashboard-ledger-summary-section.component.scss',
    './receivables-party-panel.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceivablesPartyPanelComponent {
  protected readonly ICONS = ICONS;
  protected readonly APP_CONFIG = APP_CONFIG;

  readonly tone = input.required<'receivable' | 'payable'>();
  readonly title = input.required<string>();
  readonly subtitle = input.required<string>();
  readonly searchId = input.required<string>();
  readonly searchLabel = input.required<string>();
  readonly loading = input(false);
  readonly outstanding = input(0);
  readonly parties = input<readonly PartyRow[]>([]);

  protected readonly searchTerm = signal('');

  protected readonly searchFieldConfig = computed(
    (): IInputFieldsConfig =>
      ({
        ...DEFAULT_INPUT_FIELD_CONFIG,
        fieldType: EDataType.TEXT,
        id: this.searchId(),
        fieldName: this.searchId(),
        label: this.searchLabel(),
        placeholder: 'Search by name',
      }) as IInputFieldsConfig
  );

  protected readonly filteredParties = computed((): readonly PartyRow[] => {
    const keyword = this.searchTerm().trim().toLowerCase();
    const rows = this.parties();
    if (!keyword) {
      return rows;
    }

    return rows.filter(row => row.partyName.toLowerCase().includes(keyword));
  });

  protected onSearchFieldChange(value: unknown): void {
    this.searchTerm.set(String(value ?? ''));
  }
}
