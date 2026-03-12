import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  model,
  OnInit,
  output,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ICONS } from '@shared/constants';
import {
  LoadingService,
  NotificationService,
  RouterNavigationService,
} from '@shared/services';
import { FuelExpenseService } from '../../services/fuel-expense.service';
import {
  ILinkedUserVehicleDetailGetFormDto,
  ILinkedUserVehicleDetailGetResponseDto,
} from '../../types/fuel-expense.dto';

@Component({
  selector: 'app-linked-vehicle-petro-card',
  standalone: true,
  templateUrl: './linked-vehicle-petro-card.component.html',
  styleUrl: './linked-vehicle-petro-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkedVehiclePetroCardComponent implements OnInit {
  private readonly fuelExpenseService = inject(FuelExpenseService);
  private readonly loadingService = inject(LoadingService);
  private readonly notificationService = inject(NotificationService);
  private readonly routerNavigationService = inject(RouterNavigationService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  ALL_ICONS = ICONS;

  // Two-way bindable model for linked vehicle detail
  linkedUserVehicleDetail =
    model<ILinkedUserVehicleDetailGetResponseDto | null>(null);

  // Input: Employee name to trigger API fetch (for force fuel expense)
  employeeName = input<string | null>(null);

  // Input: Route resolver data key to load from (for add fuel expense)
  routeDataKey = input<string | null>(null);

  // Input: Route segments to redirect when no valid vehicle found
  redirectRoute = input<string[] | null>(null);
  showCard = input<boolean>(true);

  // Output: Emit when redirect happens due to invalid data
  redirected = output<void>();

  private previousEmployeeName: string | null = null;

  constructor() {
    // Watch for employeeName changes and fetch data via API
    effect(() => {
      const empName = this.employeeName();
      if (empName && typeof empName === 'string') {
        this.loadLinkedUserVehicleDetailFromApi(empName);
        this.previousEmployeeName = empName;
      } else if (this.previousEmployeeName && !empName) {
        this.linkedUserVehicleDetail.set(null);
        this.previousEmployeeName = null;
      }
    });
  }

  ngOnInit(): void {
    // Load from route resolver if routeDataKey is provided
    const dataKey = this.routeDataKey();
    if (dataKey) {
      this.loadLinkedUserVehicleDetailFromRoute(dataKey);
    }
  }

  /**
   * Load linked vehicle detail from route resolver data
   */
  private loadLinkedUserVehicleDetailFromRoute(dataKey: string): void {
    const resolverData = this.activatedRoute.snapshot.data[
      dataKey
    ] as ILinkedUserVehicleDetailGetResponseDto;

    const hasValidVehicle = this.hasValidVehicle(resolverData);

    if (!resolverData || !hasValidVehicle) {
      this.handleInvalidVehicleData();
      return;
    }

    this.linkedUserVehicleDetail.set(resolverData);
  }

  /**
   * Load linked vehicle detail via API call
   */
  private loadLinkedUserVehicleDetailFromApi(employeeName: string): void {
    this.loadingService.show({
      title: 'Loading Linked Vehicle Detail',
      message: 'Please wait while we load the linked vehicle detail...',
    });

    const paramData: ILinkedUserVehicleDetailGetFormDto = { employeeName };

    this.fuelExpenseService
      .getLinkedUserVehicleDetail(paramData)
      .pipe(
        finalize(() => {
          this.loadingService.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: ILinkedUserVehicleDetailGetResponseDto) => {
          if (!this.hasValidVehicle(response)) {
            this.linkedUserVehicleDetail.set(null);
            this.notificationService.error(
              'No vehicle linked for this employee.'
            );
            return;
          }

          this.linkedUserVehicleDetail.set(response);
        },
        error: () => {
          this.linkedUserVehicleDetail.set(null);
          this.notificationService.error(
            'Failed to load linked vehicle detail.'
          );
        },
      });
  }

  /**
   * Handle invalid vehicle data - show warning and redirect if route provided
   */
  private handleInvalidVehicleData(): void {
    const redirectRoute = this.redirectRoute();

    if (redirectRoute && redirectRoute.length > 0) {
      this.notificationService.warning(
        'No vehicle linked for this route. Redirecting...'
      );
      this.redirected.emit();
      void this.routerNavigationService.navigateToRoute(redirectRoute);
    } else {
      this.notificationService.warning('No vehicle linked.');
    }

    this.linkedUserVehicleDetail.set(null);
  }

  /**
   * Check if response has valid vehicle data
   */
  private hasValidVehicle(
    data: ILinkedUserVehicleDetailGetResponseDto | null
  ): boolean {
    return !!(data?.vehicle && Object.keys(data.vehicle).length > 0);
  }
}
