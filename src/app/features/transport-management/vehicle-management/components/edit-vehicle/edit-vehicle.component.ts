import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { IPageHeaderConfig } from '@shared/types';
import { finalize } from 'rxjs';
import { IvehicleEditFormDto } from '../../types/vehicle.dto';
import { RouterNavigationService } from '@shared/services';
import { VehicleService } from '../../services/vehicle.service';
import { ActivatedRoute } from '@angular/router';
import { EDIT_VEHICLE_FORM_CONFIG } from '../../config';
import { IVehicleDetailResolverResponse } from '../../types/vehicle.interface';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBase } from '@shared/base/form.base';

@Component({
  selector: 'app-edit-vehicle',
  imports: [
    InputFieldComponent,
    ButtonComponent,
    PageHeaderComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-vehicle.component.html',
  styleUrl: './edit-vehicle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditVehicleComponent
  extends FormBase<IvehicleEditFormDto>
  implements OnInit
{
  private readonly vehicleService = inject(VehicleService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly initialVehicleData = signal<IvehicleEditFormDto | null>(
    null
  );

  ngOnInit(): void {
    this.loadVehicleDataFromRoute();

    this.form = this.formService.createForm<IvehicleEditFormDto>(
      EDIT_VEHICLE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: this.initialVehicleData(),
      }
    );
  }

  private loadVehicleDataFromRoute(): void {
    const vehicleDetailFromResolver =
      this.activatedRoute.snapshot.data['vehicleDetail'];

    if (!vehicleDetailFromResolver) {
      this.logger.logUserAction('No vehicle data found in route');
      const routeSegments = [
        ROUTE_BASE_PATHS.TRANSPORT,
        ROUTE_BASE_PATHS.VEHICLE,
        ROUTES.VEHICLE.LIST,
      ];
      void this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    const prefilledVehicleData = this.preparePrefilledFormData(
      vehicleDetailFromResolver
    );
    this.initialVehicleData.set(prefilledVehicleData);
  }

  private preparePrefilledFormData(
    vehicleDetailFromResolver: IVehicleDetailResolverResponse
  ): IvehicleEditFormDto {
    const preloadedFiles = vehicleDetailFromResolver.preloadedFiles ?? [];

    const {
      registrationNo,
      brand,
      model,
      mileage,
      fuelType,
      purchaseDate,
      dealerName,
      insuranceStartDate,
      insuranceEndDate,
      pucStartDate,
      pucEndDate,
      remarks,
    } = vehicleDetailFromResolver;

    return {
      vehicleRegistrationNo: registrationNo,
      vehicleBrand: brand,
      vehicleModel: model,
      vehicleMileage: mileage,
      vehicleFuelType: fuelType,
      vehiclePurchaseDate: new Date(purchaseDate),
      vehicleDealerName: dealerName,
      vehicleInsuranceDate: [
        new Date(insuranceStartDate),
        new Date(insuranceEndDate),
      ],
      vehiclePUCDate: [new Date(pucStartDate), new Date(pucEndDate)],
      remarks,
      vehicleFiles: preloadedFiles,
    };
  }

  protected override handleSubmit(): void {
    const vehicleId = this.activatedRoute.snapshot.params[
      'vehicleId'
    ] as string;
    if (!vehicleId) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeEditVehicle(formData, vehicleId);
  }

  private prepareFormData(): IvehicleEditFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeEditVehicle(
    formData: IvehicleEditFormDto,
    vehicleId: string
  ): void {
    this.loadingService.show({
      title: 'Edit Vehicle',
      message: 'Please wait while we edit vehicle...',
    });
    this.form.disable();

    this.vehicleService
      .editVehicle(formData, vehicleId)
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
          this.notificationService.success('Vehicle updated successfully');
          const routeSegments = [
            ROUTE_BASE_PATHS.TRANSPORT,
            ROUTE_BASE_PATHS.VEHICLE,
            ROUTES.VEHICLE.LIST,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to update vehicle');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm(this.initialVehicleData() ?? {});
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Edit Vehicle',
      subtitle: 'Edit a vehicle',
    };
  }
}
