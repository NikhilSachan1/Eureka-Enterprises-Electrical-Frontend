import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PageHeaderComponent } from "../../../shared/components/page-header/page-header.component";
import { LoggerService } from '../../../core/services/logger.service';
import { IDataTableConfig, IDataTableHeaderConfig, IBulkActionConfig, IRowActionConfig } from '../../../shared/models';
import { IMetricData } from '../../../shared/models/metric-data.model';
import { ConfirmationDialogService } from '../../../shared/services/confirmation-dialog-config.service';
import { DataTableConfigService } from '../../../shared/services/data-table-config.service';
import { EBulkActionType, ERowActionType } from '../../../shared/types';
import { EConfirmationDialogRecordDetailInputType, EDialogType } from '../../../shared/types/confirmation-dialog.types';
import { MetricsCardComponent } from "../../../shared/components/metrics-card/metrics-card.component";
import { DataTableComponent } from "../../../shared/components/data-table/data-table.component";
import { ConfirmationDialogComponent } from "../../../shared/components/confirmation-dialog/confirmation-dialog.component";
import { LEAVE_REQUESTS_LIST_BULK_ACTIONS_CONFIG, LEAVE_REQUESTS_LIST_ROW_ACTIONS_CONFIG, LEAVE_REQUESTS_LIST_TABLE_CONFIG, LEAVE_REQUESTS_LIST_TABLE_HEADER } from '../config/table/leave-requests-list-table.config';

@Component({
  selector: 'app-leave-requests-list',
  standalone: true,
  imports: [PageHeaderComponent, MetricsCardComponent, DataTableComponent, ConfirmationDialogComponent],
  templateUrl: './leave-requests-list.component.html',
  styleUrl: './leave-requests-list.component.scss'
})
export class LeaveRequestsListComponent implements OnInit {
  private readonly logger = inject(LoggerService);
  private readonly router = inject(Router);
  private readonly dataTableConfigService = inject(DataTableConfigService);
  private readonly confirmationDialogService = inject(ConfirmationDialogService);

  protected readonly loading = signal<boolean>(true);
  protected readonly tableConfig = signal<IDataTableConfig>(this.getTableConfig());
  protected readonly tableHeader = signal<IDataTableHeaderConfig[]>(this.getTableHeader());
  protected readonly tableData = signal<any[]>([]);
  protected readonly bulkActionButtons = signal<IBulkActionConfig[]>(this.getBulkActionButtons());
  protected readonly rowActions = signal<IRowActionConfig[]>(this.getRowActions());
  protected readonly metricsCards = signal<IMetricData[]>(this.getMetricCardsData());

  ngOnInit(): void {
    this.initializeComponent();
  }

  private initializeComponent(): void {
    this.metricsCards.set(this.getMetricCardsData());
    this.tableConfig.set(this.getTableConfig());
    this.tableHeader.set(this.getTableHeader());
    this.bulkActionButtons.set(this.getBulkActionButtons());
    this.rowActions.set(this.getRowActions());
    this.getTableData();
  }

  private getMetricCardsData(): IMetricData[] {
    return [
      {
        title: 'Leave Requests',
        subtitle: 'Request overview',
        iconClass: 'pi pi-calendar text-blue-500',
        iconBgClass: 'bg-blue-50',
        metrics: [
          { label: 'Pending', value: 5 },
          { label: 'Approved', value: 3 },
          { label: 'Rejected', value: 1 },
          { label: 'Canceled', value: 1 },
        ],
      },
      {
        title: 'Leave Balance',
        subtitle: 'Employee leave balance',
        iconClass: 'pi pi-clock text-purple-500',
        iconBgClass: 'bg-purple-50',
        metrics: [
          { label: 'Available', value: 15 },
          { label: 'Used', value: 5 },
          { label: 'Pending', value: 2 },
        ],
      },
    ];
  }

  private getTableConfig(): IDataTableConfig {
    return this.dataTableConfigService.getTableConfig(LEAVE_REQUESTS_LIST_TABLE_CONFIG);
  }

  private getTableHeader(): IDataTableHeaderConfig[] {
    return this.dataTableConfigService.getTableHeaderConfig(LEAVE_REQUESTS_LIST_TABLE_HEADER);
  }

  private getBulkActionButtons(): IBulkActionConfig[] {
    return this.dataTableConfigService.getBulkActionsConfig(LEAVE_REQUESTS_LIST_BULK_ACTIONS_CONFIG);
  }

  private getRowActions(): IRowActionConfig[] {
    return this.dataTableConfigService.getRowActionsConfig(LEAVE_REQUESTS_LIST_ROW_ACTIONS_CONFIG);
  }

  protected onAddButtonClick(): void {
    this.logger.logUserAction('Navigate to Apply Leave Form');
    this.router.navigate(['/leave-management/apply']);
  }

  private getTableData(): void {
    setTimeout(() => {
      this.tableData.set([
        {
          id: '1',
          employeeId: 'EMP001',
          name: 'John Doe',
          fromDate: '2024-03-20',
          toDate: '2024-03-22',
          duration: '3 days',
          comment: 'Family emergency',
          approvalStatus: 'Pending',
        },
        {
          id: '2',
          employeeId: 'EMP002',
          name: 'Jane Smith',
          fromDate: '2024-03-25',
          toDate: '2024-03-26',
          duration: '2 days',
          comment: 'Personal work',
          approvalStatus: 'Approved',
        },
        {
          id: '3',
          employeeId: 'EMP003',
          name: 'Mike Johnson',
          fromDate: '2024-03-28',
          toDate: '2024-03-29',
          duration: '2 days',
          comment: 'Medical appointment',
          approvalStatus: 'Rejected',
        },
        {
          id: '4',
          employeeId: 'EMP004',
          name: 'Sarah Williams',
          fromDate: '2024-04-01',
          toDate: '2024-04-05',
          duration: '5 days',
          comment: 'Vacation',
          approvalStatus: 'Canceled',
        },
      ]);
      this.loading.set(false);
    }, 150);
  }

  protected handleBulkActionClick(action: string): void {
    switch (action) {
      case EBulkActionType.APPROVE:
        this.confirmApproveLeaveDialog();
        break;
      case EBulkActionType.REJECT:
        this.confirmRejectLeaveDialog();
        break;
      case EBulkActionType.CANCEL:
        this.confirmCancelLeaveDialog();
        break;
      default:
        console.warn('Unknown bulk action:', action);
    }
  }

  protected handleRowActionClick(action: string): void {
    switch (action) {
      case ERowActionType.VIEW:
        console.log('View leave request details');
        break;
      case ERowActionType.APPROVE:
        this.confirmApproveLeaveDialog();
        break;
      case ERowActionType.REJECT:
        this.confirmRejectLeaveDialog();
        break;
      case ERowActionType.CANCEL:
        this.confirmCancelLeaveDialog();
        break;
      default:
        console.warn('Unknown row action:', action);
    }
  }

  private confirmApproveLeaveDialog(): void {
    this.confirmationDialogService.showDialog(
      EDialogType.APPROVE,
      {
        recordDetails: {
          title: 'Leave Request Details',
          details: [
            { label: 'Employee', value: 'John Doe' },
            { label: 'From Date', value: new Date(), type: EConfirmationDialogRecordDetailInputType.DATE },
            { label: 'To Date', value: new Date(), type: EConfirmationDialogRecordDetailInputType.DATE },
            { label: 'Duration', value: '3 days' },
            { label: 'Comment', value: 'Family emergency' }
          ]
        }
      },
      () => alert('Approve leave request'),
      () => console.log('Approve operation cancelled')
    );
  }

  private confirmRejectLeaveDialog(): void {
    this.confirmationDialogService.showDialog(
      EDialogType.REJECT,
      {
        recordDetails: {
          title: 'Leave Request Details',
          details: [
            { label: 'Employee', value: 'John Doe' },
            { label: 'From Date', value: new Date(), type: EConfirmationDialogRecordDetailInputType.DATE },
            { label: 'To Date', value: new Date(), type: EConfirmationDialogRecordDetailInputType.DATE },
            { label: 'Duration', value: '3 days' },
            { label: 'Comment', value: 'Family emergency' }
          ]
        }
      },
      () => alert('Reject leave request'),
      () => console.log('Reject operation cancelled')
    );
  }

  private confirmCancelLeaveDialog(): void {
    this.confirmationDialogService.showDialog(
      EDialogType.CANCEL,
      {
        recordDetails: {
          title: 'Leave Request Details',
          details: [
            { label: 'Employee', value: 'John Doe' },
            { label: 'From Date', value: new Date(), type: EConfirmationDialogRecordDetailInputType.DATE },
            { label: 'To Date', value: new Date(), type: EConfirmationDialogRecordDetailInputType.DATE },
            { label: 'Duration', value: '3 days' },
            { label: 'Comment', value: 'Family emergency' }
          ]
        }
      },
      () => alert('Cancel leave request'),
      () => console.log('Cancel operation cancelled')
    );
  }
}
