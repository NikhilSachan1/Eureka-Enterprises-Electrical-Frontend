import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoggerService } from '@core/services';
import { EDIT_EXPENSE_FORM_CONFIG } from '@features/expense-management/config';
import {
  FormService,
  LoadingService,
  NotificationService,
  RouterNavigationService,
} from '@shared/services';
import { IEnhancedForm, IPageHeaderConfig } from '@shared/types';
import { ExpenseService } from '@features/expense-management/services/expense.service';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';
import {
  FORM_VALIDATION_MESSAGES,
  ROUTE_BASE_PATHS,
  ROUTES,
} from '@shared/constants';
import { IExpenseEditRequestDto } from '@features/expense-management/types/expense.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { IExpenseDetailResolverResponse } from '@features/expense-management/types/expense.interface';
import { transformDateFormat } from '@shared/utility';

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
export class EditExpenseComponent implements OnInit {
  private readonly formService = inject(FormService);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);
  private readonly expenseService = inject(ExpenseService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected form!: IEnhancedForm;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly isSubmitting = signal(false);
  protected readonly initialExpenseData = signal<Record<
    string,
    unknown
  > | null>(null);

  ngOnInit(): void {
    this.loadExpenseDataFromRoute();
    this.form = this.formService.createForm(EDIT_EXPENSE_FORM_CONFIG, {
      destroyRef: this.destroyRef,
      defaultValues: this.initialExpenseData(),
    });
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
  ): Record<string, unknown> {
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
      expenseType: category,
      description,
      expenseAmount: Number(amount),
      expenseDate: new Date(expenseDate),
      paymentMode,
      transactionId,
      attachment: preloadedFiles,
    };
  }

  protected onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const expenseId = this.activatedRoute.snapshot.params[
      'expenseId'
    ] as string;
    if (!expenseId) {
      this.logger.logUserAction('No expense id found in route');
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      return;
    }

    const formData = this.prepareFormData();
    this.executeEditExpense(formData, expenseId);
  }

  private prepareFormData(): IExpenseEditRequestDto {
    const {
      expenseDate,
      description,
      paymentMode,
      expenseType,
      expenseAmount,
      attachment,
      transactionId,
    } = this.form.getData() as {
      expenseDate: string;
      description: string;
      paymentMode: string;
      expenseType: string;
      expenseAmount: number;
      attachment: File[];
      transactionId: string | null;
    };

    return {
      category: expenseType,
      description,
      amount: expenseAmount,
      expenseDate: transformDateFormat(expenseDate),
      paymentMode,
      files: attachment,
      transactionId,
    };
  }

  private executeEditExpense(
    formData: IExpenseEditRequestDto,
    expenseId: string
  ): void {
    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Edit Expense',
      message: 'Please wait while we edit expense...',
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

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      this.logger.warn('Edit expense form validation failed');
      return false;
    }
    return true;
  }

  protected onReset(): void {
    try {
      this.logger.logUserAction('Reset Edit Expense Form');
      this.form.reset(this.initialExpenseData() ?? {});
    } catch (error) {
      this.logger.error('Error resetting form', error);
    }
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Edit Expense',
      subtitle: 'Edit an expense',
    };
  }
}
