import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnInit,
  output,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IEnhancedForm, IFormConfig } from '@shared/models';
import { FormService } from '@shared/services';
import { InputFieldComponent } from '../input-field/input-field.component';
import { KeyValuePipe } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

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

  searchFilterConfig = input.required<IFormConfig>();

  onSearch = output<Record<string, unknown>>();

  protected form!: IEnhancedForm;

  ngOnInit(): void {
    this.form = this.formService.createForm(this.searchFilterConfig());
  }

  protected onSubmit(): void {
    this.onSearch.emit(this.form.getRawData());
  }

  protected onReset(): void {
    this.form.formGroup.reset();
  }

  protected customSort(): number {
    return 0;
  }
}
