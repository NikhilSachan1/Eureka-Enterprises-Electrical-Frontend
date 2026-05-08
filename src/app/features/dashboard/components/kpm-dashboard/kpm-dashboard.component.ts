import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CurrencyPipe, DecimalPipe, NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { APP_CONFIG } from '@core/config';
import { ICONS } from '@shared/constants';
import { LoggerService } from '@core/services';
import { DashboardService } from '@features/dashboard/services/dashboard.services';
import {
  IApprovalPendingDashboardGetResponseDto,
  IAssetFleetAlertsDashboardGetResponseDto,
  ILedgerBalanceDashboardGetResponseDto,
  IVehicleReadingsAlertsDashboardGetResponseDto,
} from '@features/dashboard/types/dashboard.dto';
import { EKpmDashboardSeverity } from '@features/dashboard/types/dashboard.enum';
import { EDataType } from '@shared/types';
import { IDashboardKpmMetricRow } from '@features/dashboard/types/dashboard.interface';

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
    this.loadAssetFleetAlerts();
    this.loadVehicleReadingsAlerts();
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
      .getAssetFleetAlerts()
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
    const { totals } = data ?? {};
    const sev = (value: number, alert: boolean): EKpmDashboardSeverity => {
      if (value <= 0) {
        return EKpmDashboardSeverity.NORMAL;
      }
      return alert ? EKpmDashboardSeverity.ALERT : EKpmDashboardSeverity.WARN;
    };

    return [
      {
        icon: ICONS.ATTENDANCE.CHECK_IN,
        label: 'Attendance approvals',
        hint: 'Check-ins, regularisation, or corrections awaiting approval',
        value: totals?.attendance ?? 0,
        format: EDataType.NUMBER,
        state: sev(totals?.attendance ?? 0, false),
        valueLoading,
      },
      {
        icon: ICONS.LEAVE.CALENDAR_PLUS,
        label: 'Leave approvals',
        hint: 'Leave requests still in the approval workflow',
        value: totals?.leave ?? 0,
        format: EDataType.NUMBER,
        state: sev(totals?.leave ?? 0, false),
        valueLoading,
      },
      {
        icon: ICONS.EXPENSE.MONEY,
        label: 'Expense approvals',
        hint: 'Submitted expense claims not yet approved or rejected',
        value: totals?.expense ?? 0,
        format: EDataType.NUMBER,
        state: sev(totals?.expense ?? 0, false),
        valueLoading,
      },
      {
        icon: ICONS.EXPENSE.CAR,
        label: 'Fuel expense approvals',
        hint: 'Vehicle fuel entries pending approval',
        value: totals?.fuelExpense ?? 0,
        format: EDataType.NUMBER,
        state: sev(totals?.fuelExpense ?? 0, false),
        valueLoading,
      },
      {
        icon: ICONS.SITE.BUILDING,
        label: 'Site document approvals',
        hint: 'Site or project documents awaiting review',
        value: totals?.siteDocuments ?? 0,
        format: EDataType.NUMBER,
        state: sev(totals?.siteDocuments ?? 0, true),
        valueLoading,
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
      },
      {
        icon: ICONS.COMMON.ARROW_DOWN,
        label: 'Expense receivable',
        hint: 'Net to recover from employees (advances or overpayments)',
        value: overpaid?.totalAmount ?? 0,
        format: EDataType.CURRENCY,
        state: sevRecover(overpaid?.totalAmount ?? 0),
        valueLoading,
      },
      {
        icon: ICONS.FUEL.MENU,
        label: 'Fuel payable',
        hint: 'Approved fuel ledger amounts still to be reimbursed',
        value: fuelPayable?.totalAmount ?? 0,
        format: EDataType.CURRENCY,
        state: sevPayable(fuelPayable?.totalAmount ?? 0),
        valueLoading,
      },
      {
        icon: ICONS.COMMON.ARROW_DOWN,
        label: 'Fuel receivable',
        hint: 'Net fuel advances or overpayments to recover from staff',
        value: fuelOverpaid?.totalAmount ?? 0,
        format: EDataType.CURRENCY,
        state: sevRecover(fuelOverpaid?.totalAmount ?? 0),
        valueLoading,
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
      },
      {
        icon: ICONS.STATUS.EXPIRED,
        label: 'Calibration — overdue',
        hint: 'Past the calibration due date — follow up required',
        value: assetCalibrationOverdue ?? 0,
        format: EDataType.NUMBER,
        state: sev(assetCalibrationOverdue ?? 0, false),
        valueLoading,
      },
      {
        icon: ICONS.SECURITY.SHIELD,
        label: 'Warranty — expiring soon',
        hint: 'Warranty coverage ending within the configured window',
        value: assetWarrantyExpiringSoon ?? 0,
        format: EDataType.NUMBER,
        state: sev(assetWarrantyExpiringSoon ?? 0, false),
        valueLoading,
      },
      {
        icon: ICONS.STATUS.EXPIRED,
        label: 'Warranty — lapsed',
        hint: 'Warranty no longer in effect or past validity',
        value: assetWarrantyExpired ?? 0,
        format: EDataType.NUMBER,
        state: sev(assetWarrantyExpired ?? 0, false),
        valueLoading,
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
      },
      {
        icon: ICONS.STATUS.EXPIRED,
        label: 'PUC — expired or overdue',
        hint: 'PUC validity ended — renew before use on road',
        value: pucExpired ?? 0,
        format: EDataType.NUMBER,
        state: sev(pucExpired ?? 0, false),
        valueLoading: assetFleetValueLoading,
      },
      {
        icon: ICONS.FLEET.INSURANCE,
        label: 'Insurance — expiring soon',
        hint: 'Policy end date approaching — plan renewal',
        value: insuranceExpiringSoon ?? 0,
        format: EDataType.NUMBER,
        state: sev(insuranceExpiringSoon ?? 0, false),
        valueLoading: assetFleetValueLoading,
      },
      {
        icon: ICONS.STATUS.EXPIRED,
        label: 'Insurance — expired or lapsed',
        hint: 'Policy no longer valid — renew coverage',
        value: insuranceExpired ?? 0,
        format: EDataType.NUMBER,
        state: sev(insuranceExpired ?? 0, false),
        valueLoading: assetFleetValueLoading,
      },
      {
        icon: ICONS.SETTINGS.WRENCH,
        label: 'Service — due soon',
        hint: 'Vehicles approaching their scheduled service date',
        value: serviceDueSoon ?? 0,
        format: EDataType.NUMBER,
        state: sev(serviceDueSoon ?? 0, false),
        valueLoading: assetFleetValueLoading,
      },
      {
        icon: ICONS.STATUS.EXPIRED,
        label: 'Service — overdue',
        hint: 'Past the service due date — follow up required',
        value: serviceOverdue ?? 0,
        format: EDataType.NUMBER,
        state: sev(serviceOverdue ?? 0, false),
        valueLoading: assetFleetValueLoading,
      },
      {
        icon: ICONS.FLEET.READING,
        label: 'Fleet readings — silent (2+ days)',
        hint: 'Vehicles with no odometer or fuel reading in the last two days',
        value: noReading2Days?.count ?? 0,
        format: EDataType.NUMBER,
        state: sev(noReading2Days?.count ?? 0, false),
        valueLoading: vehicleReadingsValueLoading,
      },
    ];
  }
}
