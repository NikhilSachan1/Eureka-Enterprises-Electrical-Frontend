import { Component, OnInit, signal } from '@angular/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MetricsCardComponent } from '../../../shared/components/metrics-card/metrics-card.component';
import { LoggerService } from '../../../core/services/logger.service';
import { inject, ChangeDetectionStrategy } from '@angular/core';
import { IMetricData } from '../../../shared/models/metric-data.model';
import { DataTableComponent } from "../../../shared/components/data-table/data-table.component";
import { DataTableConfigService } from '../../../shared/services/data-table-config.service';
import { ConfirmationDialogService } from '../../../shared/services/confirmation-dialog-config.service';
import { IBulkActionConfig, IDataTableConfig, IDataTableHeaderConfig, IRowActionConfig } from '../../../shared/models';
import { ATTENDANCE_LIST_BULK_ACTIONS_CONFIG, ATTENDANCE_LIST_ROW_ACTIONS_CONFIG, ATTENDANCE_LIST_TABLE_CONFIG, ATTENDANCE_LIST_TABLE_HEADER } from '../config/table/attendance-list-table.config';
import { REGULARIZE_ATTENDANCE_CONFIRMATION_DIALOG_CONFIG } from '../config/dialog/attendance-list-dialog.config';
import { EBulkActionType, ERowActionType } from '../../../shared/types';
import { EDialogType } from '../../../shared/types/confirmation-dialog.types';

@Component({
  selector: 'app-attendance-list',
  standalone: true,
  imports: [PageHeaderComponent, MetricsCardComponent, ConfirmationDialogComponent, DataTableComponent],
  templateUrl: './attendance-list.component.html',
  styleUrl: './attendance-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendanceListComponent implements OnInit {

  private readonly dataTableConfigService = inject(DataTableConfigService);
  private readonly confirmationDialogService = inject(ConfirmationDialogService);
  private readonly logger = inject(LoggerService);

  protected loading = signal(true);
  protected tableData = signal<any[]>([]);
  protected tableConfig = signal<IDataTableConfig>(this.getTableConfig());
  protected tableHeader = signal<IDataTableHeaderConfig[]>(this.getTableHeader(),);
  protected metricsCards = signal(this.getMetricCardsData());
  protected bulkActionButtons = signal<IBulkActionConfig[]>(this.getBulkActionButtons(),);
  protected rowActions = signal<IRowActionConfig[]>(this.getRowActions());

  ngOnInit(): void {
    this.getTableData();
  }

  private getMetricCardsData(): IMetricData[] {
    return [
      {
        title: 'Approval Status',
        subtitle: 'Request approval overview',
        iconClass: 'pi pi-check-circle text-green-500',
        iconBgClass: 'bg-green-50',
        metrics: [
          { label: 'Approved', value: 5 },
          { label: 'Pending', value: 3 },
          { label: 'Rejected', value: 1 },
        ],
      },
      {
        title: 'Attendance Status',
        subtitle: 'Employee attendance overview',
        iconClass: 'pi pi-clock text-purple-500',
        iconBgClass: 'bg-purple-50',
        metrics: [
          { label: 'Present', value: 15 },
          { label: 'Absent', value: 3 },
          { label: 'Leave', value: 2 },
          { label: 'Holiday', value: 1 },
        ],
      },
    ];
  }

  private getTableConfig(): IDataTableConfig {
    return this.dataTableConfigService.getTableConfig(ATTENDANCE_LIST_TABLE_CONFIG);
  }

  private getTableHeader(): IDataTableHeaderConfig[] {
    console.log('ATTENDANCE_LIST_TABLE_HEADER', this.dataTableConfigService.getTableHeaderConfig(ATTENDANCE_LIST_TABLE_HEADER));
    return this.dataTableConfigService.getTableHeaderConfig(ATTENDANCE_LIST_TABLE_HEADER);
  }

  private getBulkActionButtons(): IBulkActionConfig[] {
    return this.dataTableConfigService.getBulkActionsConfig(ATTENDANCE_LIST_BULK_ACTIONS_CONFIG);
  }

  private getRowActions(): IRowActionConfig[] {
    return this.dataTableConfigService.getRowActionsConfig(ATTENDANCE_LIST_ROW_ACTIONS_CONFIG);
  }

  protected onAddButtonClick(): void {
    console.log('Adding new employee:');
    // Implement actual logic here
  }

  private getTableData(): void {
    setTimeout(() => {
      this.tableData.set([
        {
          id: '8d44bc51-d400-45f9-9092-69b46a5bd755',
          employeeId: 1001,
          name: 'James Butt',
          attendanceDate: '2021-07-17',
          siteLocation: 'Site 1',
          clientName: 'Client 1',
          attendanceStatus: 'Present',
          approvalStatus: 'Approved',
        },
        {
          id: '8d44bc51-d400-45f9-9092-69b46a5bd756',
          employeeId: 1002,
          name: 'Mary Smith',
          attendanceDate: '2021-07-10',
          siteLocation: 'Site 2',
          clientName: 'Client 2',
          attendanceStatus: 'On Leave',
          approvalStatus: 'NA',
        },
        {
          id: '8d44bc51-d400-45f9-9092-69b46a5bd757',
          employeeId: 1003,
          name: 'John Doe',
          attendanceDate: '2021-07-10',
          siteLocation: 'Site 3',
          clientName: 'Client 3',
          attendanceStatus: 'Holiday',
          approvalStatus: 'Pending',
        },
        {
          id: '8d44bc51-d400-45f9-9092-69b46a5bd758',
          employeeId: 1004,
          name: 'Sara Lee',
          attendanceDate: '2021-07-10',
          siteLocation: 'Site 4',
          clientName: 'Client 4',
          attendanceStatus: 'Checked In',
          approvalStatus: 'Rejected',
        },
        {
          id: '8d44bc51-d400-45f9-9092-69b46a5bd759',
          employeeId: 1005,
          name: 'Michael Brown',
          attendanceDate: '2021-07-10',
          siteLocation: 'Site 5',
          clientName: 'Client 5',
          attendanceStatus: 'Checked Out',
          approvalStatus: 'Pending',
        },
        {
          id: '8d44bc51-d400-45f9-9092-69b46a5bd760',
          employeeId: 1006,
          name: 'Emily Clark',
          attendanceDate: '2021-07-10',
          siteLocation: 'Site 6',
          clientName: 'Client 6',
          attendanceStatus: 'Not Checked In',
          approvalStatus: 'Pending',
        },
        {
          id: '8d44bc51-d400-45f9-9092-69b46a5bd761',
          employeeId: 1007,
          name: 'Daniel Johnson',
          attendanceDate: '2021-07-10',
          siteLocation: 'Site 7',
          clientName: 'Client 7',
          attendanceStatus: 'Absent',
          approvalStatus: 'Pending',
        }
      ]);
      this.loading.set(false);
    }, 150);
  }

  // Action Handler Methods
  protected handleBulkActionClick(action: string): void {
    switch (action) {
      case EBulkActionType.APPROVE:
        this.confirmApproveAttendanceDialog();
        break;
      case EBulkActionType.REJECT:
        this.confirmRejectAttendanceDialog();
        break;
      default:
        console.warn('Unknown bulk action:', action);
    }
  }

  protected handleRowActionClick(action: string): void {
    switch (action) {
      case ERowActionType.VIEW:
        break;
      case ERowActionType.REGULARIZE:
        this.handleRegularizeAttendance();
        break;
      case ERowActionType.APPROVE:
        this.confirmApproveAttendanceDialog();
        break;
      case ERowActionType.REJECT:
        this.confirmRejectAttendanceDialog();
        break;
      default:
        console.warn('Unknown row action:', action);
    }
  }

  private confirmApproveAttendanceDialog(): void {
    this.confirmationDialogService.showDialog(
      EDialogType.APPROVE,
      () => alert('Approve attendance'),
      () => console.log('Approve operation cancelled'),
    );
  }

  private confirmRejectAttendanceDialog(): void {
    this.confirmationDialogService.showDialog(
      EDialogType.REJECT,
      () => alert('Reject attendance'),
      () => console.log('Reject operation cancelled'),
    );
  }

  private handleRegularizeAttendance(): void {
    this.confirmationDialogService.showDialog(
      EDialogType.DEFAULT,
      () => alert('Reject attendance'),
      () => console.log('Reject operation cancelled'),
      REGULARIZE_ATTENDANCE_CONFIRMATION_DIALOG_CONFIG,
    );
  }
}
