import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import {
  AppConfigurationService,
  RouterNavigationService,
} from '@shared/services';
import { VehicleService } from '../../services/vehicle.service';
import { IPageHeaderConfig } from '@shared/types';
import { ADD_VEHICLE_FORM_CONFIG } from '../../config';
import { IvehicleAddFormDto } from '../../types/vehicle.dto';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { ADD_VEHICLE_PREFILLED_DATA } from '@shared/mock-data/add-vehicle.mock-data';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ReactiveFormsModule } from '@angular/forms';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { FormBase } from '@shared/base/form.base';

@Component({
  selector: 'app-add-vehicle',
  imports: [
    PageHeaderComponent,
    ReactiveFormsModule,
    InputFieldComponent,
    ButtonComponent,
  ],
  templateUrl: './add-vehicle.component.html',
  styleUrl: './add-vehicle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddVehicleComponent
  extends FormBase<IvehicleAddFormDto>
  implements OnInit
{
  private readonly vehicleService = inject(VehicleService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  ngOnInit(): void {
    this.form = this.formService.createForm<IvehicleAddFormDto>(
      ADD_VEHICLE_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    this.loadMockData(ADD_VEHICLE_PREFILLED_DATA);
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeAddVehicle(formData);
  }

  private prepareFormData(): IvehicleAddFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeAddVehicle(formData: IvehicleAddFormDto): void {
    this.loadingService.show({
      title: 'Add Vehicle',
      message: 'Please wait while we add vehicle...',
    });
    this.form.disable();

    this.vehicleService
      .addVehicle(formData)
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
          this.notificationService.success('Vehicle added successfully');
          this.appConfigurationService.refreshVehicleDropdowns();
          const routeSegments = [
            ROUTE_BASE_PATHS.TRANSPORT,
            ROUTE_BASE_PATHS.VEHICLE,
            ROUTES.VEHICLE.LIST,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to add vehicle');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm();
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Add Vehicle',
      subtitle: 'Add a new vehicle',
    };
  }
}
