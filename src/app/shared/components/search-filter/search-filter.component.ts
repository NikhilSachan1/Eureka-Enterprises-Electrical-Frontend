import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  IEnhancedForm,
  IFormConfig,
  ITableSearchFilterFormConfig,
} from '@shared/types';
import { FormService } from '@shared/services';
import { InputFieldComponent } from '../input-field/input-field.component';
import { KeyValuePipe } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { Table } from 'primeng/table';
import { PanelModule } from 'primeng/panel';
import { AppPermissionService } from '@core/services';
import { ICONS } from '@shared/constants';

@Component({
  selector: 'app-search-filter',
  imports: [
    ReactiveFormsModule,
    InputFieldComponent,
    KeyValuePipe,
    ButtonComponent,
    PanelModule,
  ],
  templateUrl: './search-filter.component.html',
  styleUrl: './search-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchFilterComponent implements OnInit {
  protected readonly ICONS = ICONS;
  private readonly formService = inject(FormService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly permissionService = inject(AppPermissionService);

  searchFilterConfig = input.required<ITableSearchFilterFormConfig>();
  /** When omitted, filter panel is UI-only (no PrimeNG table filters applied). */
  tableRef = input<Table | undefined>(undefined);
  prefillValues = input<Record<string, unknown>>();

  onSearchFilterChange = output<Record<string, unknown>>();
  onFilterSubmit = output<Record<string, unknown>>();
  onFilterReset = output<void>();

  protected form!: IEnhancedForm<Record<string, unknown>>;
  protected hasSearched = false;
  protected hasPrefillValues = false;

  ngOnInit(): void {
    const filteredConfig = this.getPermissionFilteredConfig();
    const prefillData = this.prefillValues();

    this.form = this.formService.createForm(
      filteredConfig as unknown as IFormConfig<Record<string, unknown>>,
      {
        destroyRef: this.destroyRef,
        defaultValues: prefillData,
      }
    );

    if (prefillData && Object.keys(prefillData).length > 0) {
      this.hasPrefillValues = true;
      this.form.formGroup.markAsDirty();
    }
  }

  private getPermissionFilteredConfig(): ITableSearchFilterFormConfig {
    const originalConfig = this.searchFilterConfig();

    return {
      ...originalConfig,
      fields: this.permissionService.filterRecordByPermission(
        originalConfig.fields
      ),
    };
  }

  protected onSubmit(): void {
    const table = this.tableRef();
    if (table) {
      this.setFilterInTable(table);
    }
    this.form.formGroup.markAsPristine();
    this.hasSearched = true;
    this.onFilterSubmit.emit(this.form.getData());
  }

  protected setFilterInTable(table: Table): void {
    const formData = this.form.getData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'globalSearch') {
        table.filterGlobal(
          value as string,
          this.searchFilterConfig().fields[key].matchmode as string
        );
      } else {
        table.filter(
          value,
          key,
          this.searchFilterConfig().fields[key].matchmode as string
        );
      }
    });
  }

  protected onReset(): void {
    this.form.formGroup.reset();
    this.onFilterReset.emit();
    const table = this.tableRef();
    if (table && (this.hasSearched || this.hasPrefillValues)) {
      table.filters = {};
      table.reset();
    }
    this.hasSearched = false;
    this.hasPrefillValues = false;
  }

  protected customSort(): number {
    return 0;
  }
}
