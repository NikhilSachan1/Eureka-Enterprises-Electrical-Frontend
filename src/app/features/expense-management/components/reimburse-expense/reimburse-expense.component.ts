import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { AppConfigService } from '@core/services/app-config.service';
import { LoggerService } from '@core/services/logger.service';
import { REIMBURSE_EXPENSE_FORM_CONFIG } from '@features/expense-management/config';
import { ExpenseService } from '@features/expense-management/services/expense.service';
import { IExpenseReimburseRequestDto } from '@features/expense-management/types/expense.dto';
import { ButtonComponent } from '@shared/components/button/button.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { EXPENSE_CATEGORY_DATA } from '@shared/config/static-data.config';
import {
  FORM_VALIDATION_MESSAGES,
  ROUTE_BASE_PATHS,
  ROUTES,
} from '@shared/constants';
import { FormService } from '@shared/services/form.service';
import { LoadingService } from '@shared/services/loading.service';
import { NotificationService } from '@shared/services/notification.service';
import { RouterNavigationService } from '@shared/services/router-navigation.service';
import { IEnhancedForm, IPageHeaderConfig } from '@shared/types';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { finalize } from 'rxjs';

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
export class ReimburseExpenseComponent implements OnInit {
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
    this.form = this.formService.createForm(REIMBURSE_EXPENSE_FORM_CONFIG);
  }

  protected onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeReimburseExpense(formData);
  }

  private prepareFormData(): IExpenseReimburseRequestDto {
    const {
      employeeName,
      expenseDate,
      description,
      paymentMode,
      transactionId,
      expenseAmount,
      attachment,
    } = this.form.getData() as {
      employeeName: string;
      expenseDate: string;
      description: string;
      paymentMode: string;
      transactionId: string;
      expenseAmount: number;
      attachment: File[];
    };
    const dateStr = new Date(expenseDate);
    const formattedDate = this.datePipe.transform(
      dateStr,
      this.appConfigService.dateFormats.API
    );

    return {
      userId: employeeName,
      category: getMappedValueFromArrayOfObjects(
        EXPENSE_CATEGORY_DATA,
        'settlement',
        'value',
        'value'
      ),
      description,
      amount: expenseAmount,
      expenseDate: formattedDate as string,
      paymentMode,
      files: attachment,
      transactionId,
    };
  }

  private executeReimburseExpense(formData: IExpenseReimburseRequestDto): void {
    this.isSubmitting.set(true);
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
          this.notificationService.success('Expense reimursed successfully');
          const routeSegments = [
            ROUTE_BASE_PATHS.EXPENSE,
            ROUTES.EXPENSE.LEDGER,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to reimburse expense');
        },
      });
  }

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      this.logger.warn('Reimburse expense form validation failed');
      return false;
    }
    return true;
  }

  protected onReset(): void {
    try {
      this.logger.logUserAction('Reset Reimburse Expense Form');
      this.form.reset();
    } catch (error) {
      this.logger.error('Error resetting form', error);
    }
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Reimburse Expense',
      subtitle: 'Reimburse approved expenses to employees',
    };
  }
}
