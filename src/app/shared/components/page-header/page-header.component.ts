import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  input,
  output,
  inject,
  OnDestroy,
} from '@angular/core';
import { Location, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [
    ButtonComponent,
    FormsModule,
    NgClass,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
  ],
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent implements OnDestroy {
  private readonly location = inject(Location);
  private readonly appPermissionService = inject(AppPermissionService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private appliedInitialSearch = false;

  // Input signals
  pageHeaderConfig = input<Partial<IPageHeaderConfig>>();
  /** Shown in the search box. Does not emit `onSearch`. */
  initialSearch = input('');

  protected finalPageHeaderConfig = computed(() => this.getPageHeaderConfig());
  protected goBackButtonConfig = computed(() => this.getGoBackButtonConfig());

  // Filter header buttons based on user permissions
  protected permittedHeaderButtons = computed(() =>
    this.getPermittedHeaderButtons()
  );

  // Output signals
  headerButtonClick = output<string>();
  onSearch = output<string>();

  protected searchValue = '';
  private searchDebounceTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => {
      const value = this.initialSearch().trim();
      if (!value || this.appliedInitialSearch) {
        return;
      }
      this.appliedInitialSearch = true;
      this.searchValue = value;
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.searchDebounceTimer);
  }

  protected onSearchInput(value: string): void {
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.onSearch.emit(value.trim());
    }, 400);
  }

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
