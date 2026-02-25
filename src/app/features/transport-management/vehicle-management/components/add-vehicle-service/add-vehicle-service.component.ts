import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import { IvehicleServiceAddFormDto } from '../../types/vehicle-service.dto';
import { VehicleServiceService } from '../../services/vehicle-service.service';
import { RouterNavigationService } from '@shared/services';
import { ADD_VEHICLE_SERVICE_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { IPageHeaderConfig } from '@shared/types';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-vehicle-service',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './add-vehicle-service.component.html',
  styleUrl: './add-vehicle-service.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddVehicleServiceComponent
  extends FormBase<IvehicleServiceAddFormDto>
  implements OnInit
{
  private readonly vehicleServiceService = inject(VehicleServiceService);
  private readonly routerNavigationService = inject(RouterNavigationService);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  ngOnInit(): void {
    this.form = this.formService.createForm<IvehicleServiceAddFormDto>(
      ADD_VEHICLE_SERVICE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    // this.loadMockData(ADD_VEHICLE_SERVICE_PREFILLED_DATA);
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeAddVehicleService(formData);
  }

  private prepareFormData(): IvehicleServiceAddFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeAddVehicleService(formData: IvehicleServiceAddFormDto): void {
    this.loadingService.show({
      title: 'Add Vehicle Service',
      message: 'Please wait while we add vehicle service...',
    });
    this.form.disable();

    this.vehicleServiceService
      .addVehicleService(formData)
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
            'Vehicle service added successfully'
          );
          const routeSegments = [
            ROUTE_BASE_PATHS.TRANSPORT,
            ROUTE_BASE_PATHS.VEHICLE_SERVICE,
            ROUTES.VEHICLE_SERVICE.LIST,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to add vehicle service');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm();
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Add Vehicle Service',
      subtitle: 'Add a new vehicle service',
    };
  }
}
