import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APP_PERMISSION } from '@core/constants';
import { AppPermissionService } from '@core/services';
import { FORCE_EXPENSE_FORM_CONFIG } from '@features/expense-management/config';
import {
  fuelExpensePrefillNavigationState,
  watchFuelExpenseTypeRedirect,
  withFuelExpenseTypeOption,
} from '@features/expense-management/config/form/fuel-expense-type-redirect';
import { ExpenseService } from '@features/expense-management/services/expense.service';
import { IExpenseForceFormDto } from '@features/expense-management/types/expense.dto';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { RouterNavigationService } from '@shared/services';
import { IPageHeaderConfig } from '@shared/types';
import { finalize } from 'rxjs';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBase } from '@shared/base/form.base';

@Component({
  selector: 'app-force-expense',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './force-expense.component.html',
  styleUrl: './force-expense.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
})
export class ForceExpenseComponent
  extends FormBase<IExpenseForceFormDto>
  implements OnInit
{
  private readonly expenseService = inject(ExpenseService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly appPermissionService = inject(AppPermissionService);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  ngOnInit(): void {
    const formConfig = this.appPermissionService.hasPermission(
      APP_PERMISSION.FUEL_EXPENSE.FORCE
    )
      ? withFuelExpenseTypeOption(FORCE_EXPENSE_FORM_CONFIG)
      : FORCE_EXPENSE_FORM_CONFIG;

    this.form = this.formService.createForm<IExpenseForceFormDto>(formConfig, {
      destroyRef: this.destroyRef,
    });

    watchFuelExpenseTypeRedirect(
      this.form.formGroup,
      this.destroyRef,
      prefill => {
        void this.routerNavigationService.navigateToRoute(
          [
            ROUTE_BASE_PATHS.TRANSPORT,
            ROUTE_BASE_PATHS.FUEL,
            ROUTES.FUEL.FORCE,
          ],
          { state: fuelExpensePrefillNavigationState(prefill) }
        );
      }
    );
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeForceExpense(formData);
  }

  private prepareFormData(): IExpenseForceFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeForceExpense(formData: IExpenseForceFormDto): void {
    this.loadingService.show({
      title: 'Recording expense',
      message:
        "We're processing the force expense. This will just take a moment.",
    });
    this.form.disable();

    this.expenseService
      .forceExpense(formData)
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
          this.notificationService.success(
            'Force expense applied successfully'
          );
          const routeSegments = [
            ROUTE_BASE_PATHS.EXPENSE,
            ROUTES.EXPENSE.LEDGER,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to apply force expense');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm();
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Force Expense',
      subtitle: 'Force an expense on behalf of an employee',
    };
  }
}
