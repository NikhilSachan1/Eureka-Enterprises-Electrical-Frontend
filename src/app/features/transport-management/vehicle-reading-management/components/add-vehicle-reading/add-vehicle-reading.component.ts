import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import { VehicleReadingService } from '../../services/vehicle-reading.service';
import { RouterNavigationService } from '@shared/services';
import {
  IvehicleReadingAddFormDto,
  IVehicleReadingAddUIFormDto,
} from '../../types/vehicle-reading.dto';
import { ADD_VEHICLE_READING_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { IPageHeaderConfig } from '@shared/types';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LinkedVehiclePetroCardComponent } from '@features/transport-management/fuel-expense-management/shared/linked-vehicle-petro-card/linked-vehicle-petro-card.component';
import { ILinkedUserVehicleDetailGetResponseDto } from '@features/transport-management/fuel-expense-management/types/fuel-expense.dto';

@Component({
  selector: 'app-add-vehicle-reading',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
    LinkedVehiclePetroCardComponent,
  ],
  templateUrl: './add-vehicle-reading.component.html',
  styleUrl: './add-vehicle-reading.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddVehicleReadingComponent
  extends FormBase<IVehicleReadingAddUIFormDto>
  implements OnInit
{
  private readonly vehicleReadingService = inject(VehicleReadingService);
  private readonly routerNavigationService = inject(RouterNavigationService);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly linkedUserVehicleDetail =
    signal<ILinkedUserVehicleDetailGetResponseDto | null>(null);

  protected readonly redirectRoute = [
    ROUTE_BASE_PATHS.TRANSPORT,
    ROUTE_BASE_PATHS.VEHICLE_READING,
    ROUTES.VEHICLE_READING.LIST,
  ];

  ngOnInit(): void {
    this.form = this.formService.createForm<IVehicleReadingAddUIFormDto>(
      ADD_VEHICLE_READING_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    // this.loadMockData(ADD_VEHICLE_READING_PREFILLED_DATA);
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeAddVehicleReading(formData);
  }

  private prepareFormData(): IvehicleReadingAddFormDto {
    const formData = this.form.getData();
    return {
      ...formData,
      vehicleName: this.linkedUserVehicleDetail()?.vehicle?.id ?? '',
    };
  }

  private executeAddVehicleReading(formData: IvehicleReadingAddFormDto): void {
    this.loadingService.show({
      title: 'Adding vehicle reading',
      message: "We're adding vehicle reading. This will just take a moment.",
    });
    this.form.disable();

    this.vehicleReadingService
      .addVehicleReading(formData)
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
            'Vehicle reading added successfully'
          );
          const routeSegments = [
            ROUTE_BASE_PATHS.TRANSPORT,
            ROUTE_BASE_PATHS.VEHICLE_READING,
            ROUTES.VEHICLE_READING.LIST,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to add vehicle reading');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm();
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Add Vehicle Reading',
      subtitle: 'Add a new vehicle reading',
    };
  }
}
