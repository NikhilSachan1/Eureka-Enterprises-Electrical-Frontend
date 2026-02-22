import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import { RouterNavigationService } from '@shared/services';
import { FORCE_FUEL_EXPENSE_FORM_CONFIG } from '../../config';
import {
  IFuelExpenseForceFormDto,
  IFuelExpenseForceUIFormDto,
} from '../../types/fuel-expense.dto';
import { FuelExpenseService } from '../../services/fuel-expense.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { IPageHeaderConfig } from '@shared/types';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LinkedVehiclePetroCardComponent } from '../../shared/linked-vehicle-petro-card/linked-vehicle-petro-card.component';

@Component({
  selector: 'app-force-fuel-expense',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
    LinkedVehiclePetroCardComponent,
  ],
  templateUrl: './force-fuel-expense.component.html',
  styleUrl: './force-fuel-expense.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForceFuelExpenseComponent
  extends FormBase<IFuelExpenseForceUIFormDto>
  implements OnInit
{
  private readonly fuelExpenseService = inject(FuelExpenseService);
  private readonly routerNavigationService = inject(RouterNavigationService);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  //TODO: Remove this mock data
  protected readonly linkedVehicle = {
    registrationNo: 'DL 01 AB 1234',
    brand: 'Maruti Suzuki',
    model: 'Swift Dzire',
    fuelType: 'Petrol',
  };

  protected readonly linkedPetroCard = null;

  ngOnInit(): void {
    this.form = this.formService.createForm<IFuelExpenseForceUIFormDto>(
      FORCE_FUEL_EXPENSE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    // this.loadMockData(FORCE_EXPENSE_PREFILLED_DATA);
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeForceExpense(formData);
  }

  private prepareFormData(): IFuelExpenseForceFormDto {
    const formData = this.form.getData();
    return {
      ...formData,
      vehicleName: '',
      cardName: null,
    };
  }

  private executeForceExpense(formData: IFuelExpenseForceFormDto): void {
    this.loadingService.show({
      title: 'Force Fuel Expense',
      message: 'Please wait while we process the force fuel expense...',
    });
    this.form.disable();

    this.fuelExpenseService
      .forceFuelExpense(formData)
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
            'Force fuel expense applied successfully'
          );
          const routeSegments = [
            ROUTE_BASE_PATHS.TRANSPORT,
            ROUTE_BASE_PATHS.FUEL,
            ROUTES.FUEL.LEDGER,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to apply force fuel expense');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm();
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Force Fuel Expense',
      subtitle: 'Force a fuel expense on behalf of an employee',
    };
  }
}
