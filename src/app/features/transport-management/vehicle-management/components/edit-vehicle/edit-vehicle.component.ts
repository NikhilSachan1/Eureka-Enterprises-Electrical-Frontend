import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FORM_VALIDATION_MESSAGES,
  ROUTE_BASE_PATHS,
  ROUTES,
} from '@shared/constants';
import { IEnhancedForm, IPageHeaderConfig } from '@shared/types';
import { finalize } from 'rxjs';
import { IVehicleEditRequestDto } from '../../types/vehicle.dto';
import { transformDateFormat } from '@shared/utility';
import {
  FormService,
  LoadingService,
  NotificationService,
  RouterNavigationService,
} from '@shared/services';
import { LoggerService } from '@core/services';
import { VehicleService } from '../../services/vehicle.service';
import { ActivatedRoute } from '@angular/router';
import { EDIT_VEHICLE_FORM_CONFIG } from '../../config';
import { IVehicleDetailResolverResponse } from '../../types/vehicle.interface';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ReactiveFormsModule } from '@angular/forms';

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
export class EditVehicleComponent implements OnInit {
  private readonly formService = inject(FormService);
  private readonly logger = inject(LoggerService);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);
  private readonly vehicleService = inject(VehicleService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);

  protected form!: IEnhancedForm;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly isSubmitting = signal(false);
  protected readonly initialVehicleData = signal<Record<
    string,
    unknown
  > | null>(null);

  ngOnInit(): void {
    this.loadVehicleDataFromRoute();
    this.form = this.formService.createForm(EDIT_VEHICLE_FORM_CONFIG, {
      destroyRef: this.destroyRef,
      defaultValues: this.initialVehicleData(),
    });
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
  ): Record<string, unknown> {
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
      fitnessStartDate,
      fitnessEndDate,
      remarks,
    } = vehicleDetailFromResolver;

    return {
      registrationNo,
      vehicleBrand: brand,
      vehicleModel: model,
      mileage,
      fuelType,
      vehiclePurchaseDate: new Date(purchaseDate),
      dealerName,
      insurancePeriod: [
        new Date(insuranceStartDate),
        new Date(insuranceEndDate),
      ],
      pucPeriod: [new Date(pucStartDate), new Date(pucEndDate)],
      fitnessPeriod: [new Date(fitnessStartDate), new Date(fitnessEndDate)],
      remarks,
      vehicleDocuments: preloadedFiles,
    };
  }

  protected onSubmit(): void {
    if (this.isSubmitting() || !this.validateForm()) {
      return;
    }

    const vehicleId = this.activatedRoute.snapshot.params[
      'vehicleId'
    ] as string;
    if (!vehicleId) {
      this.logger.logUserAction('No vehicle id found in route');
      this.notificationService.error(
        FORM_VALIDATION_MESSAGES.SOMETHING_WENT_WRONG
      );
      return;
    }

    const formData = this.prepareFormData();
    this.executeEditVehicle(formData, vehicleId);
  }

  private prepareFormData(): IVehicleEditRequestDto {
    const {
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

  private executeEditVehicle(
    formData: IVehicleEditRequestDto,
    vehicleId: string
  ): void {
    this.isSubmitting.set(true);
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

  private validateForm(): boolean {
    if (!this.form.validateAndMarkTouched()) {
      this.notificationService.validationError(
        FORM_VALIDATION_MESSAGES.FORM_INVALID
      );
      this.logger.warn('Edit vehicle form validation failed');
      return false;
    }
    return true;
  }

  protected onReset(): void {
    try {
      this.logger.logUserAction('Reset Edit Vehicle Form');
      this.form.reset(this.initialVehicleData() ?? {});
    } catch (error) {
      this.logger.error('Error resetting form', error);
    }
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Edit Vehicle',
      subtitle: 'Edit a vehicle',
    };
  }
}
