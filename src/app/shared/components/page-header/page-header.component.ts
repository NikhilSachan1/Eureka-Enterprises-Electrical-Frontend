import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { IPageHeaderConfig } from '@shared/models';
import { DEFAULT_PAGE_HEADER_CONFIG } from '@shared/config';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  // Input signals
  pageHeaderConfig = input<Partial<IPageHeaderConfig>>();

  protected finalPageHeaderConfig = computed<IPageHeaderConfig>(() =>
    this.getPageHeaderConfig()
  );

  // Output signals
  headerButtonClick = output<void>();

  protected getPageHeaderConfig(): IPageHeaderConfig {
    return {
      ...DEFAULT_PAGE_HEADER_CONFIG,
      ...this.pageHeaderConfig(),
    } as IPageHeaderConfig;
  }
}
