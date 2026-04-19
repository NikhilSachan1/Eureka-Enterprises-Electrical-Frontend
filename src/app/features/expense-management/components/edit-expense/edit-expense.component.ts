import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EDIT_EXPENSE_FORM_CONFIG } from '@features/expense-management/config';
import { RouterNavigationService } from '@shared/services';
import { IPageHeaderConfig } from '@shared/types';
import { ExpenseService } from '@features/expense-management/services/expense.service';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { IExpenseEditFormDto } from '@features/expense-management/types/expense.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { IExpenseDetailResolverResponse } from '@features/expense-management/types/expense.interface';
import { FormBase } from '@shared/base/form.base';

@Component({
  selector: 'app-edit-expense',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-expense.component.html',
  styleUrl: './edit-expense.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditExpenseComponent
  extends FormBase<IExpenseEditFormDto>
  implements OnInit
{
  private readonly expenseService = inject(ExpenseService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly initialExpenseData = signal<IExpenseEditFormDto | null>(
    null
  );

  ngOnInit(): void {
    this.loadExpenseDataFromRoute();

    this.form = this.formService.createForm<IExpenseEditFormDto>(
      EDIT_EXPENSE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: this.initialExpenseData(),
      }
    );
  }

  private loadExpenseDataFromRoute(): void {
    const expenseDetailFromResolver = this.activatedRoute.snapshot.data[
      'expenseDetail'
    ] as IExpenseDetailResolverResponse | null;

    if (!expenseDetailFromResolver) {
      this.logger.logUserAction('No expense data found in route');
      const routeSegments = [ROUTE_BASE_PATHS.EXPENSE, ROUTES.EXPENSE.LEDGER];
      void this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    const prefilledExpenseData = this.preparePrefilledFormData(
      expenseDetailFromResolver
    );
    this.initialExpenseData.set(prefilledExpenseData);
  }

  private preparePrefilledFormData(
    expenseDetailFromResolver: IExpenseDetailResolverResponse
  ): IExpenseEditFormDto {
    const latestExpenseData =
      expenseDetailFromResolver.history[
        expenseDetailFromResolver.history.length - 1
      ];
    const preloadedFiles = expenseDetailFromResolver.preloadedFiles ?? [];

    const {
      category,
      description,
      amount,
      expenseDate,
      paymentMode,
      transactionId,
    } = latestExpenseData;
    return {
      expenseCategory: category,
      remark: description,
      expenseAmount: Number(amount),
      expenseDate: new Date(expenseDate),
      paymentMode,
      transactionId,
      expenseAttachments: preloadedFiles,
    };
  }

  protected override handleSubmit(): void {
    const expenseId = this.activatedRoute.snapshot.params[
      'expenseId'
    ] as string;
    if (!expenseId) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeEditExpense(formData, expenseId);
  }

  private prepareFormData(): IExpenseEditFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeEditExpense(
    formData: IExpenseEditFormDto,
    expenseId: string
  ): void {
    this.loadingService.show({
      title: 'Updating expense',
      message: "We're updating the expense. This will just take a moment.",
    });
    this.form.disable();

    this.expenseService
      .editExpense(formData, expenseId)
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
          this.notificationService.success('Expense updated successfully');
          const routeSegments = [
            ROUTE_BASE_PATHS.EXPENSE,
            ROUTES.EXPENSE.LEDGER,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to update expense');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm(this.initialExpenseData() ?? {});
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Edit Expense',
      subtitle: 'Edit an expense',
    };
  }
}
