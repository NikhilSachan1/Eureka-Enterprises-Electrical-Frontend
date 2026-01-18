import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { REIMBURSE_EXPENSE_FORM_CONFIG } from '@features/expense-management/config';
import { ExpenseService } from '@features/expense-management/services/expense.service';
import { IExpenseReimburseFormDto } from '@features/expense-management/types/expense.dto';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { RouterNavigationService } from '@shared/services/router-navigation.service';
import { IPageHeaderConfig } from '@shared/types';
import { finalize } from 'rxjs';
import { REIMBURSE_EXPENSE_PREFILLED_DATA } from '@shared/mock-data/reimburse-expense.mock-data';
import { FormBase } from '@shared/base/form.base';

@Component({
  selector: 'app-reimburse-expense',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './reimburse-expense.component.html',
  styleUrl: './reimburse-expense.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DatePipe],
})
export class ReimburseExpenseComponent
  extends FormBase<IExpenseReimburseFormDto>
  implements OnInit
{
  private readonly expenseService = inject(ExpenseService);
  private readonly routerNavigationService = inject(RouterNavigationService);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  ngOnInit(): void {
    this.form = this.formService.createForm<IExpenseReimburseFormDto>(
      REIMBURSE_EXPENSE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    this.loadMockData(REIMBURSE_EXPENSE_PREFILLED_DATA);
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeReimburseExpense(formData);
  }

  private prepareFormData(): IExpenseReimburseFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeReimburseExpense(formData: IExpenseReimburseFormDto): void {
    this.loadingService.show({
      title: 'Reimburse Expense',
      message: 'Please wait while we process the reimburse expense...',
    });
    this.form.disable();

    this.expenseService
      .reimburseExpense(formData)
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
            'Reimburse expense applied successfully'
          );
          const routeSegments = [
            ROUTE_BASE_PATHS.EXPENSE,
            ROUTES.EXPENSE.LEDGER,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to apply reimburse expense');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm();
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Reimburse Expense',
      subtitle: 'Reimburse approved expenses to employees',
    };
  }
}
