import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import { RouterNavigationService } from '@shared/services';
import { FORCE_FUEL_EXPENSE_FORM_CONFIG } from '../../config';
import {
  IFuelExpenseForceFormDto,
  IFuelExpenseForceUIFormDto,
  ILinkedUserVehicleDetailGetResponseDto,
} from '../../types/fuel-expense.dto';
import { FuelExpenseService } from '../../services/fuel-expense.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { IPageHeaderConfig, ITrackedFields } from '@shared/types';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LinkedVehiclePetroCardComponent } from '../../shared/linked-vehicle-petro-card/linked-vehicle-petro-card.component';
import { FuelExpenseAmountFieldComponent } from '../../shared/fuel-expense-amount-field/fuel-expense-amount-field.component';

@Component({
  selector: 'app-force-fuel-expense',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
    LinkedVehiclePetroCardComponent,
    FuelExpenseAmountFieldComponent,
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
  private readonly fuelAmountField = viewChild(FuelExpenseAmountFieldComponent);

  private trackedFuelExpenseFields!: ITrackedFields<IFuelExpenseForceUIFormDto>;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly linkedUserVehicleDetail =
    signal<ILinkedUserVehicleDetailGetResponseDto | null>(null);

  protected readonly selectedEmployeeName = computed(() => {
    const empName = this.trackedFuelExpenseFields?.employeeName?.();
    return empName && typeof empName === 'string' ? empName : null;
  });

  protected readonly showRemainingForceFuelFields = computed(() => {
    const emp = this.selectedEmployeeName();
    if (!emp) {
      return true;
    }
    const detail = this.linkedUserVehicleDetail();
    return !!(detail?.vehicle && Object.keys(detail.vehicle).length > 0);
  });

  ngOnInit(): void {
    this.form = this.formService.createForm<IFuelExpenseForceUIFormDto>(
      FORCE_FUEL_EXPENSE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    const trackedFields: (keyof IFuelExpenseForceUIFormDto)[] = [
      'employeeName',
    ];

    this.trackedFuelExpenseFields =
      this.formService.trackMultipleFieldChanges<IFuelExpenseForceUIFormDto>(
        this.form.formGroup,
        trackedFields,
        this.destroyRef
      );
  }

  protected override handleSubmit(): void {
    if (!this.fuelAmountField()?.ensureCanSubmit()) {
      this.isSubmitting.set(false);
      return;
    }
    const formData = this.prepareFormData();
    this.executeForceExpense(formData);
  }

  private prepareFormData(): IFuelExpenseForceFormDto {
    const formData = this.form.getData();
    return {
      ...formData,
      vehicleName: this.linkedUserVehicleDetail()?.vehicle?.id ?? '',
      cardName: this.linkedUserVehicleDetail()?.card?.id ?? null,
    };
  }

  private executeForceExpense(formData: IFuelExpenseForceFormDto): void {
    const detail = this.linkedUserVehicleDetail();
    const hasValidVehicle =
      detail?.vehicle && Object.keys(detail.vehicle).length > 0;
    if (!hasValidVehicle) {
      this.notificationService.error('No vehicle linked for this employee.');
      this.isSubmitting.set(false);
      return;
    }

    this.loadingService.show({
      title: 'Recording fuel expense',
      message:
        "We're recording the fuel expense. This will just take a moment.",
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
