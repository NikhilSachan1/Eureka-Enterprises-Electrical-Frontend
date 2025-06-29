import { Component, computed, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { IPageHeaderConfig } from '../../models';
import { DEFAULT_PAGE_HEADER_CONFIG } from '../../config';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent {
  
  // Input signals
  pageHeaderConfig = input<Partial<IPageHeaderConfig>>();

  protected finalPageHeaderConfig = computed<IPageHeaderConfig>(() => this.getPageHeaderConfig());
  
  // Output signals
  headerButtonClick = output<void>();

  protected getPageHeaderConfig(): IPageHeaderConfig {
    return {
      ...DEFAULT_PAGE_HEADER_CONFIG,
      ...this.pageHeaderConfig()
    } as IPageHeaderConfig;
  }
} 