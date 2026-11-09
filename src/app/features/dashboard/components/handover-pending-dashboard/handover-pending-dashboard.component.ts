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
import { AppPermissionService, LoggerService } from '@core/services';
import { AuthService } from '@features/auth-management/services/auth.service';
import { AssetService } from '@features/asset-management/services/asset.service';
import { IAssetGetFormDto } from '@features/asset-management/types/asset.dto';
import { VehicleService } from '@features/transport-management/vehicle-management/services/vehicle.service';
import { IvehicleGetFormDto } from '@features/transport-management/vehicle-management/types/vehicle.dto';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import {
  canRespondToReturns,
  canSeeHandoverScopeTab,
  handoverScopeTabQuery,
} from '@shared/utility';
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
  private readonly hasPermission = (permission: string): boolean =>
    this.appPermissionService.hasPermission(permission);

  /** Office staff who may answer a return to office; returns wait on them. */
  private readonly respondsToAssetReturns = canRespondToReturns(
    'asset',
    this.hasPermission
  );
  private readonly respondsToVehicleReturns = canRespondToReturns(
    'vehicle',
    this.hasPermission
  );

  protected readonly canViewAssetPending = canSeeHandoverScopeTab(
    'asset',
    'PENDING',
    this.hasPermission
  );
  protected readonly canViewVehiclePending = canSeeHandoverScopeTab(
    'vehicle',
    'PENDING',
    this.hasPermission
  );
  protected readonly title = 'Your pending';

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

    if (loggedInUserId) {
      params.handoverToUser = loggedInUserId;
    }
    if (this.respondsToAssetReturns) {
      params.includePendingReturns = true;
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

    if (loggedInUserId) {
      params.handoverToUser = loggedInUserId;
    }
    if (this.respondsToVehicleReturns) {
      params.includePendingReturns = true;
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

  /** Same tab index the list computes, so the link lands on the pending tab. */
  private pendingTabQuery(
    kind: 'asset' | 'vehicle'
  ): { tab: string } | undefined {
    return handoverScopeTabQuery(kind, 'PENDING', this.hasPermission);
  }
}
