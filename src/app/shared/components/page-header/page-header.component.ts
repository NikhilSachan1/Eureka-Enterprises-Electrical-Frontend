import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  inject,
} from '@angular/core';
import { Location } from '@angular/common';
import {
  IButtonConfig,
  IPageHeaderConfig,
  EButtonSeverity,
  EButtonVariant,
} from '@shared/types';
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
  private readonly location = inject(Location);

  // Input signals
  pageHeaderConfig = input<Partial<IPageHeaderConfig>>();

  protected finalPageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected goBackButtonConfig = computed(() => this.getGoBackButtonConfig());

  // Output signals
  headerButtonClick = output<void>();

  protected getPageHeaderConfig(): IPageHeaderConfig {
    return {
      ...DEFAULT_PAGE_HEADER_CONFIG,
      ...this.pageHeaderConfig(),
    } as IPageHeaderConfig;
  }

  private getGoBackButtonConfig(): IButtonConfig {
    return {
      icon: 'pi pi-arrow-left',
      severity: EButtonSeverity.SECONDARY,
      variant: EButtonVariant.TEXT,
    } as IButtonConfig;
  }

  protected onGoBackClick(): void {
    this.location.back();
  }
}
