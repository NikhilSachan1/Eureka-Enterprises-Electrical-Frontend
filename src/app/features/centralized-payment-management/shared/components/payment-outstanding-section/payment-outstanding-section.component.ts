import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import { APP_CONFIG } from '@core/config';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { COMMON_SEARCH_FILTER_FIELDS_CONFIG } from '@shared/config/common-search-filter.config';
import { DEFAULT_INPUT_FIELD_CONFIG } from '@shared/config/input-field.config';
import { ICONS } from '@shared/constants';
import {
  EDataType,
  ISectionHeaderConfig,
  IInputFieldsConfig,
} from '@shared/types';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-payment-outstanding-section',
  imports: [
    CurrencyPipe,
    InputFieldComponent,
    IconFieldModule,
    InputIconModule,
  ],
  templateUrl: './payment-outstanding-section.component.html',
  styleUrl: './payment-outstanding-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentOutstandingSectionComponent implements OnDestroy {
  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly ICONS = ICONS;

  sectionConfig = input.required<ISectionHeaderConfig>();
  loading = input(false);
  recordCount = input(0);
  recordCountUnit = input('record');
  totalPendingAmount = input(0);
  searchPlaceholder = input('Search...');

  searchChange = output<string>();

  protected readonly searchTerm = signal('');
  protected readonly searchFieldConfig = computed(
    (): IInputFieldsConfig =>
      ({
        ...DEFAULT_INPUT_FIELD_CONFIG,
        ...COMMON_SEARCH_FILTER_FIELDS_CONFIG.globalSearch,
        fieldType: EDataType.TEXT,
        showStandardLabel: true,
        id: 'outstanding-section-search',
        fieldName: 'search',
        label: '',
        placeholder: this.searchPlaceholder(),
      }) as IInputFieldsConfig
  );

  private searchDebounceTimer?: ReturnType<typeof setTimeout>;

  protected readonly pendingTransactionType = computed(() => {
    const amount = this.totalPendingAmount();
    if (amount > 0) {
      return 'debit';
    }
    if (amount < 0) {
      return 'credit';
    }
    return null;
  });

  ngOnDestroy(): void {
    clearTimeout(this.searchDebounceTimer);
  }

  protected recordCountUnitLabel(): string {
    const count = this.recordCount();
    const unit = this.recordCountUnit();
    const label = count === 1 ? unit : `${unit}s`;

    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  protected onSearchFieldChange(value: unknown): void {
    const term = String(value ?? '');
    this.searchTerm.set(term);

    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.searchChange.emit(term.trim());
    }, 400);
  }
}
