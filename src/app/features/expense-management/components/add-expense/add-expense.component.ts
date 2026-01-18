import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { RouterNavigationService } from '@shared/services';
import { IPageHeaderConfig } from '@shared/types';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ADD_EXPENSE_FORM_CONFIG } from '@features/expense-management/config';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ExpenseService } from '@features/expense-management/services/expense.service';
import { IExpenseAddFormDto } from '@features/expense-management/types/expense.dto';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ADD_EXPENSE_PREFILLED_DATA } from '@shared/mock-data/add-expense.mock-data';
import { FormBase } from '@shared/base/form.base';

@Component({
  selector: 'app-add-expense',
  imports: [
    InputFieldComponent,
    ReactiveFormsModule,
    ButtonComponent,
    PageHeaderComponent,
  ],
  templateUrl: './add-expense.component.html',
  styleUrl: './add-expense.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddExpenseComponent
  extends FormBase<IExpenseAddFormDto>
  implements OnInit
{
  private readonly expenseService = inject(ExpenseService);
  private readonly routerNavigationService = inject(RouterNavigationService);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  ngOnInit(): void {
    this.form = this.formService.createForm<IExpenseAddFormDto>(
      ADD_EXPENSE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    this.loadMockData(ADD_EXPENSE_PREFILLED_DATA);
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeAddExpense(formData);
  }

  private prepareFormData(): IExpenseAddFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeAddExpense(formData: IExpenseAddFormDto): void {
    this.loadingService.show({
      title: 'Add Expense',
      message: 'Please wait while we add expense...',
    });
    this.form.disable();

    this.expenseService
      .addExpense(formData)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.form.enable();
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.notificationService.success('Expense added successfully');
          const routeSegments = [
            ROUTE_BASE_PATHS.EXPENSE,
            ROUTES.EXPENSE.LEDGER,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to add expense');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm();
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Add Expense',
      subtitle: 'Add a new expense',
    };
  }
}
