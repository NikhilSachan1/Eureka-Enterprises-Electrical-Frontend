import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppConfigService, LoggerService } from '@core/services';
import { FORCE_EXPENSE_FORM_CONFIG } from '@features/expense-management/config';
import { ExpenseService } from '@features/expense-management/services/expense.service';
import { IExpenseForceRequestDto } from '@features/expense-management/types/expense.dto';
import {
  FORM_VALIDATION_MESSAGES,
  ROUTE_BASE_PATHS,
  ROUTES,
} from '@shared/constants';
import {
  FormService,
  LoadingService,
  NotificationService,
  RouterNavigationService,
} from '@shared/services';
import { IEnhancedForm, IPageHeaderConfig } from '@shared/types';
import { finalize } from 'rxjs';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ReactiveFormsModule } from '@angular/forms';
import { transformDateFormat } from '@shared/utility';

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
export class ForceExpenseComponent implements OnInit {
  private readonly formService = inject(FormService);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);
  private readonly expenseService = inject(ExpenseService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly datePipe = inject(DatePipe);
  private readonly appConfigService = inject(AppConfigService);

  protected form!: IEnhancedForm;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly isSubmitting = signal(false);

  ngOnInit(): void {
    this.form = this.formService.createForm(
      FORCE_EXPENSE_FORM_CONFIG,
      this.destroyRef
    );
  }

  protected onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeForceExpense(formData);
  }

  private prepareFormData(): IExpenseForceRequestDto {
    const {
      employeeName,
      expenseDate,
      description,
      paymentMode,
      expenseType,
      expenseAmount,
      attachment,
      transactionId,
    } = this.form.getData() as {
      employeeName: string;
      expenseDate: string;
      description: string;
      paymentMode: string;
      expenseType: string;
      expenseAmount: number;
      attachment: File[];
      transactionId: string | null;
    };

    return {
      userId: employeeName,
      category: expenseType,
      description,
      amount: expenseAmount,
      expenseDate: transformDateFormat(expenseDate),
      paymentMode,
      files: attachment,
      transactionId,
    };
  }

  private executeForceExpense(formData: IExpenseForceRequestDto): void {
    this.isSubmitting.set(true);
    this.loadingService.show({
      title: 'Force Expense',
      message: 'Please wait while we process the force expense...',
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
          this.notificationService.success('Expense forced successfully');
          const routeSegments = [
            ROUTE_BASE_PATHS.EXPENSE,
            ROUTES.EXPENSE.LEDGER,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to force expense');
        },
      });
  }

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      this.logger.warn('Force expense form validation failed');
      return false;
    }
    return true;
  }

  protected onReset(): void {
    try {
      this.logger.logUserAction('Reset Force Expense Form');
      this.form.reset();
    } catch (error) {
      this.logger.error('Error resetting form', error);
    }
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Force Expense',
      subtitle: 'Force an expense on behalf of an employee',
    };
  }
}
