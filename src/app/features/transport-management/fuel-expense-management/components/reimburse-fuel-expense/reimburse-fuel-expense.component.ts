import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import { RouterNavigationService } from '@shared/services';
import { REIMBURSE_FUEL_EXPENSE_FORM_CONFIG } from '../../config';
import { FuelExpenseService } from '../../services/fuel-expense.service';
import { IFuelExpenseReimburseFormDto } from '../../types/fuel-expense.dto';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { IPageHeaderConfig } from '@shared/types';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-reimburse-fuel-expense',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './reimburse-fuel-expense.component.html',
  styleUrl: './reimburse-fuel-expense.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReimburseFuelExpenseComponent
  extends FormBase<IFuelExpenseReimburseFormDto>
  implements OnInit
{
  private readonly fuelExpenseService = inject(FuelExpenseService);
  private readonly routerNavigationService = inject(RouterNavigationService);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  ngOnInit(): void {
    this.form = this.formService.createForm<IFuelExpenseReimburseFormDto>(
      REIMBURSE_FUEL_EXPENSE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    // this.loadMockData(REIMBURSE_EXPENSE_PREFILLED_DATA);
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeReimburseFuelExpense(formData);
  }

  private prepareFormData(): IFuelExpenseReimburseFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeReimburseFuelExpense(
    formData: IFuelExpenseReimburseFormDto
  ): void {
    this.loadingService.show({
      title: 'Reimburse Fuel Expense',
      message: 'Please wait while we process the reimburse fuel expense...',
    });
    this.form.disable();

    this.fuelExpenseService
      .reimburseFuelExpense(formData)
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
            'Reimburse fuel expense applied successfully'
          );
          const routeSegments = [
            ROUTE_BASE_PATHS.TRANSPORT,
            ROUTE_BASE_PATHS.FUEL,
            ROUTES.FUEL.LEDGER,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error(
            'Failed to apply reimburse fuel expense'
          );
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm();
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Reimburse Fuel Expense',
      subtitle: 'Reimburse approved fuel expenses to employees',
    };
  }
}
