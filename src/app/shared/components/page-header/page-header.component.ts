import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  inject,
} from '@angular/core';
import { Location } from '@angular/common';
import { AppPermissionService } from '@core/services/app-permission.service';
import {
  IButtonConfig,
  IPageHeaderConfig,
  EButtonSeverity,
  EButtonVariant,
} from '@shared/types';
import { DEFAULT_PAGE_HEADER_CONFIG } from '@shared/config';
import { ButtonComponent } from '../button/button.component';
import { ICONS } from '@shared/constants';

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
  private readonly appPermissionService = inject(AppPermissionService);

  // Input signals
  pageHeaderConfig = input<Partial<IPageHeaderConfig>>();

  protected finalPageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected goBackButtonConfig = computed(() => this.getGoBackButtonConfig());

  // Filter header buttons based on user permissions
  protected permittedHeaderButtons = computed(() =>
    this.getPermittedHeaderButtons()
  );

  // Output signals
  // Emit a string action name so parent components can differentiate buttons
  headerButtonClick = output<string>();

  protected getPageHeaderConfig(): IPageHeaderConfig {
    return {
      ...DEFAULT_PAGE_HEADER_CONFIG,
      ...this.pageHeaderConfig(),
    } as IPageHeaderConfig;
  }

  private getGoBackButtonConfig(): IButtonConfig {
    return {
      icon: ICONS.COMMON.ARROW_LEFT,
      severity: EButtonSeverity.SECONDARY,
      variant: EButtonVariant.TEXT,
    } as IButtonConfig;
  }

  // Returns only the buttons the user has permission to see
  private getPermittedHeaderButtons(): Partial<IButtonConfig>[] {
    const config = this.finalPageHeaderConfig();
    if (!config.headerButtonConfig) {
      return [];
    }
    return this.appPermissionService.filterByPermission(
      config.headerButtonConfig
    );
  }

  protected onGoBackClick(): void {
    this.location.back();
  }
}
