import { Component, OnInit, signal } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MetricsCardComponent } from '../../../../shared/components/metrics-card/metrics-card.component';
import { inject, ChangeDetectionStrategy } from '@angular/core';
import { IMetricData } from '../../../../shared/models/metric-data.model';
import { DataTableComponent } from "../../../../shared/components/data-table/data-table.component";
import { DataTableConfigService } from '../../../../shared/services/data-table-config.service';
import { ConfirmationDialogService } from '../../../../shared/services/confirmation-dialog-config.service';
import { IBulkActionConfig, IDataTableConfig, IDataTableHeaderConfig, IRowActionConfig } from '../../../../shared/models';
import { PROJECT_LIST_BULK_ACTIONS_CONFIG, PROJECT_LIST_ROW_ACTIONS_CONFIG, PROJECT_LIST_TABLE_CONFIG, PROJECT_LIST_TABLE_HEADER } from '../config/table/project-list-table.config';
import { EBulkActionType, ERowActionType } from '../../../../shared/types';
import { EDialogType } from '../../../../shared/types/confirmation-dialog.types';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [PageHeaderComponent, MetricsCardComponent, ConfirmationDialogComponent, DataTableComponent],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectListComponent implements OnInit {

  private readonly dataTableConfigService = inject(DataTableConfigService);
  private readonly confirmationDialogService = inject(ConfirmationDialogService);

  protected loading = signal(true);
  protected tableData = signal<any[]>([]);
  protected tableConfig = signal<IDataTableConfig>(this.getTableConfig());
  protected tableHeader = signal<IDataTableHeaderConfig[]>(this.getTableHeader());
  protected metricsCards = signal(this.getMetricCardsData());
  protected bulkActionButtons = signal<IBulkActionConfig[]>(this.getBulkActionButtons());
  protected rowActions = signal<IRowActionConfig[]>(this.getRowActions());

  ngOnInit(): void {
    this.getTableData();
  }

  private getMetricCardsData(): IMetricData[] {
    return [
      {
        title: 'Total Projects',
        subtitle: 'Overview of registered projects',
        iconClass: 'pi pi-briefcase text-purple-500',
        iconBgClass: 'bg-purple-50',
        metrics: [
          { label: 'Active', value: 8 },
          { label: 'Completed', value: 5 },
          { label: 'On Hold', value: 2 },
          { label: 'Total', value: 15 },
        ],
      },
    ];
  }

  private getTableConfig(): IDataTableConfig {
    return this.dataTableConfigService.getTableConfig(PROJECT_LIST_TABLE_CONFIG);
  }

  private getTableHeader(): IDataTableHeaderConfig[] {
    return this.dataTableConfigService.getTableHeaderConfig(PROJECT_LIST_TABLE_HEADER);
  }

  private getBulkActionButtons(): IBulkActionConfig[] {
    return this.dataTableConfigService.getBulkActionsConfig(PROJECT_LIST_BULK_ACTIONS_CONFIG);
  }

  private getRowActions(): IRowActionConfig[] {
    return this.dataTableConfigService.getRowActionsConfig(PROJECT_LIST_ROW_ACTIONS_CONFIG);
  }

  protected onAddButtonClick(): void {
    console.log('Adding new project:');
    // Implement actual logic here
  }

  private getTableData(): void {
    setTimeout(() => {
      this.tableData.set([
        {
          id: '1',
          projectId: 'PROJ001',
          projectName: 'Electrical Installation - Phase 1',
          fromDate: '2024-01-15',
          toDate: '2024-06-30',
          workOn: ['Testing', 'Maintenance', 'CT Analyzer'],
          projectStatus: 'Active',
          addedBy: 'John Doe',
          addedByRole: 'Admin',
          lastUpdated: '2024-01-15',
        },
        {
          id: '2',
          projectId: 'PROJ002',
          projectName: 'HVAC System Upgrade',
          fromDate: '2024-02-01',
          toDate: '2024-05-15',
          workOn: ['Installation', 'Commissioning', 'Testing'],
          projectStatus: 'Active',
          addedBy: 'Jane Smith',
          addedByRole: 'Manager',
          lastUpdated: '2024-01-14',
        },
        {
          id: '3',
          projectId: 'PROJ003',
          projectName: 'Solar Panel Installation',
          fromDate: '2024-01-10',
          toDate: '2024-03-31',
          workOn: ['Panel Installation', 'Wiring', 'Grid Connection'],
          projectStatus: 'Completed',
          addedBy: 'Mike Johnson',
          addedByRole: 'Admin',
          lastUpdated: '2024-01-13',
        },
        {
          id: '4',
          projectId: 'PROJ004',
          projectName: 'Emergency Lighting System',
          fromDate: '2024-03-01',
          toDate: '2024-04-30',
          workOn: ['System Design', 'Installation', 'Testing'],
          projectStatus: 'On Hold',
          addedBy: 'Sarah Wilson',
          addedByRole: 'Manager',
          lastUpdated: '2024-01-12',
        },
        {
          id: '5',
          projectId: 'PROJ005',
          projectName: 'Data Center Power Backup',
          fromDate: '2024-01-20',
          toDate: '2024-07-31',
          workOn: ['UPS Installation', 'Generator Setup', 'Load Testing'],
          projectStatus: 'Active',
          addedBy: 'David Brown',
          addedByRole: 'Admin',
          lastUpdated: '2024-01-11',
        },
        {
          id: '6',
          projectId: 'PROJ006',
          projectName: 'Street Lighting Project',
          fromDate: '2024-02-15',
          toDate: '2024-08-31',
          workOn: ['Pole Installation', 'Wiring', 'Automation'],
          projectStatus: 'Active',
          addedBy: 'Lisa Davis',
          addedByRole: 'Manager',
          lastUpdated: '2024-01-10',
        },
        {
          id: '7',
          projectId: 'PROJ007',
          projectName: 'Factory Automation System',
          fromDate: '2024-01-05',
          toDate: '2024-04-30',
          workOn: ['PLC Programming', 'Sensor Installation', 'Testing'],
          projectStatus: 'Completed',
          addedBy: 'Tom Anderson',
          addedByRole: 'Admin',
          lastUpdated: '2024-01-09',
        },
        {
          id: '8',
          projectId: 'PROJ008',
          projectName: 'Hospital Electrical Upgrade',
          fromDate: '2024-03-15',
          toDate: '2024-09-30',
          workOn: ['Panel Upgrade', 'Load Balancing', 'Safety Testing'],
          projectStatus: 'Active',
          addedBy: 'Emma Taylor',
          addedByRole: 'Manager',
          lastUpdated: '2024-01-08',
        },
        {
          id: '9',
          projectId: 'PROJ009',
          projectName: 'Residential Complex Wiring',
          fromDate: '2024-01-25',
          toDate: '2024-05-31',
          workOn: ['Main Wiring', 'Sub-panel Installation', 'Testing'],
          projectStatus: 'Active',
          addedBy: 'Alex Wilson',
          addedByRole: 'Admin',
          lastUpdated: '2024-01-07',
        },
        {
          id: '10',
          projectId: 'PROJ010',
          projectName: 'Warehouse Lighting System',
          fromDate: '2024-02-10',
          toDate: '2024-06-30',
          workOn: ['LED Installation', 'Motion Sensors', 'Energy Audit'],
          projectStatus: 'On Hold',
          addedBy: 'Chris Martin',
          addedByRole: 'Manager',
          lastUpdated: '2024-01-06',
        },
        {
          id: '11',
          projectId: 'PROJ011',
          projectName: 'School Electrical Maintenance',
          fromDate: '2024-01-15',
          toDate: '2024-03-31',
          workOn: ['Preventive Maintenance', 'Repairs', 'Safety Inspection'],
          projectStatus: 'Completed',
          addedBy: 'Rachel Green',
          addedByRole: 'Admin',
          lastUpdated: '2024-01-05',
        },
        {
          id: '12',
          projectId: 'PROJ012',
          projectName: 'Hotel Power Management',
          fromDate: '2024-04-01',
          toDate: '2024-10-31',
          workOn: ['Energy Management', 'Load Monitoring', 'Optimization'],
          projectStatus: 'Active',
          addedBy: 'Mark Johnson',
          addedByRole: 'Manager',
          lastUpdated: '2024-01-04',
        }
      ]);
      this.loading.set(false);
    }, 150);
  }

  // Action Handler Methods
  protected handleBulkActionClick(action: string): void {
    switch (action) {
      case EBulkActionType.DELETE:
        this.confirmDeleteProjectsDialog();
        break;
      default:
        console.log('Bulk action clicked:', action);
    }
  }

  protected handleRowActionClick(action: string): void {
    switch (action) {
      case ERowActionType.VIEW:
        console.log('View project details');
        break;
      case ERowActionType.EDIT:
        console.log('Edit project');
        break;
      case ERowActionType.DELETE:
        this.confirmDeleteProjectDialog();
        break;
      default:
        console.log('Row action clicked:', action);
    }
  }

  private confirmDeleteProjectsDialog(): void {
    this.confirmationDialogService.showDialog(
      EDialogType.DELETE,
      {
        message: 'Are you sure you want to delete the selected projects? This action cannot be undone.',
        accept: () => {
          console.log('Projects deleted successfully');
          // Implement actual delete logic here
        },
      }
    );
  }

  private confirmDeleteProjectDialog(): void {
    this.confirmationDialogService.showDialog(
      EDialogType.DELETE,
      {
        message: 'Are you sure you want to delete this project? This action cannot be undone.',
        accept: () => {
          console.log('Project deleted successfully');
          // Implement actual delete logic here
        },
      }
    );
  }
}
