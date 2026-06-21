import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { GetExpenseOutstandingComponent } from '@features/centralized-payment-management/expense-payment-management/components/get-expense-outstanding/get-expense-outstanding.component';
import { GetFuelExpenseOutstandingComponent } from '@features/centralized-payment-management/fuel-expense-payment-management/components/get-fuel-expense-outstanding/get-fuel-expense-outstanding.component';
import { GetVendorOutstandingComponent } from '@features/centralized-payment-management/vendor-payment-management/get-vendor-outstanding/get-vendor-outstanding.component';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { IPageHeaderConfig } from '@shared/types/page-header/page-header-config.interface';

@Component({
  selector: 'app-get-outstanding-balance',
  imports: [
    PageHeaderComponent,
    GetExpenseOutstandingComponent,
    GetFuelExpenseOutstandingComponent,
    GetVendorOutstandingComponent,
  ],
  templateUrl: './get-outstanding-balance.component.html',
  styleUrl: './get-outstanding-balance.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetOutstandingBalanceComponent {
  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  private getPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: 'Outstanding Balance',
      subtitle: 'View outstanding balance records',
      showHeaderButton: false,
    };
  }
}
