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
import { ActivatedRoute } from '@angular/router';
import {
  IvehicleReadingEditFormDto,
  IVehicleReadingEditUIFormDto,
} from '../../types/vehicle-reading.dto';
import { EDIT_VEHICLE_READING_FORM_CONFIG } from '../../config/form/edit-vehicle-reading.config';
import { IVehicleReadingDetailResolverResponse } from '../../types/vehicle-reading.interface';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IPageHeaderConfig } from '@shared/types';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { LinkedVehiclePetroCardComponent } from '@features/transport-management/fuel-expense-management/shared/linked-vehicle-petro-card/linked-vehicle-petro-card.component';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ILinkedUserVehicleDetailGetResponseDto } from '@features/transport-management/fuel-expense-management/types/fuel-expense.dto';

@Component({
  selector: 'app-edit-vehicle-reading',
  imports: [
    PageHeaderComponent,
    LinkedVehiclePetroCardComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-vehicle-reading.component.html',
  styleUrl: './edit-vehicle-reading.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditVehicleReadingComponent
  extends FormBase<IVehicleReadingEditUIFormDto>
  implements OnInit
{
  private readonly vehicleReadingService = inject(VehicleReadingService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly initialVehicleReadingData =
    signal<IVehicleReadingEditUIFormDto | null>(null);
  protected readonly linkedUserVehicleDetail =
    signal<ILinkedUserVehicleDetailGetResponseDto | null>(null);

  ngOnInit(): void {
    this.loadVehicleReadingDataFromRoute();

    this.form = this.formService.createForm<IVehicleReadingEditUIFormDto>(
      EDIT_VEHICLE_READING_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
        defaultValues: this.initialVehicleReadingData(),
      }
    );
  }

  private loadVehicleReadingDataFromRoute(): void {
    const vehicleReadingDetailFromResolver = this.activatedRoute.snapshot.data[
      'vehicleReadingDetail'
    ] as IVehicleReadingDetailResolverResponse | null;

    if (!vehicleReadingDetailFromResolver) {
      this.logger.logUserAction('No vehicle reading data found in route');
      const routeSegments = [
        ROUTE_BASE_PATHS.TRANSPORT,
        ROUTE_BASE_PATHS.VEHICLE_READING,
        ROUTES.VEHICLE_READING.LIST,
      ];
      void this.routerNavigationService.navigateToRoute(routeSegments);
      return;
    }

    const prefilledVehicleReadingData = this.preparePrefilledFormData(
      vehicleReadingDetailFromResolver
    );
    this.linkedUserVehicleDetail.set({
      vehicle: vehicleReadingDetailFromResolver.vehicle,
      card: null,
    });
    this.initialVehicleReadingData.set(prefilledVehicleReadingData);
  }

  private preparePrefilledFormData(
    vehicleReadingDetailFromResolver: IVehicleReadingDetailResolverResponse
  ): IVehicleReadingEditUIFormDto {
    const {
      logDate,
      startTime,
      startOdometerReading,
      startLocation,
      endOdometerReading,
      endTime,
      endLocation,
      driverRemarks,
      preloadedStartOdometerFiles,
      preloadedEndOdometerFiles,
    } = vehicleReadingDetailFromResolver;
    return {
      readingDate: this.parseDateString(logDate),
      startTime: this.parseTimeString(logDate, startTime),
      startOdometerReading: Number(startOdometerReading),
      startLocation,
      endOdometerReading: Number(endOdometerReading),
      endTime: this.parseTimeString(logDate, endTime),
      endLocation,
      remarks: driverRemarks,
      startOdometerReadingAttachments: preloadedStartOdometerFiles ?? [],
      endOdometerReadingAttachments: preloadedEndOdometerFiles ?? [],
    };
  }

  private parseDateString(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private parseTimeString(
    dateString: string,
    timeString: string | null
  ): Date | null {
    if (!timeString) {
      return null;
    }
    const [year, month, day] = dateString.split('-').map(Number);
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds || 0);
  }

  protected override handleSubmit(): void {
    const vehicleReadingId = this.activatedRoute.snapshot.params[
      'vehicleReadingId'
    ] as string;
    if (!vehicleReadingId) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeEditVehicleReading(formData, vehicleReadingId);
  }

  private prepareFormData(): IvehicleReadingEditFormDto {
    const formData = this.form.getData();
    return formData;
  }

  private executeEditVehicleReading(
    formData: IvehicleReadingEditFormDto,
    vehicleReadingId: string
  ): void {
    this.loadingService.show({
      title: 'Edit Vehicle Reading',
      message: 'Please wait while we edit vehicle reading...',
    });
    this.form.disable();

    this.vehicleReadingService
      .editVehicleReading(formData, vehicleReadingId)
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
            'Vehicle reading updated successfully'
          );
          const routeSegments = [
            ROUTE_BASE_PATHS.TRANSPORT,
            ROUTE_BASE_PATHS.VEHICLE_READING,
            ROUTES.VEHICLE_READING.LIST,
          ];
          void this.routerNavigationService.navigateToRoute(routeSegments);
        },
        error: () => {
          this.notificationService.error('Failed to update vehicle reading');
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm(this.initialVehicleReadingData() ?? {});
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Edit Vehicle Reading',
      subtitle: 'Edit a vehicle reading',
    };
  }
}
