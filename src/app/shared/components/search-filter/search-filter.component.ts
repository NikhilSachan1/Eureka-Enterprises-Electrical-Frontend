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
  private readonly formService = inject(FormService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly permissionService = inject(AppPermissionService);

  searchFilterConfig = input.required<ITableSearchFilterFormConfig>();
  tableRef = input.required<Table>();
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
    this.setFilterInTable();
    this.form.formGroup.markAsPristine();
    this.hasSearched = true;
    this.onFilterSubmit.emit(this.form.getData());
  }

  protected setFilterInTable(): void {
    const formData = this.form.getData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'globalSearch') {
        this.tableRef().filterGlobal(
          value as string,
          this.searchFilterConfig().fields[key].matchmode as string
        );
      } else {
        this.tableRef().filter(
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
    if (this.hasSearched || this.hasPrefillValues) {
      const table = this.tableRef();
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
