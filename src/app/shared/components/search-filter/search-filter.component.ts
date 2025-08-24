import {
  ChangeDetectionStrategy,
  Component,
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
} from '@shared/models';
import { FormService } from '@shared/services';
import { InputFieldComponent } from '../input-field/input-field.component';
import { KeyValuePipe } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-search-filter',
  imports: [
    ReactiveFormsModule,
    InputFieldComponent,
    KeyValuePipe,
    ButtonComponent,
  ],
  templateUrl: './search-filter.component.html',
  styleUrl: './search-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchFilterComponent implements OnInit {
  private readonly formService = inject(FormService);

  searchFilterConfig = input.required<ITableSearchFilterFormConfig>();
  tableRef = input.required<Table>();

  onSearchFilterChange = output<Record<string, unknown>>();

  protected form!: IEnhancedForm;

  ngOnInit(): void {
    this.form = this.formService.createForm(
      this.searchFilterConfig() as unknown as IFormConfig
    );
  }

  protected onSubmit(): void {
    this.setFilterInTable();
  }

  protected setFilterInTable(): void {
    const formData = this.form.getData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'globalSearch') {
        this.tableRef().filterGlobal(
          value as string,
          this.searchFilterConfig().fields[key].matchmode
        );
      } else {
        this.tableRef().filter(
          value,
          key,
          this.searchFilterConfig().fields[key].matchmode
        );
      }
    });
  }

  protected onReset(): void {
    this.form.formGroup.reset();
    this.tableRef().reset();
  }

  protected customSort(): number {
    return 0;
  }
}
