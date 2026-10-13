import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { CurrencyPipe, DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { APP_CONFIG } from '@core/config';
import { APP_PERMISSION } from '@core/constants';
import { ICONS, ROUTE_BASE_PATHS, ROUTES } from '@shared/constants';
import { AppPermissionService, LoggerService } from '@core/services';
import { AppConfigurationService } from '@shared/services';
import { DashboardService } from '@features/dashboard/services/dashboard.services';
import {
  IApprovalPendingDashboardGetResponseDto,
  IAssetFleetAlertsDashboardGetResponseDto,
  ILedgerBalanceDashboardGetResponseDto,
  IVehicleReadingsAlertsDashboardGetResponseDto,
} from '@features/dashboard/types/dashboard.dto';
import { EKpmDashboardSeverity } from '@features/dashboard/types/dashboard.enum';
import { EApprovalStatus, EDataType } from '@shared/types';
import {
  IDashboardKpmMetricLink,
  IDashboardKpmMetricRow,
} from '@features/dashboard/types/dashboard.interface';
import {
  pickDropdownValue,
  scopeTabQuery,
  statusFilterQuery,
} from '@features/dashboard/utils/kpm-dropdown-link.util';

@Component({
  selector: 'app-kpm-dashboard',
  imports: [CurrencyPipe, DecimalPipe, NgTemplateOutlet],
  templateUrl: './kpm-dashboard.component.html',
  styleUrl: './kpm-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpmDashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(LoggerService);
  private readonly router = inject(Router);

  /** Asks the dashboard page to scroll to a section it owns. */
  readonly scrollToSection = output<string>();
  private readonly appConfigurationService = inject(AppConfigurationService);
  private readonly appPermissionService = inject(AppPermissionService);

  protected readonly canViewAssetCompliance =
    this.appPermissionService.hasPermission(
      APP_PERMISSION.DASHBOARD.ASSET_COMPLIANCE
    );
  protected readonly canViewVehicleCompliance =
    this.appPermissionService.hasPermission(
      APP_PERMISSION.DASHBOARD.VEHICLE_COMPLIANCE
    );

  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly ICONS = ICONS;
  protected readonly KpmRowState = EKpmDashboardSeverity;

  private readonly approvalPending =
    signal<IApprovalPendingDashboardGetResponseDto | null>(null);
  private readonly ledgerBalance =
    signal<ILedgerBalanceDashboardGetResponseDto | null>(null);
  private readonly assetFleetAlerts =
    signal<IAssetFleetAlertsDashboardGetResponseDto | null>(null);
  private readonly vehicleReadingsAlerts =
    signal<IVehicleReadingsAlertsDashboardGetResponseDto | null>(null);

  /** One flag per parallel KPM API; cleared in `finalize` so error paths also stop loading. */
  private readonly approvalPendingLoading = signal(true);
  private readonly ledgerBalanceLoading = signal(true);
  private readonly assetFleetAlertsLoading = signal(true);
  private readonly vehicleReadingsAlertsLoading = signal(true);

  protected readonly approvalPendingRows = computed<IDashboardKpmMetricRow[]>(
    () =>
      this.buildApprovalPending(
        this.approvalPending(),
        this.approvalPendingLoading()
      )
  );
  protected readonly ledgerBalanceRows = computed<IDashboardKpmMetricRow[]>(
    () =>
      this.buildLedgerBalance(this.ledgerBalance(), this.ledgerBalanceLoading())
  );
  protected readonly assetAlertsRows = computed<IDashboardKpmMetricRow[]>(() =>
    this.buildAssetAlerts(
      this.assetFleetAlerts(),
      this.assetFleetAlertsLoading()
    )
  );
  protected readonly vehicleAlertsRows = computed<IDashboardKpmMetricRow[]>(
    () =>
      this.buildVehicleAlerts(
        this.assetFleetAlerts(),
        this.vehicleReadingsAlerts(),
        this.assetFleetAlertsLoading(),
        this.vehicleReadingsAlertsLoading()
      )
  );

  ngOnInit(): void {
    this.loadApprovalPending();
    this.loadLedgerBalance();
    if (this.canViewAssetCompliance || this.canViewVehicleCompliance) {
      this.loadAssetFleetAlerts();
    } else {
      this.assetFleetAlertsLoading.set(false);
    }
    if (this.canViewVehicleCompliance) {
      this.loadVehicleReadingsAlerts();
    } else {
      this.vehicleReadingsAlertsLoading.set(false);
    }
  }

  protected openMetric(row: IDashboardKpmMetricRow): void {
    if (!row.link || row.valueLoading) {
      return;
    }

    if (row.link.scrollToId) {
      this.scrollToSection.emit(row.link.scrollToId);
      return;
    }

    if (!row.link.commands?.length) {
      return;
    }

    void this.router.navigate([...row.link.commands], {
      queryParams: row.link.queryParams,
    });
  }

  private pendingQuery(): Record<string, string[]> {
    return { approvalStatus: [EApprovalStatus.PENDING] };
  }

  private linkTo(
    commands: readonly string[],
    queryParams?: Record<string, string | readonly string[]>
  ): IDashboardKpmMetricLink {
    return queryParams ? { commands, queryParams } : { commands };
  }

  private ledgerSpendLink(): IDashboardKpmMetricLink | undefined {
    if (
      !this.appPermissionService.hasPermission(
        APP_PERMISSION.UI.DASHBOARD.LEDGER_SPEND
      )
    ) {
      return undefined;
    }

    return { scrollToId: 'ledger-spend' };
  }

  private assetLink(
    field: string,
    status: string | undefined
  ): IDashboardKpmMetricLink {
    return this.linkTo(
      ['/', ROUTE_BASE_PATHS.ASSET, ROUTES.ASSET.LIST],
      this.withAllTabQuery('asset', statusFilterQuery(field, status))
    );
  }

  private vehicleLink(
    field: string,
    status: string | undefined
  ): IDashboardKpmMetricLink {
    return this.linkTo(
      [
        '/',
        ROUTE_BASE_PATHS.TRANSPORT,
        ROUTE_BASE_PATHS.VEHICLE,
        ROUTES.VEHICLE.LIST,
      ],
      this.withAllTabQuery('vehicle', statusFilterQuery(field, status))
    );
  }

  /** Compliance rows open the All tab, not My Assets / My Vehicles. */
  private withAllTabQuery(
    kind: 'asset' | 'vehicle',
    statusQuery: Record<string, string[]> | undefined
  ): Record<string, string | readonly string[]> | undefined {
    const permissions =
      kind === 'asset' ? APP_PERMISSION.UI.ASSET : APP_PERMISSION.UI.VEHICLE;
    const queryParams = {
      ...(statusQuery ?? {}),
      ...(scopeTabQuery(
        permission => this.appPermissionService.hasPermission(permission),
        permissions,
        'ALL'
      ) ?? {}),
    };

    return Object.keys(queryParams).length > 0 ? queryParams : undefined;
  }

  private loadApprovalPending(): void {
    this.dashboardService
      .getApprovalPending()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.approvalPendingLoading.set(false))
      )
      .subscribe({
        next: (response: IApprovalPendingDashboardGetResponseDto) => {
          this.approvalPending.set(response);
          this.logger.logUserAction('Approval pending loaded successfully');
        },
        error: error => {
          this.logger.logUserAction('Failed to load approval pending', error);
        },
      });
  }

  private loadLedgerBalance(): void {
    this.dashboardService
      .getLedgerBalanceShared()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.ledgerBalanceLoading.set(false))
      )
      .subscribe({
        next: (response: ILedgerBalanceDashboardGetResponseDto) => {
          this.ledgerBalance.set(response);
          this.logger.logUserAction('Ledger balance loaded successfully');
        },
        error: error => {
          this.logger.logUserAction('Failed to load ledger balance', error);
        },
      });
  }

  private loadAssetFleetAlerts(): void {
    this.dashboardService
      .getAssetFleetAlertsShared()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.assetFleetAlertsLoading.set(false))
      )
      .subscribe({
        next: (response: IAssetFleetAlertsDashboardGetResponseDto) => {
          this.assetFleetAlerts.set(response);
          this.logger.logUserAction('Asset fleet alerts loaded successfully');
        },
        error: error => {
          this.logger.logUserAction('Failed to load asset fleet alerts', error);
        },
      });
  }

  private loadVehicleReadingsAlerts(): void {
    this.dashboardService
      .getVehicleReadingsAlerts()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.vehicleReadingsAlertsLoading.set(false))
      )
      .subscribe({
        next: (response: IVehicleReadingsAlertsDashboardGetResponseDto) => {
          this.vehicleReadingsAlerts.set(response);
          this.logger.logUserAction(
            'Vehicle readings alerts loaded successfully'
          );
        },
        error: error => {
          this.logger.logUserAction(
            'Failed to load vehicle readings alerts',
            error
          );
        },
      });
  }

  private buildApprovalPending(
    data: IApprovalPendingDashboardGetResponseDto | null,
    valueLoading: boolean
  ): IDashboardKpmMetricRow[] {
    const pending = (key: string): number =>
      data?.queues?.find(queue => queue.key === key)?.pending ?? 0;
    const sev = (value: number): EKpmDashboardSeverity =>
      value > 0 ? EKpmDashboardSeverity.WARN : EKpmDashboardSeverity.NORMAL;

    return [
      {
        icon: ICONS.ATTENDANCE.CHECK_IN,
        label: 'Attendance approvals',
        hint: 'Check-ins, regularisation, or corrections awaiting approval',
        value: pending('attendance'),
        format: EDataType.NUMBER,
        state: sev(pending('attendance')),
        valueLoading,
        link: this.linkTo(
          ['/', ROUTE_BASE_PATHS.ATTENDANCE, ROUTES.ATTENDANCE.LIST],
          this.pendingQuery()
        ),
      },
      {
        icon: ICONS.LEAVE.CALENDAR_PLUS,
        label: 'Leave approvals',
        hint: 'Leave requests still in the approval workflow',
        value: pending('leave'),
        format: EDataType.NUMBER,
        state: sev(pending('leave')),
        valueLoading,
        link: this.linkTo(
          ['/', ROUTE_BASE_PATHS.LEAVE, ROUTES.LEAVE.LIST],
          this.pendingQuery()
        ),
      },
      {
        icon: ICONS.EXPENSE.MONEY,
        label: 'Expense approvals',
        hint: 'Submitted expense claims not yet approved or rejected',
        value: pending('expense'),
        format: EDataType.NUMBER,
        state: sev(pending('expense')),
        valueLoading,
        link: this.linkTo(
          ['/', ROUTE_BASE_PATHS.EXPENSE, ROUTES.EXPENSE.LEDGER],
          this.pendingQuery()
        ),
      },
      {
        icon: ICONS.EXPENSE.CAR,
        label: 'Fuel expense approvals',
        hint: 'Vehicle fuel entries pending approval',
        value: pending('fuel'),
        format: EDataType.NUMBER,
        state: sev(pending('fuel')),
        valueLoading,
        link: this.linkTo(
          [
            '/',
            ROUTE_BASE_PATHS.TRANSPORT,
            ROUTE_BASE_PATHS.FUEL,
            ROUTES.FUEL.LEDGER,
          ],
          this.pendingQuery()
        ),
      },
    ];
  }

  private buildLedgerBalance(
    data: ILedgerBalanceDashboardGetResponseDto | null,
    valueLoading: boolean
  ): IDashboardKpmMetricRow[] {
    const { expense, fuel } = data ?? {};
    const { payable, overpaid } = expense ?? {};
    const { payable: fuelPayable, overpaid: fuelOverpaid } = fuel ?? {};
    const sevPayable = (value: number): EKpmDashboardSeverity =>
      value > 0 ? EKpmDashboardSeverity.ALERT : EKpmDashboardSeverity.NORMAL;
    const sevRecover = (value: number): EKpmDashboardSeverity =>
      value > 0 ? EKpmDashboardSeverity.SUCCESS : EKpmDashboardSeverity.NORMAL;

    return [
      {
        icon: ICONS.EXPENSE.MONEY,
        label: 'Expense payable',
        hint: 'Approved expense amounts still to be paid out to staff',
        value: payable?.totalAmount ?? 0,
        format: EDataType.CURRENCY,
        state: sevPayable(payable?.totalAmount ?? 0),
        valueLoading,
        link: this.ledgerSpendLink(),
      },
      {
        icon: ICONS.COMMON.ARROW_DOWN,
        label: 'Expense receivable',
        hint: 'Net to recover from employees (advances or overpayments)',
        value: overpaid?.totalAmount ?? 0,
        format: EDataType.CURRENCY,
        state: sevRecover(overpaid?.totalAmount ?? 0),
        valueLoading,
        link: this.ledgerSpendLink(),
      },
      {
        icon: ICONS.FUEL.MENU,
        label: 'Fuel payable',
        hint: 'Approved fuel ledger amounts still to be reimbursed',
        value: fuelPayable?.totalAmount ?? 0,
        format: EDataType.CURRENCY,
        state: sevPayable(fuelPayable?.totalAmount ?? 0),
        valueLoading,
        link: this.ledgerSpendLink(),
      },
      {
        icon: ICONS.COMMON.ARROW_DOWN,
        label: 'Fuel receivable',
        hint: 'Net fuel advances or overpayments to recover from staff',
        value: fuelOverpaid?.totalAmount ?? 0,
        format: EDataType.CURRENCY,
        state: sevRecover(fuelOverpaid?.totalAmount ?? 0),
        valueLoading,
        link: this.ledgerSpendLink(),
      },
    ];
  }

  private buildAssetAlerts(
    data: IAssetFleetAlertsDashboardGetResponseDto | null,
    valueLoading: boolean
  ): IDashboardKpmMetricRow[] {
    const { counts } = data ?? {};
    const { assetCalibration, assetWarranty } = counts ?? {};
    const {
      dueSoon: assetCalibrationDueSoon,
      overdue: assetCalibrationOverdue,
    } = assetCalibration ?? {};
    const {
      expired: assetWarrantyExpired,
      expiringSoon: assetWarrantyExpiringSoon,
    } = assetWarranty ?? {};
    const sev = (value: number, alert: boolean): EKpmDashboardSeverity => {
      if (value <= 0) {
        return EKpmDashboardSeverity.NORMAL;
      }
      return alert ? EKpmDashboardSeverity.ALERT : EKpmDashboardSeverity.WARN;
    };

    return [
      {
        icon: ICONS.SETTINGS.WRENCH,
        label: 'Calibration — due soon',
        hint: 'Assets approaching their scheduled calibration date',
        value: assetCalibrationDueSoon ?? 0,
        format: EDataType.NUMBER,
        state: sev(assetCalibrationDueSoon ?? 0, false),
        valueLoading,
        link: this.assetLink(
          'assetCalibrationStatus',
          pickDropdownValue(
            this.appConfigurationService.assetCalibrationStatuses(),
            'soon'
          )
        ),
      },
      {
        icon: ICONS.STATUS.EXPIRED,
        label: 'Calibration — overdue',
        hint: 'Past the calibration due date — follow up required',
        value: assetCalibrationOverdue ?? 0,
        format: EDataType.NUMBER,
        state: sev(assetCalibrationOverdue ?? 0, false),
        valueLoading,
        link: this.assetLink(
          'assetCalibrationStatus',
          pickDropdownValue(
            this.appConfigurationService.assetCalibrationStatuses(),
            'expired'
          )
        ),
      },
      {
        icon: ICONS.SECURITY.SHIELD,
        label: 'Warranty — expiring soon',
        hint: 'Warranty coverage ending within the configured window',
        value: assetWarrantyExpiringSoon ?? 0,
        format: EDataType.NUMBER,
        state: sev(assetWarrantyExpiringSoon ?? 0, false),
        valueLoading,
        link: this.assetLink(
          'assetWarrantyStatus',
          pickDropdownValue(
            this.appConfigurationService.assetWarrantyStatuses(),
            'soon'
          )
        ),
      },
      {
        icon: ICONS.STATUS.EXPIRED,
        label: 'Warranty — lapsed',
        hint: 'Warranty no longer in effect or past validity',
        value: assetWarrantyExpired ?? 0,
        format: EDataType.NUMBER,
        state: sev(assetWarrantyExpired ?? 0, false),
        valueLoading,
        link: this.assetLink(
          'assetWarrantyStatus',
          pickDropdownValue(
            this.appConfigurationService.assetWarrantyStatuses(),
            'expired'
          )
        ),
      },
    ];
  }

  private buildVehicleAlerts(
    data: IAssetFleetAlertsDashboardGetResponseDto | null,
    vehicleReadingsAlerts: IVehicleReadingsAlertsDashboardGetResponseDto | null,
    assetFleetValueLoading: boolean,
    vehicleReadingsValueLoading: boolean
  ): IDashboardKpmMetricRow[] {
    const { counts } = data ?? {};
    const { vehiclePucExpiry, vehicleInsuranceExpiry, vehicleServiceDue } =
      counts ?? {};
    const { expired: pucExpired, expiringSoon: pucExpiringSoon } =
      vehiclePucExpiry ?? {};
    const { expired: insuranceExpired, expiringSoon: insuranceExpiringSoon } =
      vehicleInsuranceExpiry ?? {};
    const { noReading2Days } = vehicleReadingsAlerts ?? {};
    const { dueSoon: serviceDueSoon, overdue: serviceOverdue } =
      vehicleServiceDue ?? {};
    const sev = (value: number, alert: boolean): EKpmDashboardSeverity => {
      if (value <= 0) {
        return EKpmDashboardSeverity.NORMAL;
      }
      return alert ? EKpmDashboardSeverity.ALERT : EKpmDashboardSeverity.WARN;
    };

    return [
      {
        icon: ICONS.FLEET.PUC,
        label: 'PUC — expiring soon',
        hint: 'Pollution Under Control certificate in the renewal window',
        value: pucExpiringSoon ?? 0,
        format: EDataType.NUMBER,
        state: sev(pucExpiringSoon ?? 0, false),
        valueLoading: assetFleetValueLoading,
        link: this.vehicleLink(
          'vehiclePUCStatus',
          pickDropdownValue(
            this.appConfigurationService.vehicleDocumentStatuses(),
            'soon'
          )
        ),
      },
      {
        icon: ICONS.STATUS.EXPIRED,
        label: 'PUC — expired or overdue',
        hint: 'PUC validity ended — renew before use on road',
        value: pucExpired ?? 0,
        format: EDataType.NUMBER,
        state: sev(pucExpired ?? 0, false),
        valueLoading: assetFleetValueLoading,
        link: this.vehicleLink(
          'vehiclePUCStatus',
          pickDropdownValue(
            this.appConfigurationService.vehicleDocumentStatuses(),
            'expired'
          )
        ),
      },
      {
        icon: ICONS.FLEET.INSURANCE,
        label: 'Insurance — expiring soon',
        hint: 'Policy end date approaching — plan renewal',
        value: insuranceExpiringSoon ?? 0,
        format: EDataType.NUMBER,
        state: sev(insuranceExpiringSoon ?? 0, false),
        valueLoading: assetFleetValueLoading,
        link: this.vehicleLink(
          'vehicleInsuranceStatus',
          pickDropdownValue(
            this.appConfigurationService.vehicleDocumentStatuses(),
            'soon'
          )
        ),
      },
      {
        icon: ICONS.STATUS.EXPIRED,
        label: 'Insurance — expired or lapsed',
        hint: 'Policy no longer valid — renew coverage',
        value: insuranceExpired ?? 0,
        format: EDataType.NUMBER,
        state: sev(insuranceExpired ?? 0, false),
        valueLoading: assetFleetValueLoading,
        link: this.vehicleLink(
          'vehicleInsuranceStatus',
          pickDropdownValue(
            this.appConfigurationService.vehicleDocumentStatuses(),
            'expired'
          )
        ),
      },
      {
        icon: ICONS.SETTINGS.WRENCH,
        label: 'Service — due soon',
        hint: 'Vehicles approaching their scheduled service date',
        value: serviceDueSoon ?? 0,
        format: EDataType.NUMBER,
        state: sev(serviceDueSoon ?? 0, false),
        valueLoading: assetFleetValueLoading,
        link: this.vehicleLink(
          'vehicleServiceDueStatus',
          pickDropdownValue(
            this.appConfigurationService.vehicleServiceStatuses(),
            'soon'
          )
        ),
      },
      {
        icon: ICONS.STATUS.EXPIRED,
        label: 'Service — overdue',
        hint: 'Past the service due date — follow up required',
        value: serviceOverdue ?? 0,
        format: EDataType.NUMBER,
        state: sev(serviceOverdue ?? 0, false),
        valueLoading: assetFleetValueLoading,
        link: this.vehicleLink(
          'vehicleServiceDueStatus',
          pickDropdownValue(
            this.appConfigurationService.vehicleServiceStatuses(),
            'expired'
          )
        ),
      },
      {
        icon: ICONS.FLEET.READING,
        label: 'Fleet readings — silent (2+ days)',
        hint: 'Vehicles with no odometer or fuel reading in the last two days',
        value: noReading2Days?.count ?? 0,
        format: EDataType.NUMBER,
        state: sev(noReading2Days?.count ?? 0, false),
        valueLoading: vehicleReadingsValueLoading,
        link: this.linkTo([
          '/',
          ROUTE_BASE_PATHS.TRANSPORT,
          ROUTE_BASE_PATHS.VEHICLE_READING,
          ROUTES.VEHICLE_READING.LIST,
        ]),
      },
    ];
  }
}
