import { HttpErrorResponse } from '@angular/common/http';
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
import {
  IFuelExpenseAddFormDto,
  IFuelExpenseAddUIFormDto,
  ILinkedUserVehicleDetailGetResponseDto,
} from '../../types/fuel-expense.dto';
import { RouterNavigationService } from '@shared/services';
import { FuelExpenseService } from '../../services/fuel-expense.service';
import { ADD_FUEL_EXPENSE_FORM_CONFIG } from '../../config';
import {
  fuelExpensePrefillFormDefaults,
  takeFuelExpenseFormPrefill,
} from '@features/expense-management/config/form/fuel-expense-type-redirect';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { EFilingTarget, IPageHeaderConfig } from '@shared/types';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { LinkedVehiclePetroCardComponent } from '@features/transport-management/fuel-expense-management/shared/linked-vehicle-petro-card/linked-vehicle-petro-card.component';
import { FuelExpenseAmountFieldComponent } from '@features/transport-management/fuel-expense-management/shared/fuel-expense-amount-field/fuel-expense-amount-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '@shared/components/button/button.component';
import { FilingTargetComponent } from '@shared/components/filing-target/filing-target.component';

@Component({
  selector: 'app-add-fuel-expense',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    LinkedVehiclePetroCardComponent,
    FuelExpenseAmountFieldComponent,
    ReactiveFormsModule,
    ButtonComponent,
    FilingTargetComponent,
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
  private readonly fuelAmountField = viewChild(FuelExpenseAmountFieldComponent);
  private readonly filingTarget = viewChild(FilingTargetComponent);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly linkedUserVehicleDetail =
    signal<ILinkedUserVehicleDetailGetResponseDto | null>(null);
  protected readonly managedUsersResolved = signal(false);
  protected readonly canFileForOthers = signal(false);
  protected readonly onBehalfEmployeeId = signal<string | null>(null);
  protected readonly filingTargets = EFilingTarget;
  protected readonly filingFor = signal<EFilingTarget>(EFilingTarget.SELF);
  protected readonly showLinkedVehicle = computed(
    () =>
      this.managedUsersResolved() &&
      (this.filingFor() === EFilingTarget.SELF || !!this.onBehalfEmployeeId())
  );

  protected readonly redirectRoute = [
    ROUTE_BASE_PATHS.TRANSPORT,
    ROUTE_BASE_PATHS.FUEL,
    ROUTES.FUEL.LEDGER,
  ];

  ngOnInit(): void {
    this.form = this.formService.createForm<IFuelExpenseAddUIFormDto>(
      ADD_FUEL_EXPENSE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: fuelExpensePrefillFormDefaults(
          takeFuelExpenseFormPrefill()
        ),
      }
    );
  }

  protected onFilingTargetChange(target: EFilingTarget): void {
    this.filingFor.set(target);
    if (target === EFilingTarget.OTHER) {
      this.linkedUserVehicleDetail.set(null);
    }
  }

  protected override handleSubmit(): void {
    if (!this.fuelAmountField()?.ensureCanSubmit()) {
      this.isSubmitting.set(false);
      return;
    }
    const formData = this.prepareFormData();
    this.executeAddExpense(formData);
  }

  private prepareFormData(): IFuelExpenseAddFormDto {
    const formData = this.form.getData();
    return {
      ...formData,
      employeeName: formData.employeeName,
      vehicleName: this.linkedUserVehicleDetail()?.vehicle?.id ?? '',
      cardName: this.linkedUserVehicleDetail()?.card?.id ?? null,
    };
  }

  private executeAddExpense(formData: IFuelExpenseAddFormDto): void {
    this.loadingService.show({
      title: 'Adding Fuel Expense',
      message:
        "We're adding your new fuel expense. This will just take a moment.",
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
        error: (error: HttpErrorResponse) => {
          if (error?.status === 403) {
            return;
          }
          this.notificationService.error('Failed to add fuel expense');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm();
    this.filingTarget()?.reset();
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Add Fuel Expense',
      subtitle: 'Add a new fuel expense',
    };
  }
}
