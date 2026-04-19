import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormBase } from '@shared/base/form.base';
import { RouterNavigationService } from '@shared/services';
import { VehicleReadingService } from '../../services/vehicle-reading.service';
import {
  IvehicleReadingForceFormDto,
  IVehicleReadingForceUIFormDto,
} from '../../types/vehicle-reading.dto';
import { ILinkedUserVehicleDetailGetResponseDto } from '@features/transport-management/fuel-expense-management/types/fuel-expense.dto';
import { FORCE_VEHICLE_READING_FORM_CONFIG } from '../../config';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { IPageHeaderConfig, ITrackedFields } from '@shared/types';
import { InputFieldComponent } from '@shared/components/input-field/input-field.component';
import { ButtonComponent } from '@shared/components/button/button.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LinkedVehiclePetroCardComponent } from '@features/transport-management/fuel-expense-management/shared/linked-vehicle-petro-card/linked-vehicle-petro-card.component';

@Component({
  selector: 'app-force-vehicle-reading',
  imports: [
    PageHeaderComponent,
    InputFieldComponent,
    ButtonComponent,
    ReactiveFormsModule,
    LinkedVehiclePetroCardComponent,
  ],
  templateUrl: './force-vehicle-reading.component.html',
  styleUrl: './force-vehicle-reading.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForceVehicleReadingComponent
  extends FormBase<IVehicleReadingForceUIFormDto>
  implements OnInit
{
  private readonly vehicleReadingService = inject(VehicleReadingService);
  private readonly routerNavigationService = inject(RouterNavigationService);

  private trackedVehicleReadingFields!: ITrackedFields<IVehicleReadingForceUIFormDto>;

  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected readonly linkedUserVehicleDetail =
    signal<ILinkedUserVehicleDetailGetResponseDto | null>(null);

  protected readonly selectedEmployeeName = computed(() => {
    const empName = this.trackedVehicleReadingFields?.employeeName?.();
    return empName && typeof empName === 'string' ? empName : null;
  });

  protected readonly showRemainingForceVehicleReadingFields = computed(() => {
    const emp = this.selectedEmployeeName();
    if (!emp) {
      return true;
    }
    const detail = this.linkedUserVehicleDetail();
    return !!(detail?.vehicle && Object.keys(detail.vehicle).length > 0);
  });

  ngOnInit(): void {
    this.form = this.formService.createForm<IVehicleReadingForceUIFormDto>(
      FORCE_VEHICLE_READING_FORM_CONFIG,
      {
        destroyRef: this.destroyRef,
      }
    );

    const trackedFields: (keyof IVehicleReadingForceUIFormDto)[] = [
      'employeeName',
    ];

    this.trackedVehicleReadingFields =
      this.formService.trackMultipleFieldChanges<IVehicleReadingForceUIFormDto>(
        this.form.formGroup,
        trackedFields,
        this.destroyRef
      );
  }

  protected override handleSubmit(): void {
    const formData = this.prepareFormData();
    this.executeForceVehicleReading(formData);
  }

  private prepareFormData(): IvehicleReadingForceFormDto {
    const formData = this.form.getData();
    return {
      ...formData,
      vehicleName: this.linkedUserVehicleDetail()?.vehicle?.id ?? '',
    };
  }

  private executeForceVehicleReading(
    formData: IvehicleReadingForceFormDto
  ): void {
    const detail = this.linkedUserVehicleDetail();
    const hasValidVehicle =
      detail?.vehicle && Object.keys(detail.vehicle).length > 0;
    if (!hasValidVehicle) {
      this.notificationService.error('No vehicle linked for this employee.');
      return;
    }

    this.loadingService.show({
      title: 'Recording vehicle reading',
      message: "We're recording the reading. This will just take a moment.",
    });
    this.form.disable();

    this.vehicleReadingService
      .forceVehicleReading(formData)
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
            'Force vehicle reading applied successfully'
          );
          void this.routerNavigationService.navigateToRoute([
            ROUTE_BASE_PATHS.TRANSPORT,
            ROUTE_BASE_PATHS.VEHICLE_READING,
            ROUTES.VEHICLE_READING.LIST,
          ]);
        },
        error: () => {
          this.notificationService.error(
            'Failed to apply force vehicle reading'
          );
        },
      });
  }

  protected onReset(): void {
    this.onResetSingleForm();
  }

  private getPageHeaderConfig(): Partial<IPageHeaderConfig> {
    return {
      title: 'Force Vehicle Reading',
      subtitle: 'Record a vehicle reading on behalf of an employee',
    };
  }
}
