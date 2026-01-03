import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { EnvironmentService, LoggerService } from '@core/services';
import {
  FormService,
  LoadingService,
  NotificationService,
  RouterNavigationService,
} from '@shared/services';
import { VehicleService } from '../../services/vehicle.service';
import { IEnhancedForm, IPageHeaderConfig } from '@shared/types';
import { ADD_VEHICLE_FORM_CONFIG } from '../../config';
import { IVehicleAddRequestDto } from '../../types/vehicle.dto';
import { transformDateFormat } from '@shared/utility';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FORM_VALIDATION_MESSAGES,
  ROUTE_BASE_PATHS,
  ROUTES,
} from '@shared/constants';
import { ADD_VEHICLE_PREFILLED_DATA } from '@shared/mock-data/add-vehicle.mock-data';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ReactiveFormsModule } from '@angular/forms';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';

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
export class AddVehicleComponent implements OnInit {
  private readonly formService = inject(FormService);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);
  private readonly vehicleService = inject(VehicleService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly environmentService = inject(EnvironmentService);

  protected form!: IEnhancedForm;
  protected readonly initialVehicleData = signal<Record<
    string,
    unknown
  > | null>(null);

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly isSubmitting = signal(false);

  ngOnInit(): void {
    this.loadMockData();
    this.form = this.formService.createForm(ADD_VEHICLE_FORM_CONFIG, {
      destroyRef: this.destroyRef,
      defaultValues: this.initialVehicleData(),
    });
  }

  protected onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const formData = this.prepareFormData();
    this.executeAddVehicle(formData);
  }

  private prepareFormData(): IVehicleAddRequestDto {
    const {
      registrationNo,
      vehicleBrand,
      vehicleModel,
      mileage,
      fuelType,
      vehiclePurchaseDate,
      dealerName,
      insurancePeriod,
      pucPeriod,
      fitnessPeriod,
      vehicleDocuments,
      remarks,
    } = this.form.getData() as {
      registrationNo: string;
      vehicleBrand: string;
      vehicleModel: string;
      mileage: string;
      fuelType: string;
      vehiclePurchaseDate: Date;
      dealerName: string;
      insurancePeriod: Date[];
      pucPeriod: Date[];
      fitnessPeriod: Date[];
      vehicleDocuments: File[];
      remarks: string;
    };

    const [insuranceStartDate, insuranceEndDate] = insurancePeriod ?? [];
    const [pucStartDate, pucEndDate] = pucPeriod ?? [];
    const [fitnessStartDate, fitnessEndDate] = fitnessPeriod ?? [];

    return {
      registrationNo,
      brand: vehicleBrand,
      model: vehicleModel,
      mileage,
      fuelType,
      purchaseDate: transformDateFormat(vehiclePurchaseDate),
      dealerName,
      insuranceStartDate: transformDateFormat(insuranceStartDate),
      insuranceEndDate: transformDateFormat(insuranceEndDate),
      pucStartDate: transformDateFormat(pucStartDate),
      pucEndDate: transformDateFormat(pucEndDate),
      fitnessStartDate: transformDateFormat(fitnessStartDate),
      fitnessEndDate: transformDateFormat(fitnessEndDate),
      remarks,
      vehicleFiles: vehicleDocuments,
    };
  }

  private executeAddVehicle(formData: IVehicleAddRequestDto): void {
    this.isSubmitting.set(true);
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

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      this.logger.warn('Add vehicle form validation failed');
      return false;
    }
    return true;
  }

  protected onReset(): void {
    try {
      this.logger.logUserAction('Reset Add Vehicle Form');
      this.form.reset();
    } catch (error) {
      this.logger.error('Error resetting form', error);
    }
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Add Vehicle',
      subtitle: 'Add a new vehicle',
    };
  }

  private loadMockData(): void {
    if (this.environmentService.isTestDataEnabled) {
      this.initialVehicleData.set(ADD_VEHICLE_PREFILLED_DATA);
    }
  }
}
