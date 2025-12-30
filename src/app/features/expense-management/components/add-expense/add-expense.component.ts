import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import {
  FormService,
  LoadingService,
  NotificationService,
  RouterNavigationService,
} from '@shared/services';
import { IEnhancedForm, IPageHeaderConfig } from '@shared/types';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ADD_EXPENSE_FORM_CONFIG } from '@features/expense-management/config';
import { ButtonComponent } from '@shared/components/button/button.component';
import { LoggerService, EnvironmentService } from '@core/services';
import { ExpenseService } from '@features/expense-management/services/expense.service';
import { IExpenseAddRequestDto } from '@features/expense-management/types/expense.dto';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FORM_VALIDATION_MESSAGES,
  ROUTE_BASE_PATHS,
  ROUTES,
} from '@shared/constants';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { transformDateFormat } from '@shared/utility';
import { ADD_EXPENSE_PREFILLED_DATA } from '@shared/mock-data/add-expense.mock-data';

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
export class AddExpenseComponent implements OnInit {
  private readonly formService = inject(FormService);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);
  private readonly expenseService = inject(ExpenseService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly environmentService = inject(EnvironmentService);

  protected form!: IEnhancedForm;
  protected readonly initialExpenseData = signal<Record<
    string,
    unknown
  > | null>(null);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly isSubmitting = signal(false);

  ngOnInit(): void {
    this.loadMockData();
    this.form = this.formService.createForm(ADD_EXPENSE_FORM_CONFIG, {
      destroyRef: this.destroyRef,
      defaultValues: this.initialExpenseData(),
    });
  }

  protected onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeAddExpense(formData);
  }

  private prepareFormData(): IExpenseAddRequestDto {
    const {
      expenseDate,
      description,
      paymentMode,
      expenseType,
      expenseAmount,
      attachment,
      transactionId,
    } = this.form.getData() as {
      expenseDate: Date;
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

  private executeAddExpense(formData: IExpenseAddRequestDto): void {
    this.isSubmitting.set(true);
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

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      this.logger.warn('Add expense form validation failed');
      return false;
    }
    return true;
  }

  protected onReset(): void {
    try {
      this.logger.logUserAction('Reset Add Expense Form');
      this.form.reset();
    } catch (error) {
      this.logger.error('Error resetting form', error);
    }
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Add Expense',
      subtitle: 'Add a new expense',
    };
  }

  private loadMockData(): void {
    if (this.environmentService.isTestDataEnabled) {
      this.initialExpenseData.set(ADD_EXPENSE_PREFILLED_DATA);
    }
  }
}
