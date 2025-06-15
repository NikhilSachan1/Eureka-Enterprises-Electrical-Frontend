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
import { VEHICLE_LIST_BULK_ACTIONS_CONFIG, VEHICLE_LIST_ROW_ACTIONS_CONFIG, VEHICLE_LIST_TABLE_CONFIG, VEHICLE_LIST_TABLE_HEADER } from '../config/table/vehicle-list-table.config';
import { EBulkActionType, ERowActionType } from '../../../shared/types';
import { EDialogType } from '../../../shared/types/confirmation-dialog.types';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [PageHeaderComponent, MetricsCardComponent, ConfirmationDialogComponent, DataTableComponent],
  templateUrl: './vehicle-list.component.html',
  styleUrl: './vehicle-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleListComponent implements OnInit {

  // Dependency Injection
  private readonly logger = inject(LoggerService);
  private readonly dataTableConfigService = inject(DataTableConfigService);
  private readonly confirmationDialogService = inject(ConfirmationDialogService);
  private readonly router = inject(Router);

  // Signals
  protected metricsCards = signal<IMetricData[]>([]);
  protected tableConfig = signal<IDataTableConfig>({} as IDataTableConfig);
  protected tableHeader = signal<IDataTableHeaderConfig[]>([]);
  protected tableData = signal<any[]>([]);
  protected loading = signal<boolean>(false);
  protected bulkActionButtons = signal<IBulkActionConfig[]>([]);
  protected rowActions = signal<IRowActionConfig[]>([]);

  ngOnInit(): void {
    this.initializeComponent();
  }

  private initializeComponent(): void {
    this.initializeDataTableConfigs();
    this.initializeMetricsCards();
    this.loadVehicleData();
  }

  private initializeDataTableConfigs(): void {
    this.tableConfig.set(this.getTableConfig());
    this.tableHeader.set(this.getTableHeader());
    this.bulkActionButtons.set(this.getBulkActionButtons());
    this.rowActions.set(this.getRowActions());
  }

  private initializeMetricsCards(): void {
    this.metricsCards.set(this.getMetricCardsData());
  }

  private getMetricCardsData(): IMetricData[] {
    return [
      {
        title: 'Vehicle Status',
        subtitle: 'Current vehicle status overview',
        iconClass: 'pi pi-car text-blue-500',
        iconBgClass: 'bg-blue-50',
        metrics: [
          { label: 'Active', value: 28 },
          { label: 'Under Maintenance', value: 3 },
          { label: 'Out of Service', value: 2 },
        ],
      },
      {
        title: 'Allocation Status',
        subtitle: 'Vehicle allocation overview',
        iconClass: 'pi pi-users text-green-500',
        iconBgClass: 'bg-green-50',
        metrics: [
          { label: 'Allocated', value: 20 },
          { label: 'Available', value: 10 },
          { label: 'Reserved', value: 3 },
        ],
      },
      {
        title: 'Fuel Management',
        subtitle: 'Petro card overview',
        iconClass: 'pi pi-credit-card text-orange-500',
        iconBgClass: 'bg-orange-50',
        metrics: [
          { label: 'Active Cards', value: 25 },
          { label: 'Inactive Cards', value: 5 },
          { label: 'Renewal Due', value: 3 },
        ],
      },
    ];
  }

  private getTableConfig(): IDataTableConfig {
    return this.dataTableConfigService.getTableConfig(VEHICLE_LIST_TABLE_CONFIG);
  }

  private getTableHeader(): IDataTableHeaderConfig[] {
    return this.dataTableConfigService.getTableHeaderConfig(VEHICLE_LIST_TABLE_HEADER);
  }

  private getBulkActionButtons(): IBulkActionConfig[] {
    return this.dataTableConfigService.getBulkActionsConfig(VEHICLE_LIST_BULK_ACTIONS_CONFIG);
  }

  private getRowActions(): IRowActionConfig[] {
    return this.dataTableConfigService.getRowActionsConfig(VEHICLE_LIST_ROW_ACTIONS_CONFIG);
  }

  private loadVehicleData(): void {
    this.loading.set(true);
    
    // Mock data for demonstration - replace with actual service call
    setTimeout(() => {
      const mockData = [
        {
          id: 1,
          brand: 'Toyota',
          model: 'Camry',
          vehicleNumber: 'TN-01-AB-1234',
          allocationStatus: 'Allocated',
          allocatedTo: 'John Doe',
          petroCardNumber: 'PC-123456789',
          vehicleDocuments: 'documents.pdf',
        },
        {
          id: 2,
          brand: 'Honda',
          model: 'Civic',
          vehicleNumber: 'TN-02-CD-5678',
          allocationStatus: 'Available',
          allocatedTo: '',
          petroCardNumber: 'PC-987654321',
          vehicleDocuments: 'documents.pdf',
        },
        {
          id: 3,
          brand: 'Hyundai',
          model: 'Elantra',
          vehicleNumber: 'TN-03-EF-9012',
          allocationStatus: 'Allocated',
          allocatedTo: 'Jane Smith',
          petroCardNumber: 'PC-456789123',
          vehicleDocuments: 'documents.pdf',
        },
      ];
      
      this.tableData.set(mockData);
      this.loading.set(false);
    }, 1000);
  }

  // Event Handler Methods
  protected onAddButtonClick(): void {
    this.logger.info('Add vehicle button clicked');
    this.router.navigate(['/vehicle/add']);
  }

  // Action Handler Methods
  protected handleBulkActionClick(action: string): void {
    switch (action) {
      case EBulkActionType.ALLOCATE:
        this.confirmAllocateVehicleDialog();
        break;
      case EBulkActionType.DEALLOCATE:
        this.confirmDeallocateVehicleDialog();
        break;
      case EBulkActionType.DELETE:
        this.confirmDeleteVehicleDialog();
        break;
      default:
        console.warn('Unknown bulk action:', action);
    }
  }

  protected handleRowActionClick(action: string): void {
    switch (action) {
      case ERowActionType.VIEW:
        this.viewVehicleDetails();
        break;
      case ERowActionType.EDIT:
        this.editVehicleDetails();
        break;
      case ERowActionType.DELETE:
        this.confirmDeleteVehicleDialog();
        break;
      case ERowActionType.ALLOCATE:
        this.confirmAllocateVehicleDialog();
        break;
      case ERowActionType.DEALLOCATE:
        this.confirmDeallocateVehicleDialog();
        break;
      default:
        console.warn('Unknown row action:', action);
    }
  }

  // Business Logic Methods
  private viewVehicleDetails(): void {
    this.logger.info('Viewing vehicle details');
    // Implement actual logic here
  }

  private editVehicleDetails(): void {
    this.logger.info('Editing vehicle details');
    // Implement actual logic here
  }

  // Confirmation Dialog Methods
  private confirmDeleteVehicleDialog(): void {
    this.confirmationDialogService.showDialog(
      EDialogType.DELETE,
      {
        message: 'Are you sure you want to delete the selected vehicle(s)? This action cannot be undone.',
      },
      () => this.deleteVehicle()
    );
  }

  private confirmAllocateVehicleDialog(): void {
    this.confirmationDialogService.showDialog(
      EDialogType.ALLOCATE,
      {
        message: 'Are you sure you want to allocate the selected vehicle(s)?',
      },
      () => this.allocateVehicle()
    );
  }

  private confirmDeallocateVehicleDialog(): void {
    this.confirmationDialogService.showDialog(
      EDialogType.DEALLOCATE,
      {
        message: 'Are you sure you want to deallocate the selected vehicle(s)?',
      },
      () => this.deallocateVehicle()
    );
  }

  // Action Implementation Methods
  private deleteVehicle(): void {
    this.logger.info('Deleting vehicle');
    // Implement actual logic here
  }

  private allocateVehicle(): void {
    this.logger.info('Allocating vehicle');
    // Implement actual logic here
  }

  private deallocateVehicle(): void {
    this.logger.info('Deallocating vehicle');
    // Implement actual logic here
  }
}
