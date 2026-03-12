import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBase } from '@shared/base/form.base';
import { RouterNavigationService } from '@shared/services';
import {
  IvehicleServiceEditFormDto,
  IVehicleServiceEditUIFormDto,
} from '../../types/vehicle-service.dto';
import { VehicleServiceService } from '../../services/vehicle-service.service';
import { EDIT_VEHICLE_SERVICE_FORM_CONFIG } from '../../config/form/edit-vehicle-service.config';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { IVehicleServiceDetailResolverResponse } from '../../types/vehicle-service.interface';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IPageHeaderConfig } from '@shared/types';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-vehicle-service',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-vehicle-service.component.html',
  styleUrl: './edit-vehicle-service.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditVehicleServiceComponent
  extends FormBase<IVehicleServiceEditUIFormDto>
  implements OnInit
{
  private readonly vehicleServiceService = inject(VehicleServiceService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly initialVehicleServiceData =
    signal<IVehicleServiceEditUIFormDto | null>(null);

  ngOnInit(): void {
    this.loadVehicleServiceDataFromRoute();

    this.form = this.formService.createForm<IVehicleServiceEditUIFormDto>(
      EDIT_VEHICLE_SERVICE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: this.initialVehicleServiceData(),
      }
    );
  }

  private loadVehicleServiceDataFromRoute(): void {
    const vehicleServiceDetailFromResolver =
      this.activatedRoute.snapshot.data['vehicleServiceDetail'];

    if (!vehicleServiceDetailFromResolver) {
      this.logger.logUserAction('No vehicle service data found in route');
      const routeSegments = [
        ROUTE_BASE_PATHS.TRANSPORT,
        ROUTE_BASE_PATHS.VEHICLE_SERVICE,
        ROUTES.VEHICLE_SERVICE.LIST,
      ];
      void this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    const prefilledVehicleServiceData = this.preparePrefilledFormData(
      vehicleServiceDetailFromResolver
    );
    this.initialVehicleServiceData.set(prefilledVehicleServiceData);
  }

  private preparePrefilledFormData(
    vehicleServiceDetailFromResolver: IVehicleServiceDetailResolverResponse
  ): IVehicleServiceEditUIFormDto {
    const preloadedFiles =
      vehicleServiceDetailFromResolver.preloadedFiles ?? [];

    const {
      serviceDate,
      odometerReading,
      serviceType,
      serviceCost,
      remarks,
      vehicleMasterId,
      serviceCenterName,
    } = vehicleServiceDetailFromResolver;
    return {
      vehicleName: vehicleMasterId,
      serviceAttachments: preloadedFiles,
      serviceDate: new Date(serviceDate),
      odometerReading: Number(odometerReading),
      serviceType,
      serviceCost: Number(serviceCost),
      remarks,
      serviceCenterName,
    };
  }

  protected override handleSubmit(): void {
    const vehicleServiceId = this.activatedRoute.snapshot.params[
      'vehicleServiceId'
    ] as string;
    if (!vehicleServiceId) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeEditVehicleService(formData, vehicleServiceId);
  }

  private prepareFormData(): IvehicleServiceEditFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeEditVehicleService(
    formData: IvehicleServiceEditFormDto,
    vehicleServiceId: string
  ): void {
    this.loadingService.show({
      title: 'Edit Vehicle Service',
      message: 'Please wait while we edit vehicle service...',
    });
    this.form.disable();

    this.vehicleServiceService
      .editVehicleService(formData, vehicleServiceId)
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
            'Vehicle service updated successfully'
          );
          const routeSegments = [
            ROUTE_BASE_PATHS.TRANSPORT,
            ROUTE_BASE_PATHS.VEHICLE_SERVICE,
            ROUTES.VEHICLE_SERVICE.LIST,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to update vehicle service');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm(this.initialVehicleServiceData() ?? {});
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Edit Vehicle Service',
      subtitle: 'Edit a vehicle service',
    };
  }
}
