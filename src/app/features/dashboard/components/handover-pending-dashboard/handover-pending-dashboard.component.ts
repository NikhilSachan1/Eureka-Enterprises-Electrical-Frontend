import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { APP_CONFIG } from '@core/config';
import { APP_PERMISSION } from '@core/constants';
import { AppPermissionService, LoggerService } from '@core/services';
import { AuthService } from '@features/auth-management/services/auth.service';
import { scopeTabQuery } from '@features/dashboard/utils/kpm-dropdown-link.util';
import { AssetService } from '@features/asset-management/services/asset.service';
import { IAssetGetFormDto } from '@features/asset-management/types/asset.dto';
import { VehicleService } from '@features/transport-management/vehicle-management/services/vehicle.service';
import { IvehicleGetFormDto } from '@features/transport-management/vehicle-management/types/vehicle.dto';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { catchError, finalize, map, of } from 'rxjs';

@Component({
  selector: 'app-handover-pending-dashboard',
  imports: [DecimalPipe],
  templateUrl: './handover-pending-dashboard.component.html',
  styleUrl: './handover-pending-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HandoverPendingDashboardComponent implements OnInit {
  private readonly appPermissionService = inject(AppPermissionService);
  private readonly authService = inject(AuthService);
  private readonly assetService = inject(AssetService);
  private readonly vehicleService = inject(VehicleService);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly ICONS = ICONS;
  protected readonly canViewAssetPending =
    this.appPermissionService.hasPermission(
      APP_PERMISSION.UI.ASSET.TAB_PENDING
    );
  protected readonly canViewVehiclePending =
    this.appPermissionService.hasPermission(
      APP_PERMISSION.UI.VEHICLE.TAB_PENDING
    );
  protected readonly title = this.authService.isActiveRoleEmployeeLike()
    ? 'Your pending'
    : 'Handover pending';

  protected readonly assetCount = signal<number | null>(null);
  protected readonly vehicleCount = signal<number | null>(null);
  protected readonly assetLoading = signal(this.canViewAssetPending);
  protected readonly vehicleLoading = signal(this.canViewVehiclePending);

  ngOnInit(): void {
    if (this.canViewAssetPending) {
      this.loadAssetCount();
    }
    if (this.canViewVehiclePending) {
      this.loadVehicleCount();
    }
  }

  protected openAssets(): void {
    void this.router.navigate(
      ['/', ROUTE_BASE_PATHS.ASSET, ROUTES.ASSET.LIST],
      { queryParams: this.pendingTabQuery('asset') }
    );
  }

  protected openVehicles(): void {
    void this.router.navigate(
      [
        '/',
        ROUTE_BASE_PATHS.TRANSPORT,
        ROUTE_BASE_PATHS.VEHICLE,
        ROUTES.VEHICLE.LIST,
      ],
      { queryParams: this.pendingTabQuery('vehicle') }
    );
  }

  private loadAssetCount(): void {
    const loggedInUserId = this.authService.getCurrentUser()?.userId;
    const params: IAssetGetFormDto = {
      page: 1,
      pageSize: 1,
      assetStatus: 'INITIATED',
    };

    if (this.authService.isActiveRoleEmployeeLike() && loggedInUserId) {
      params.handoverToUser = loggedInUserId;
    }

    this.assetService
      .getAssetList(params)
      .pipe(
        map(response => response.totalRecords),
        catchError(error => {
          this.logger.logUserAction(
            'Failed to load pending asset count',
            error
          );
          return of(0);
        }),
        finalize(() => this.assetLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(count => this.assetCount.set(count));
  }

  private loadVehicleCount(): void {
    const loggedInUserId = this.authService.getCurrentUser()?.userId;
    const params: IvehicleGetFormDto = {
      page: 1,
      pageSize: 1,
      vehicleStatus: 'INITIATED',
    };

    if (this.authService.isActiveRoleEmployeeLike() && loggedInUserId) {
      params.handoverToUser = loggedInUserId;
    }

    this.vehicleService
      .getVehicleList(params)
      .pipe(
        map(response => response.totalRecords),
        catchError(error => {
          this.logger.logUserAction(
            'Failed to load pending vehicle count',
            error
          );
          return of(0);
        }),
        finalize(() => this.vehicleLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(count => this.vehicleCount.set(count));
  }

  private pendingTabQuery(
    kind: 'asset' | 'vehicle'
  ): { tab: string } | undefined {
    const permissions =
      kind === 'asset' ? APP_PERMISSION.UI.ASSET : APP_PERMISSION.UI.VEHICLE;

    return scopeTabQuery(
      permission => this.appPermissionService.hasPermission(permission),
      permissions,
      'PENDING'
    );
  }
}
