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
import { ASSET_LIST_BULK_ACTIONS_CONFIG, ASSET_LIST_ROW_ACTIONS_CONFIG, ASSET_LIST_TABLE_CONFIG, ASSET_LIST_TABLE_HEADER } from '../config/table/asset-list-table.config';
import { EBulkActionType, ERowActionType } from '../../../shared/types';
import { EDialogType } from '../../../shared/types/confirmation-dialog.types';
import { Router } from '@angular/router';

@Component({
  selector: 'app-asset-list',
  standalone: true,
  imports: [PageHeaderComponent, MetricsCardComponent, ConfirmationDialogComponent, DataTableComponent],
  templateUrl: './asset-list.component.html',
  styleUrl: './asset-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetListComponent implements OnInit {

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
  protected bulkActionButtons = signal<IBulkActionConfig[]>([]);
  protected rowActions = signal<IRowActionConfig[]>([]);
  protected loading = signal<boolean>(true);

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
        title: 'Asset Status',
        subtitle: 'Current asset status overview',
        iconClass: 'pi pi-cog text-blue-500',
        iconBgClass: 'bg-blue-50',
        metrics: [
          { label: 'Active', value: 25 },
          { label: 'Under Maintenance', value: 5 },
          { label: 'Out of Service', value: 2 },
        ],
      },
      {
        title: 'Allocation Status',
        subtitle: 'Asset allocation overview',
        iconClass: 'pi pi-users text-green-500',
        iconBgClass: 'bg-green-50',
        metrics: [
          { label: 'Allocated', value: 18 },
          { label: 'Available', value: 12 },
          { label: 'Reserved', value: 2 },
        ],
      },
      {
        title: 'Calibration Status',
        subtitle: 'Calibration overview',
        iconClass: 'pi pi-calendar text-orange-500',
        iconBgClass: 'bg-orange-50',
        metrics: [
          { label: 'Up to Date', value: 20 },
          { label: 'Due Soon', value: 8 },
          { label: 'Overdue', value: 4 },
        ],
      },
    ];
  }

  private getTableConfig(): IDataTableConfig {
    return this.dataTableConfigService.getTableConfig(ASSET_LIST_TABLE_CONFIG);
  }

  private getTableHeader(): IDataTableHeaderConfig[] {
    return this.dataTableConfigService.getTableHeaderConfig(ASSET_LIST_TABLE_HEADER);
  }

  private getBulkActionButtons(): IBulkActionConfig[] {
    return this.dataTableConfigService.getBulkActionsConfig(ASSET_LIST_BULK_ACTIONS_CONFIG);
  }

  private getRowActions(): IRowActionConfig[] {
    return this.dataTableConfigService.getRowActionsConfig(ASSET_LIST_ROW_ACTIONS_CONFIG);
  }

  private getTableData(): void {
    setTimeout(() => {
      this.tableData.set([
        {
          id: '8d44bc51-d400-45f9-9092-69b46a5bd755',
          assetName: 'Digital Multimeter',
          assetModel: 'Fluke 87V',
          serialNumber: 'FLK-87V-001',
          usage: 'Electrical Testing',
          calibrationFrom: 'TechCal Services',
          calibrationStartDate: '2024-01-15',
          calibrationEndDate: '2025-01-15',
          status: 'Active',
          allocatedTo: 'John Smith',
          employeeId: '1234567890',
          assetCertificate: 'https://example.com/certificates/cert-001.pdf',
        },
        {
          id: '8d44bc51-d400-45f9-9092-69b46a5bd756',
          assetName: 'Oscilloscope',
          assetModel: 'Tektronix MSO5054',
          serialNumber: 'TEK-MSO-002',
          usage: 'Signal Analysis',
          calibrationFrom: 'ProCal Labs',
          calibrationStartDate: '2023-11-20',
          calibrationEndDate: '2024-11-20',
          status: 'Calibration Due',
          allocatedTo: 'Sarah Johnson',
          employeeId: '1234567890',
          assetCertificate: 'https://example.com/certificates/cert-002.pdf',
        },
        {
          id: '8d44bc51-d400-45f9-9092-69b46a5bd757',
          assetName: 'Power Supply',
          assetModel: 'Keysight E36313A',
          serialNumber: 'KEY-E36-003',
          usage: 'Circuit Testing',
          calibrationFrom: 'MetriCal Inc',
          calibrationStartDate: '2024-03-10',
          calibrationEndDate: '2025-03-10',
          status: 'Available',
          allocatedTo: null,
          employeeId: null,
          assetCertificate: null,
        },
        {
          id: '8d44bc51-d400-45f9-9092-69b46a5bd758',
          assetName: 'Function Generator',
          assetModel: 'Rigol DG4162',
          serialNumber: 'RIG-DG4-004',
          usage: 'Waveform Generation',
          calibrationFrom: 'CalTech Solutions',
          calibrationStartDate: '2024-02-05',
          calibrationEndDate: '2025-02-05',
          status: 'Allocated',
          allocatedTo: 'Mike Wilson',
          employeeId: '1234567890',
          assetCertificate: 'https://example.com/certificates/cert-004.pdf',
        },
        {
          id: '8d44bc51-d400-45f9-9092-69b46a5bd759',
          assetName: 'Thermal Camera',
          assetModel: 'FLIR E8-XT',
          serialNumber: 'FLIR-E8-005',
          usage: 'Thermal Inspection',
          calibrationFrom: 'ThermalCal Pro',
          calibrationStartDate: '2023-12-01',
          calibrationEndDate: '2024-12-01',
          status: 'Under Maintenance',
          allocatedTo: 'Lisa Davis',
          employeeId: '1234567890',
          assetCertificate: 'https://example.com/certificates/cert-005.pdf',
        },
        {
          id: '8d44bc51-d400-45f9-9092-69b46a5bd760',
          assetName: 'Insulation Tester',
          assetModel: 'Megger MIT515',
          serialNumber: 'MEG-MIT-006',
          usage: 'Insulation Testing',
          calibrationFrom: 'ElectriCal Services',
          calibrationStartDate: '2024-01-30',
          calibrationEndDate: '2025-01-30',
          status: 'Active',
          allocatedTo: 'Robert Brown',
          employeeId: '1234567890',
          assetCertificate: 'https://example.com/certificates/cert-006.pdf',
        },
      ]);
      this.loading.set(false);
    }, 150);
  }

  // Event Handler Methods
  protected onAddButtonClick(): void {
    this.logger.info('Add asset button clicked');
    // Navigate to add asset page
    this.router.navigate(['/asset/add']);
  }

  // Action Handler Methods
  protected handleBulkActionClick(action: string): void {
    switch (action) {
      case EBulkActionType.ALLOCATE:
        this.confirmAllocateAssetDialog();
        break;
      case EBulkActionType.DEALLOCATE:
        this.confirmDeallocateAssetDialog();
        break;
      case EBulkActionType.DELETE:
        this.confirmDeleteAssetDialog();
        break;
      default:
        console.warn('Unknown bulk action:', action);
    }
  }

  protected handleRowActionClick(action: string): void {
    switch (action) {
      case ERowActionType.VIEW:
        this.viewAssetDetails();
        break;
      case ERowActionType.EDIT:
        this.editAssetDetails();
        break;
      case ERowActionType.DELETE:
        this.confirmDeleteAssetDialog();
        break;
      case ERowActionType.ALLOCATE:
        this.confirmAllocateAssetDialog();
        break;
      case ERowActionType.DEALLOCATE:
        this.confirmDeallocateAssetDialog();
        break;
      default:
        console.warn('Unknown row action:', action);
    }
  }

  // Business Logic Methods
  private viewAssetDetails(): void {
    this.logger.info('Viewing asset details');
    // Implement actual logic here
  }

  private editAssetDetails(): void {
    this.logger.info('Editing asset details');
    // Implement actual logic here
  }

  // Dialog Methods
  private confirmDeleteAssetDialog(): void {
    this.confirmationDialogService.showDialog(
      EDialogType.DELETE,
      {
        recordDetails: {
          title: 'Asset Details',
          details: [
            { label: 'Asset Name', value: 'Digital Multimeter' },
            { label: 'Asset Model', value: 'Fluke 87V' },
            { label: 'Serial Number', value: 'FLK-87V-001' },
            { label: 'Usage', value: 'Electrical Testing' },
            { label: 'Calibration From', value: 'TechCal Services' },
            { label: 'Calibration Start Date', value: '2024-01-15' },
            { label: 'Calibration End Date', value: '2025-01-15' },
          ]
        }
      },
      () => this.deleteAsset(),
      () => console.log('Delete operation cancelled')
    );
  }

  private confirmAllocateAssetDialog(): void {
    this.confirmationDialogService.showDialog(
      EDialogType.ALLOCATE,
      {
        recordDetails: {
          title: 'Allocate Asset',
          details: [
            { label: 'Asset Name', value: 'Digital Multimeter' },
            { label: 'Asset Model', value: 'Fluke 87V' },
            { label: 'Serial Number', value: 'FLK-87V-001' },
          ]
        }
      },
      () => this.allocateAsset(),
      () => console.log('Allocate operation cancelled')
    );
  }

  private confirmDeallocateAssetDialog(): void {
    this.confirmationDialogService.showDialog(
      EDialogType.DEALLOCATE,
      {
        recordDetails: {
          title: 'Deallocate Asset',
          details: [
            { label: 'Asset Name', value: 'Digital Multimeter' },
            { label: 'Asset Model', value: 'Fluke 87V' },
            { label: 'Serial Number', value: 'FLK-87V-001' },
          ]
        }
      },
      () => this.deallocateAsset(),
      () => console.log('Deallocate operation cancelled')
    );
  }

  private deleteAsset(): void {
    this.logger.info('Deleting asset');
    // Implement actual logic here
  }

  private allocateAsset(): void {
    this.logger.info('Allocating asset');
    // Implement actual logic here
  }

  private deallocateAsset(): void {
    this.logger.info('Deallocating asset');
    // Implement actual logic here
  }
}
