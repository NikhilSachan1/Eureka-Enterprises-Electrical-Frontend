import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import {
  IFuelExpenseAddFormDto,
  IFuelExpenseAddUIFormDto,
  ILinkedUserVehicleDetailGetResponseDto,
} from '../../types/fuel-expense.dto';
import { RouterNavigationService } from '@shared/services';
import { FuelExpenseService } from '../../services/fuel-expense.service';
import { ADD_FUEL_EXPENSE_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { IPageHeaderConfig } from '@shared/types';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { LinkedVehiclePetroCardComponent } from '@features/transport-management/fuel-expense-management/shared/linked-vehicle-petro-card/linked-vehicle-petro-card.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ADD_FUEL_EXPENSE_PREFILLED_DATA } from '@shared/mock-data/add-fuel-expense.mock-data';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-fuel-expense',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    LinkedVehiclePetroCardComponent,
    ReactiveFormsModule,
    ButtonComponent,
  ],
  templateUrl: './add-fuel-expense.component.html',
  styleUrl: './add-fuel-expense.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddFuelExpenseComponent
  extends FormBase<IFuelExpenseAddUIFormDto>
  implements OnInit
{
  private readonly fuelExpenseService = inject(FuelExpenseService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly linkedUserVehicleDetail =
    signal<ILinkedUserVehicleDetailGetResponseDto | null>(null);

  ngOnInit(): void {
    this.loadLinkedUserVehicleDetailFromRoute();

    this.form = this.formService.createForm<IFuelExpenseAddUIFormDto>(
      ADD_FUEL_EXPENSE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    this.loadMockData(ADD_FUEL_EXPENSE_PREFILLED_DATA);
  }

  private loadLinkedUserVehicleDetailFromRoute(): void {
    const linkedUserVehicleDetailFromResolver = this.activatedRoute.snapshot
      .data[
      'linkedUserVehicleDetail'
    ] as ILinkedUserVehicleDetailGetResponseDto;

    const hasValidVehicle =
      linkedUserVehicleDetailFromResolver?.vehicle &&
      Object.keys(linkedUserVehicleDetailFromResolver.vehicle).length > 0;

    if (!linkedUserVehicleDetailFromResolver || !hasValidVehicle) {
      this.logger.logUserAction(
        'No linked user vehicle detail or vehicle is empty'
      );
      this.notificationService.warning(
        'No vehicle linked for this route. Redirecting to ledger.'
      );
      const routeSegments = [
        ROUTE_BASE_PATHS.TRANSPORT,
        ROUTE_BASE_PATHS.FUEL,
        ROUTES.FUEL.LEDGER,
      ];
      void this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    this.linkedUserVehicleDetail.set(linkedUserVehicleDetailFromResolver);
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeAddExpense(formData);
  }

  private prepareFormData(): IFuelExpenseAddFormDto {
    const formData = this.form.getData();
    return {
      ...formData,
      vehicleName: this.linkedUserVehicleDetail()?.vehicle?.id ?? '',
      cardName: this.linkedUserVehicleDetail()?.card?.id ?? null,
    };
  }

  private executeAddExpense(formData: IFuelExpenseAddFormDto): void {
    this.loadingService.show({
      title: 'Add Fuel Expense',
      message: 'Please wait while we add fuel expense...',
    });
    this.form.disable();

    this.fuelExpenseService
      .addFuelExpense(formData)
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
          this.notificationService.success('Fuel expense added successfully');
          const routeSegments = [
            ROUTE_BASE_PATHS.TRANSPORT,
            ROUTE_BASE_PATHS.FUEL,
            ROUTES.FUEL.LEDGER,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to add fuel expense');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm();
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Add Fuel Expense',
      subtitle: 'Add a new fuel expense',
    };
  }
}
