import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { APP_PERMISSION } from '@core/constants';
import { AppPermissionService } from '@core/services';
import { RouterNavigationService } from '@shared/services';
import { IPageHeaderConfig } from '@shared/types';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ADD_EXPENSE_FORM_CONFIG } from '@features/expense-management/config';
import {
  fuelExpensePrefillNavigationState,
  watchFuelExpenseTypeRedirect,
  withFuelExpenseTypeOption,
} from '@features/expense-management/config/form/fuel-expense-type-redirect';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ExpenseService } from '@features/expense-management/services/expense.service';
import { IExpenseAddFormDto } from '@features/expense-management/types/expense.dto';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
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
  private readonly appPermissionService = inject(AppPermissionService);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  ngOnInit(): void {
    const formConfig = this.appPermissionService.hasPermission(
      APP_PERMISSION.FUEL_EXPENSE.ADD
    )
      ? withFuelExpenseTypeOption(ADD_EXPENSE_FORM_CONFIG)
      : ADD_EXPENSE_FORM_CONFIG;

    this.form = this.formService.createForm<IExpenseAddFormDto>(formConfig, {
      destroyRef: this.destroyRef,
    });

    watchFuelExpenseTypeRedirect(
      this.form.formGroup,
      this.destroyRef,
      prefill => {
        void this.routerNavigationService.navigateToRoute(
          [ROUTE_BASE_PATHS.TRANSPORT, ROUTE_BASE_PATHS.FUEL, ROUTES.FUEL.ADD],
          { state: fuelExpensePrefillNavigationState(prefill) }
        );
      }
    );
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
      title: 'Adding expense',
      message: "We're adding expense. This will just take a moment.",
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
