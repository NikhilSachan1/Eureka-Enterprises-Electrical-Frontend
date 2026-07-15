import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { IPageHeaderConfig } from '@shared/types';

@Component({
  selector: 'app-get-workforce-allocation',
  imports: [PageHeaderComponent],
  templateUrl: './get-workforce-allocation.component.html',
  styleUrl: './get-workforce-allocation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetWorkforceAllocationComponent {
  protected pageHeaderConfig = computed(() => this.getPageHeaderConfig());

  private getPageHeaderConfig(): IPageHeaderConfig {
    return {
      title: 'Workforce Allocation',
      subtitle:
        'See who is free or allocated, and manage site assignments from one place',
      showHeaderButton: false,
    };
  }
}
