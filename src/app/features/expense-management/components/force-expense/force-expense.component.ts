import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FORCE_EXPENSE_FORM_CONFIG } from '@features/expense-management/config';
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
import { FORCE_EXPENSE_PREFILLED_DATA } from '@shared/mock-data/force-expense.mock-data';
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

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  ngOnInit(): void {
    this.form = this.formService.createForm<IExpenseForceFormDto>(
      FORCE_EXPENSE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    this.loadMockData(FORCE_EXPENSE_PREFILLED_DATA);
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
