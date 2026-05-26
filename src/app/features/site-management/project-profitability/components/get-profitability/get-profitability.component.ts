import {
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
  NgTemplateOutlet,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { APP_CONFIG } from '@core/config';
import { LoggerService } from '@core/services';
import { ProjectWorkspaceContextService } from '@features/site-management/project-management/services/project-workspace-context.service';
import { EmptyMessagesComponent } from '@shared/components/empty-messages/empty-messages.component';
import { SectionLoaderComponent } from '@shared/components/section-loader/section-loader.component';
import { ICONS } from '@shared/constants';
import { AppConfigurationService, AvatarService } from '@shared/services';
import { getMappedValueFromArrayOfObjects } from '@shared/utility';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { finalize } from 'rxjs';
import {
  IProjectProfitabilityGetFormDto,
  IProjectProfitabilityGetResponseDto,
} from '../../types/project-profitability.dto';
import {
  IProfitabilityDetailColumn,
  IProfitabilityDetailSection,
  IProjectProfitabilityReport,
  ProfitabilityDetailDialogType,
} from '../../types/project-profitability.interface';
import { ProjectProfitabilityService } from '../../services/project-profitability.service';

type RegularExpenseDetailView = 'category' | 'employee';

@Component({
  selector: 'app-get-profitability',
  imports: [
    ButtonModule,
    CurrencyPipe,
    DatePipe,
    DecimalPipe,
    DialogModule,
    EmptyMessagesComponent,
    NgTemplateOutlet,
    SectionLoaderComponent,
  ],
  templateUrl: './get-profitability.component.html',
  styleUrl: './get-profitability.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetProfitabilityComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(LoggerService);
  private readonly projectProfitabilityService = inject(
    ProjectProfitabilityService
  );
  private readonly workspaceContext = inject(ProjectWorkspaceContextService);
  private readonly avatarService = inject(AvatarService);
  private readonly appConfigurationService = inject(AppConfigurationService);

  protected readonly icons = ICONS;
  protected readonly APP_CONFIG = APP_CONFIG;
  protected readonly isLoading = signal(false);
  protected readonly report = signal<IProjectProfitabilityReport | null>(null);
  protected readonly hasSelectedProject =
    this.workspaceContext.selectedProjectId;
  protected readonly detailDialogVisible = signal(false);
  protected readonly detailDialogTitle = signal('');
  protected readonly detailDialogType =
    signal<ProfitabilityDetailDialogType | null>(null);
  protected readonly regularExpenseDetailView =
    signal<RegularExpenseDetailView>('category');
  protected readonly regularExpenseViewOptions: {
    label: string;
    value: RegularExpenseDetailView;
  }[] = [
    { label: 'Category wise', value: 'category' },
    { label: 'Employee wise', value: 'employee' },
  ];

  constructor() {
    effect(() => {
      const projectId = this.workspaceContext.selectedProjectId();
      this.workspaceContext.filterSubmitVersion();

      if (!projectId) {
        this.report.set(null);
        this.closeDetailDialog();
        return;
      }

      this.loadProjectProfitability(projectId);
    });
  }

  protected detailSections(
    vm: IProjectProfitabilityReport
  ): IProfitabilityDetailSection[] {
    const type = this.detailDialogType();
    if (!type) {
      return [];
    }

    switch (type) {
      case 'sales-invoices':
        return this.getSalesInvoiceDetailSections(vm);
      case 'vendor-invoices':
        return this.getVendorInvoiceDetailSections(vm);
      case 'employee-cost':
        return this.getEmployeeCostDetailSections(vm);
      case 'fuel-employee':
        return this.getFuelEmployeeDetailSections(vm);
      case 'regular-expense-detail':
        return this.getRegularExpenseDetailSections(vm);
      default:
        return [];
    }
  }

  protected openDetailDialog(
    type: ProfitabilityDetailDialogType,
    title: string
  ): void {
    this.detailDialogType.set(type);
    this.detailDialogTitle.set(title);
    this.detailDialogVisible.set(true);
  }

  protected closeDetailDialog(): void {
    this.detailDialogVisible.set(false);
    this.detailDialogType.set(null);
    this.detailDialogTitle.set('');
    this.regularExpenseDetailView.set('category');
  }

  protected onDetailDialogVisibilityChange(visible: boolean): void {
    if (visible) {
      this.detailDialogVisible.set(true);
      return;
    }
    this.closeDetailDialog();
  }

  protected openRegularExpenseDetailDialog(): void {
    this.regularExpenseDetailView.set('category');
    this.openDetailDialog('regular-expense-detail', 'Expense breakdown');
  }

  protected setRegularExpenseDetailView(view: RegularExpenseDetailView): void {
    this.regularExpenseDetailView.set(view);
  }

  protected detailColWidth(col: IProfitabilityDetailColumn): string | null {
    if (col.amount) {
      return '9rem';
    }
    if (col.type === 'avatar') {
      return '34%';
    }
    if (col.type === 'date') {
      return '9.5rem';
    }
    return null;
  }

  protected expenseCategoryLabel(value: string): string {
    return String(
      getMappedValueFromArrayOfObjects(
        this.appConfigurationService.expenseCategories(),
        value
      )
    );
  }

  protected getAvatarUrl(name: string): string {
    return this.avatarService.getAvatarFromName(name);
  }

  private getSalesInvoiceDetailSections(
    vm: IProjectProfitabilityReport
  ): IProfitabilityDetailSection[] {
    return [
      {
        rows: vm.metaSummary.salesSummary.salesInvoiceSummary
          .invoiceSummary as Record<string, unknown>[],
        columns: this.buildInvoiceColumns('clientName', 'Contractor'),
        emptyDescription:
          'There is no sales invoice detail available for this project.',
      },
    ];
  }

  private getVendorInvoiceDetailSections(
    vm: IProjectProfitabilityReport
  ): IProfitabilityDetailSection[] {
    return [
      {
        rows: vm.metaSummary.purchaseSummary.vendorInvoiceSummary
          .invoiceSummary as Record<string, unknown>[],
        columns: this.buildInvoiceColumns('vendorName', 'Vendor'),
        emptyDescription:
          'There is no vendor invoice detail available for this project.',
      },
    ];
  }

  private getEmployeeCostDetailSections(
    vm: IProjectProfitabilityReport
  ): IProfitabilityDetailSection[] {
    return [
      {
        rows: vm.expenseSummary.employeeCost.employeeWiseSummary as Record<
          string,
          unknown
        >[],
        columns: this.getEmployeeAmountColumns(),
        emptyDescription:
          'There is no employee cost detail available for this project.',
      },
    ];
  }

  private getFuelEmployeeDetailSections(
    vm: IProjectProfitabilityReport
  ): IProfitabilityDetailSection[] {
    return [
      {
        rows: vm.expenseSummary.operationalExpense.fuelExpense
          .employeeWiseSummary as Record<string, unknown>[],
        columns: this.getEmployeeAmountColumns(),
        emptyDescription:
          'There is no fuel expense detail available for this project.',
      },
    ];
  }

  private getRegularExpenseDetailSections(
    vm: IProjectProfitabilityReport
  ): IProfitabilityDetailSection[] {
    return this.regularExpenseDetailView() === 'category'
      ? [this.getRegularExpenseCategorySection(vm)]
      : [this.getRegularExpenseEmployeeSection(vm)];
  }

  private getRegularExpenseEmployeeSection(
    vm: IProjectProfitabilityReport
  ): IProfitabilityDetailSection {
    const regular = vm.expenseSummary.operationalExpense.regularExpense;

    return {
      rows: regular.employeeWiseSummary as Record<string, unknown>[],
      columns: [
        {
          field: 'employeeName',
          header: 'Employee',
          type: 'avatar',
          subtitleField: 'employeeCode',
        },
        {
          field: 'expenseType',
          header: 'Expense type',
          type: 'expense-category',
        },
        {
          field: 'expenseAmount',
          header: 'Amount',
          type: 'currency',
          amount: true,
        },
      ],
      emptyDescription: 'There is no employee expense detail available.',
    };
  }

  private getRegularExpenseCategorySection(
    vm: IProjectProfitabilityReport
  ): IProfitabilityDetailSection {
    const regular = vm.expenseSummary.operationalExpense.regularExpense;

    return {
      rows: regular.categoryWiseSummary as Record<string, unknown>[],
      columns: [
        { field: 'categoryName', header: 'Category', type: 'expense-category' },
        {
          field: 'amount',
          header: 'Amount',
          type: 'currency',
          amount: true,
        },
      ],
      emptyDescription: 'There is no category expense detail available.',
    };
  }

  private getEmployeeAmountColumns(): IProfitabilityDetailColumn[] {
    return [
      {
        field: 'employeeName',
        header: 'Employee',
        type: 'avatar',
      },
      { field: 'amount', header: 'Amount', type: 'currency', amount: true },
    ];
  }

  private buildInvoiceColumns(
    partyField: 'clientName' | 'vendorName',
    partyHeader: string
  ): IProfitabilityDetailColumn[] {
    return [
      {
        field: partyField,
        header: partyHeader,
        type: 'avatar',
        subtitleField: 'poNumber',
        subtitlePrefix: 'PO ',
      },
      { field: 'invoiceNumber', header: 'Invoice no.', type: 'text' },
      { field: 'invoiceDate', header: 'Date', type: 'date' },
      {
        field: 'invoiceAmount',
        header: 'Amount',
        type: 'currency',
        amount: true,
      },
    ];
  }

  private loadProjectProfitability(projectId: string): void {
    this.isLoading.set(true);
    this.report.set(null);
    this.closeDetailDialog();

    const paramData = this.prepareParamData(projectId);

    this.projectProfitabilityService
      .getProjectProfitability(paramData)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: IProjectProfitabilityGetResponseDto) => {
          this.report.set(response);
          this.logger.logUserAction(
            'Project profitability loaded successfully'
          );
        },
        error: error => {
          this.report.set(null);
          this.logger.logUserAction(
            'Failed to load project profitability',
            error
          );
        },
      });
  }

  private prepareParamData(projectId: string): IProjectProfitabilityGetFormDto {
    return {
      projectName: projectId,
    };
  }
}
