import { CurrencyPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import { APP_CONFIG } from '@core/config';
import { NavTabsComponent } from '@shared/components/nav-tabs/nav-tabs.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { COMMON_SEARCH_FILTER_FIELDS_CONFIG } from '@shared/config/common-search-filter.config';
import { DEFAULT_INPUT_FIELD_CONFIG } from '@shared/config/input-field.config';
import { ICONS } from '@shared/constants';
import { EDataType, ETabMode, IInputFieldsConfig } from '@shared/types';
import {
  ITabChange,
  ITabItem,
} from '@shared/types/nav-tabs/tab-item.interface';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import {
  IPaymentOutstandingSectionOverview,
  IPaymentOutstandingSectionTab,
} from '../../types/payment-outstanding-section.interface';

@Component({
  selector: 'app-payment-outstanding-section',
  imports: [
    InputFieldComponent,
    IconFieldModule,
    InputIconModule,
    NavTabsComponent,
    CurrencyPipe,
  ],
  templateUrl: './payment-outstanding-section.component.html',
  styleUrl: './payment-outstanding-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentOutstandingSectionComponent implements OnDestroy {
  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly ICONS = ICONS;
  protected readonly tabContentMode = ETabMode.CONTENT;

  showSearch = input(true);
  searchPlaceholder = input('Search...');
  overviewCards = input<IPaymentOutstandingSectionOverview[]>([]);
  tabs = input<IPaymentOutstandingSectionTab[]>([]);
  activeTabIndex = model(0);
  overviewAriaLabel = input('Payment source breakdown');
  showOverview = input(true);

  searchChange = output<string>();

  protected readonly hasOverview = computed(
    () => this.showOverview() && this.overviewCards().length > 0
  );

  protected readonly hasTabs = computed(() => this.tabs().length > 0);

  protected readonly navTabItems = computed(() =>
    this.mapTabsToNavItems(this.tabs())
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

  ngOnDestroy(): void {
    clearTimeout(this.searchDebounceTimer);
  }

  protected onSearchFieldChange(value: unknown): void {
    const term = String(value ?? '');
    this.searchTerm.set(term);

    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.searchChange.emit(term.trim());
    }, 400);
  }

  protected onNavTabChanged(event: ITabChange): void {
    this.activeTabIndex.set(event.index);
  }

  private mapTabsToNavItems(tabs: IPaymentOutstandingSectionTab[]): ITabItem[] {
    return tabs.map(tab => {
      const count = tab.badgeCount ?? 0;

      return {
        route: tab.value,
        label: tab.label,
        badge: count > 0 ? count : undefined,
      };
    });
  }
}
