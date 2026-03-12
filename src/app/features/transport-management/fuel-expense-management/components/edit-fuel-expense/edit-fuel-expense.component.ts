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
  IFuelExpenseEditFormDto,
  IFuelExpenseEditUIFormDto,
  ILinkedUserVehicleDetailGetResponseDto,
} from '../../types/fuel-expense.dto';
import { RouterNavigationService } from '@shared/services';
import { ActivatedRoute } from '@angular/router';
import { FuelExpenseService } from '../../services/fuel-expense.service';
import { EDIT_FUEL_EXPENSE_FORM_CONFIG } from '../../config';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IPageHeaderConfig } from '@shared/types';
import { IFuelExpenseDetailResolverResponse } from '../../types/fuel-expense.interface';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LinkedVehiclePetroCardComponent } from '../../shared/linked-vehicle-petro-card/linked-vehicle-petro-card.component';

@Component({
  selector: 'app-edit-fuel-expense',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
    LinkedVehiclePetroCardComponent,
  ],
  templateUrl: './edit-fuel-expense.component.html',
  styleUrl: './edit-fuel-expense.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditFuelExpenseComponent
  extends FormBase<IFuelExpenseEditUIFormDto>
  implements OnInit
{
  private readonly fuelExpenseService = inject(FuelExpenseService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly initialFuelExpenseData =
    signal<IFuelExpenseEditUIFormDto | null>(null);
  protected readonly linkedUserVehicleDetail =
    signal<ILinkedUserVehicleDetailGetResponseDto | null>(null);

  ngOnInit(): void {
    this.loadFuelExpenseDataFromRoute();

    this.form = this.formService.createForm<IFuelExpenseEditUIFormDto>(
      EDIT_FUEL_EXPENSE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: this.initialFuelExpenseData(),
      }
    );
  }

  private loadFuelExpenseDataFromRoute(): void {
    const fuelExpenseDetailFromResolver =
      this.activatedRoute.snapshot.data['fuelExpenseDetail'];

    if (!fuelExpenseDetailFromResolver) {
      const routeSegments = [
        ROUTE_BASE_PATHS.TRANSPORT,
        ROUTE_BASE_PATHS.FUEL,
        ROUTES.FUEL.LEDGER,
      ];
      void this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    const prefilledFuelExpenseData = this.preparePrefilledFormData(
      fuelExpenseDetailFromResolver
    );
    const fuelExpenseDetail =
      fuelExpenseDetailFromResolver.history[
        fuelExpenseDetailFromResolver.history.length - 1
      ];
    this.linkedUserVehicleDetail.set({
      vehicle: fuelExpenseDetail.vehicle,
      card: fuelExpenseDetail.card,
    });
    this.initialFuelExpenseData.set(prefilledFuelExpenseData);
  }

  private preparePrefilledFormData(
    fuelExpenseDetailFromResolver: IFuelExpenseDetailResolverResponse
  ): IFuelExpenseEditUIFormDto {
    const latestFuelExpenseData =
      fuelExpenseDetailFromResolver.history[
        fuelExpenseDetailFromResolver.history.length - 1
      ];
    const preloadedFiles = fuelExpenseDetailFromResolver.preloadedFiles ?? [];

    const {
      fuelLiters,
      fuelAmount,
      fillDate,
      paymentMode,
      transactionId,
      odometerKm,
      description,
    } = latestFuelExpenseData;
    return {
      fuelLiters: Number(fuelLiters),
      fuelAmount: Number(fuelAmount),
      fuelFillDate: new Date(fillDate),
      paymentMode,
      transactionId,
      odometerReading: Number(odometerKm),
      remark: description,
      fuelExpenseAttachments: preloadedFiles,
    };
  }

  protected override handleSubmit(): void {
    const fuelExpenseId = this.activatedRoute.snapshot.params[
      'fuelExpenseId'
    ] as string;
    if (!fuelExpenseId) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeEditFuelExpense(formData, fuelExpenseId);
  }

  private prepareFormData(): IFuelExpenseEditFormDto {
    const formData = this.form.getData();
    return {
      ...formData,
      vehicleName: this.linkedUserVehicleDetail()?.vehicle?.id ?? '',
      cardName: this.linkedUserVehicleDetail()?.card?.id ?? null,
    };
  }

  private executeEditFuelExpense(
    formData: IFuelExpenseEditFormDto,
    fuelExpenseId: string
  ): void {
    this.loadingService.show({
      title: 'Edit Fuel Expense',
      message: 'Please wait while we edit fuel  expense...',
    });
    this.form.disable();

    this.fuelExpenseService
      .editFuelExpense(formData, fuelExpenseId)
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
          this.notificationService.success('Fuel expense updated successfully');
          const routeSegments = [
            ROUTE_BASE_PATHS.TRANSPORT,
            ROUTE_BASE_PATHS.FUEL,
            ROUTES.FUEL.LEDGER,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to update fuel expense');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm(this.initialFuelExpenseData() ?? {});
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Edit Fuel Expense',
      subtitle: 'Edit a fuel expense',
    };
  }
}
