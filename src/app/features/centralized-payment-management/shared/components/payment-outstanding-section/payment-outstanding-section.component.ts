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
import { EDataType, IInputFieldsConfig } from '@shared/types';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import {
  EPaymentOutstandingSectionContext,
  EPaymentOutstandingSourceType,
  getPaymentOutstandingSourceSectionMeta,
} from '../../config/payment-outstanding-source-section.config';
import type { IVendorSectionSummaryStatGroup } from '../../types/payment-outstanding-section.interface';

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

  sourceType = input.required<EPaymentOutstandingSourceType>();
  sectionContext = input(EPaymentOutstandingSectionContext.OUTSTANDING);
  loading = input(false);
  recordCount = input(0);
  totalPendingAmount = input(0);
  totalPendingToBook = input<number | null>(null);
  totalBookPayments = input<number | null>(null);
  totalBookedAmount = input<number | null>(null);
  vendorSummaryStats = input(false);
  showSearch = input(true);
  searchPlaceholder = input('Search...');

  searchChange = output<string>();

  protected readonly sectionMeta = computed(() =>
    getPaymentOutstandingSourceSectionMeta(
      this.sourceType(),
      this.sectionContext()
    )
  );

  protected readonly showVendorSummaryStats = computed(() =>
    this.vendorSummaryStats()
  );

  protected readonly bookedAmountTransactionType = computed(() => {
    const amount = this.totalBookedAmount() ?? 0;
    if (amount > 0) {
      return 'debit';
    }
    if (amount < 0) {
      return 'credit';
    }
    return null;
  });

  protected readonly bookPaymentsCount = computed(
    () => this.totalBookPayments() ?? 0
  );

  protected readonly vendorSummaryStatGroups = computed(
    (): IVendorSectionSummaryStatGroup[] => [
      {
        title: 'Overview',
        stats: [
          {
            kind: 'count',
            value: this.recordCount(),
            label: this.recordCountUnitLabel(),
            ariaLabel: 'Total vendor count',
          },
          {
            kind: 'count',
            value: this.bookPaymentsCount(),
            label: this.bookPaymentsCountLabel(),
            ariaLabel: 'Total bookings count',
          },
        ],
      },
      {
        title: 'Payables',
        stats: [
          {
            kind: 'currency',
            value: this.totalPendingToBook() ?? 0,
            label: 'To be booked',
            ariaLabel: 'Total amount to be booked',
            tone: (this.totalPendingToBook() ?? 0) > 0 ? 'to-book' : null,
          },
          {
            kind: 'currency',
            value: this.totalBookedAmount() ?? 0,
            label: 'Booked',
            ariaLabel: 'Total booked amount payable',
            tone: this.bookedAmountTransactionType(),
          },
        ],
      },
    ]
  );

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
    const unit = this.sectionMeta().recordCountUnit;
    const label = count === 1 ? unit : `${unit}s`;

    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  protected bookPaymentsCountLabel(): string {
    return this.bookPaymentsCount() === 1 ? 'Booking' : 'Bookings';
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
